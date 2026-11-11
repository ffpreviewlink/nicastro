<?php
/**
 * Endpoint del modulo di contatto: riceve nome, recapito e messaggio e li spedisce
 * via SMTP autenticato alla casella del professionista.
 *
 * - Le credenziali SMTP e il destinatario stanno nel file .env accanto a questo script
 *   (mai nel repository, non scaricabile via HTTP: vedi .htaccess) oppure in variabili
 *   d'ambiente. Chiavi: SMTP_USER, SMTP_PASSWORD; facoltative: MAIL_TO (default: lo stesso
 *   indirizzo del mittente, cioè i messaggi arrivano nella casella info@), SMTP_HOST
 *   (default smtps.aruba.it), SMTP_PORT (default 465), SMTP_SECURE («ssl» = connessione già
 *   cifrata, «starttls»; default: ssl sulla 465, starttls sulle altre porte), MAIL_FROM
 *   (default SMTP_USER), MAIL_FROM_NAME.
 * - Il mittente (From) deve essere una casella reale del dominio: Aruba può rifiutare
 *   i messaggi con un mittente diverso da quello autenticato.
 * - Difese: solo POST, controllo dell'origine, campo trappola per i bot, limiti di
 *   lunghezza, rimozione di ritorni a capo dalle intestazioni, massimo di invii per
 *   indirizzo IP all'ora.
 * - Risponde con JSON. Gli errori tecnici (server SMTP, password) finiscono solo nel
 *   log degli errori del server, mai nella risposta al visitatore.
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');

const ENV_FILE = __DIR__ . '/.env';
const RATE_FILE = __DIR__ . '/cache/contact-rate.json';
const RATE_MAX_PER_WINDOW = 5;
const RATE_WINDOW_SECONDS = 3600;
const MAX_NAME = 100;
const MAX_CONTACT = 150;
const MAX_MESSAGE = 5000;
const SMTP_TIMEOUT = 12;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
// Stesso dominio del frontend: nessun header CORS.

function respond(bool $ok, int $status, string $message = ''): void
{
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

/** @return array<string, string> */
function load_env_file(): array
{
    if (!is_readable(ENV_FILE)) {
        return [];
    }
    $lines = file(ENV_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return [];
    }
    $values = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $values[trim($key)] = trim(trim($value), "\"'");
    }
    return $values;
}

/** Legge una impostazione: prima l'ambiente, poi il file .env. */
function setting(string $key, ?string $default = null): ?string
{
    static $file = null;
    $file ??= load_env_file();

    $fromEnv = getenv($key);
    if ($fromEnv !== false && trim((string) $fromEnv) !== '') {
        return trim((string) $fromEnv);
    }
    return isset($file[$key]) && $file[$key] !== '' ? $file[$key] : $default;
}

/** Toglie caratteri di controllo e ritorni a capo: per i valori che finiscono in intestazioni o righe singole. */
function single_line(string $value): string
{
    return trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '');
}

/** Normalizza a capo e toglie i caratteri di controllo (tranne a capo e tab) dal testo libero. */
function clean_text(string $value): string
{
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    return trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '');
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function encode_header_text(string $value): string
{
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

function is_email(string $value): bool
{
    return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
}

/** Il browser invia l'Origin sulle POST: se c'è deve essere questo stesso sito. */
function same_origin(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return true;
    }
    $originHost = parse_url($origin, PHP_URL_HOST);
    $host = preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? ''));
    return is_string($originHost) && strcasecmp($originHost, (string) $host) === 0;
}

/**
 * Limite di invii per IP. Se la cartella cache non è scrivibile il limite semplicemente
 * non si applica: meglio ricevere un messaggio in più che perderne uno vero.
 */
function rate_limited(): bool
{
    $dir = dirname(RATE_FILE);
    if (!is_dir($dir) && !@mkdir($dir, 0775, true)) {
        return false;
    }
    $fp = @fopen(RATE_FILE, 'c+');
    if ($fp === false) {
        return false;
    }
    flock($fp, LOCK_EX);

    $now = time();
    $raw = stream_get_contents($fp);
    $data = is_string($raw) && $raw !== '' ? json_decode($raw, true) : [];
    $data = is_array($data) ? $data : [];

    // L'IP non viene salvato in chiaro
    $key = hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $recent = array_values(array_filter(
        (array) ($data[$key] ?? []),
        static fn($t) => is_int($t) && $t > $now - RATE_WINDOW_SECONDS
    ));

    $limited = count($recent) >= RATE_MAX_PER_WINDOW;
    if (!$limited) {
        $recent[] = $now;
    }
    $data[$key] = $recent;
    foreach ($data as $k => $times) {
        if (!is_array($times) || $times === [] || max($times) <= $now - RATE_WINDOW_SECONDS) {
            unset($data[$k]);
        }
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    return $limited;
}

/** Legge una risposta SMTP (anche su più righe) e verifica il codice. */
function smtp_expect($fp, array $okCodes): string
{
    $reply = '';
    while (($line = fgets($fp, 1024)) !== false) {
        $reply .= $line;
        // L'ultima riga di una risposta ha uno spazio dopo il codice ("250 ..."), le altre un trattino
        if (strlen($line) < 4 || $line[3] === ' ') {
            break;
        }
    }
    $code = (int) substr($reply, 0, 3);
    if (!in_array($code, $okCodes, true)) {
        throw new RuntimeException('SMTP ha risposto: ' . trim($reply));
    }
    return $reply;
}

function smtp_command($fp, string $command, array $okCodes): string
{
    fwrite($fp, $command . "\r\n");
    return smtp_expect($fp, $okCodes);
}

/**
 * Spedisce un messaggio di testo via SMTP autenticato (AUTH LOGIN).
 * Cifratura «ssl»: connessione già cifrata (porta 465). «starttls»: si passa alla cifratura dopo EHLO.
 *
 * @throws RuntimeException se qualunque passo fallisce
 */
function smtp_send(array $cfg, string $to, string $subject, string $body, ?string $replyTo): void
{
    $implicitTls = $cfg['secure'] === 'ssl';
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'peer_name' => $cfg['host'],
            'crypto_method' => STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT
                | (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT') ? STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT : 0),
        ],
    ]);

    $fp = @stream_socket_client(
        ($implicitTls ? 'ssl://' : 'tcp://') . $cfg['host'] . ':' . $cfg['port'],
        $errno,
        $errstr,
        SMTP_TIMEOUT,
        STREAM_CLIENT_CONNECT,
        $context
    );
    if ($fp === false) {
        throw new RuntimeException("Connessione a {$cfg['host']}:{$cfg['port']} non riuscita ($errno $errstr)");
    }
    stream_set_timeout($fp, SMTP_TIMEOUT);

    try {
        $domain = substr(strrchr($cfg['from'], '@') ?: '@localhost', 1);

        smtp_expect($fp, [220]);
        smtp_command($fp, 'EHLO ' . $domain, [250]);

        if (!$implicitTls) {
            smtp_command($fp, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT)) {
                throw new RuntimeException('Impossibile attivare STARTTLS');
            }
            smtp_command($fp, 'EHLO ' . $domain, [250]);
        }

        smtp_command($fp, 'AUTH LOGIN', [334]);
        smtp_command($fp, base64_encode($cfg['user']), [334]);
        smtp_command($fp, base64_encode($cfg['password']), [235]);

        smtp_command($fp, 'MAIL FROM:<' . $cfg['from'] . '>', [250]);
        smtp_command($fp, 'RCPT TO:<' . $to . '>', [250, 251]);
        smtp_command($fp, 'DATA', [354]);

        $headers = [
            'Date: ' . date('r'),
            'From: ' . encode_header_text($cfg['fromName']) . ' <' . $cfg['from'] . '>',
            'To: <' . $to . '>',
        ];
        if ($replyTo !== null) {
            $headers[] = 'Reply-To: <' . $replyTo . '>';
        }
        $headers[] = 'Subject: ' . encode_header_text($subject);
        $headers[] = 'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . '>';
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: base64';

        // Corpo in base64: nessun problema di punti isolati o righe lunghe
        $payload = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body), 76, "\r\n");
        fwrite($fp, $payload . ".\r\n");
        smtp_expect($fp, [250]);

        smtp_command($fp, 'QUIT', [221]);
    } finally {
        fclose($fp);
    }
}

// ---------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 405, 'Metodo non consentito.');
}

if (!same_origin()) {
    respond(false, 403, 'Richiesta non consentita.');
}

// Campo trappola: un bot lo compila, una persona no. Si risponde "ok" per non dargli indizi.
if (trim((string) ($_POST['_gotcha'] ?? '')) !== '') {
    respond(true, 200, 'Messaggio inviato.');
}

$name = single_line((string) ($_POST['nome'] ?? ''));
$contact = single_line((string) ($_POST['contatto'] ?? ''));
$message = clean_text((string) ($_POST['messaggio'] ?? ''));

if ($name === '' || $contact === '' || $message === '') {
    respond(false, 422, 'Compila tutti i campi.');
}
if (
    text_length($name) > MAX_NAME
    || text_length($contact) > MAX_CONTACT
    || text_length($message) > MAX_MESSAGE
    || text_length($message) < 10
) {
    respond(false, 422, 'Controlla la lunghezza dei campi.');
}

$cfg = [
    'host' => setting('SMTP_HOST', 'smtps.aruba.it'),
    'port' => (int) setting('SMTP_PORT', '465'),
    'secure' => strtolower((string) setting('SMTP_SECURE', (int) setting('SMTP_PORT', '465') === 465 ? 'ssl' : 'starttls')),
    'user' => setting('SMTP_USER'),
    'password' => setting('SMTP_PASSWORD'),
    'from' => setting('MAIL_FROM') ?? setting('SMTP_USER'),
    'fromName' => setting('MAIL_FROM_NAME', 'Sito Studio Optometrico Nicastro'),
];
$to = setting('MAIL_TO') ?? $cfg['from'];

if (
    $cfg['user'] === null || $cfg['password'] === null
    || !is_email((string) $cfg['from']) || !is_email($to)
    || !in_array($cfg['secure'], ['ssl', 'starttls'], true)
) {
    error_log('contact.php: configurazione mancante o non valida (SMTP_USER, SMTP_PASSWORD, MAIL_FROM, MAIL_TO, SMTP_SECURE).');
    respond(false, 503, 'Il modulo non è al momento disponibile.');
}

if (rate_limited()) {
    respond(false, 429, 'Troppi invii ravvicinati: riprova più tardi.');
}

$body = "Nuova richiesta dal sito\n\n"
    . "Nome: {$name}\n"
    . "Recapito: {$contact}\n\n"
    . "Messaggio:\n{$message}\n\n"
    . "--\nInviato dal modulo contatti il " . date('d/m/Y H:i') . "\n";

try {
    smtp_send(
        $cfg,
        $to,
        'Richiesta dal sito: ' . (function_exists('mb_substr') ? mb_substr($name, 0, 60, 'UTF-8') : substr($name, 0, 60)),
        $body,
        is_email($contact) ? $contact : null
    );
} catch (Throwable $e) {
    error_log('contact.php: invio non riuscito. ' . $e->getMessage());
    respond(false, 502, 'Non è stato possibile inviare il messaggio.');
}

respond(true, 200, 'Messaggio inviato.');
