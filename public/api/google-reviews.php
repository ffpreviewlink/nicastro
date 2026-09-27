<?php
/**
 * Endpoint server-side per le recensioni Google (Places API New) dello
 * Studio Optometrico Nicastro.
 *
 * - Il Place ID è fisso, definito qui sotto: non viene mai accettato da query string.
 * - La API key viene letta da una variabile d'ambiente o da un file .env accanto
 *   a questo script (mai committato, mai nel repository Git).
 * - Le risposte valide vengono salvate in cache/reviews.json per ridurre le
 *   chiamate a Google; se Google non risponde correttamente si usa la cache
 *   precedente, anche scaduta, pur di non mostrare un errore tecnico.
 * - Risponde sempre con JSON, sempre con HTTP 200 quando i dati non sono
 *   disponibili (il frontend distingue tramite il campo "available").
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');

const PLACE_ID = 'ChIJAxnfu4PFLRMRqZ-Zw4r50fI';
const FIELD_MASK = 'displayName,rating,userRatingCount,googleMapsUri,reviews';
const CACHE_TTL_SECONDS = 12 * 60 * 60; // 12 ore
const CACHE_FILE = __DIR__ . '/cache/reviews.json';
const ENV_FILE = __DIR__ . '/.env';
const HTTP_CONNECT_TIMEOUT = 3;
const HTTP_TOTAL_TIMEOUT = 6;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
// Stesso dominio del frontend: nessun header CORS (niente wildcard, niente cross-origin).

function send_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Cache-Control: public, max-age=300');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function load_api_key(): ?string
{
    $fromEnv = getenv('GOOGLE_PLACES_API_KEY');
    if ($fromEnv !== false && trim((string) $fromEnv) !== '') {
        return trim((string) $fromEnv);
    }

    if (!is_readable(ENV_FILE)) {
        return null;
    }

    $lines = file(ENV_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return null;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim(trim($value), "\"'");
        if ($key === 'GOOGLE_PLACES_API_KEY' && $value !== '') {
            return $value;
        }
    }

    return null;
}

/** @return array{fetchedAt: int, payload: array}|null */
function read_cache(): ?array
{
    if (!is_readable(CACHE_FILE)) {
        return null;
    }

    $fp = @fopen(CACHE_FILE, 'r');
    if ($fp === false) {
        return null;
    }

    flock($fp, LOCK_SH);
    $contents = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    if ($contents === false) {
        return null;
    }

    $decoded = json_decode($contents, true);
    if (!is_array($decoded) || !isset($decoded['fetchedAt'], $decoded['payload'])) {
        return null;
    }

    return $decoded;
}

function write_cache(array $payload): void
{
    $dir = dirname(CACHE_FILE);
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }

    $tmpFile = CACHE_FILE . '.tmp-' . getmypid();
    $fp = @fopen($tmpFile, 'w');
    if ($fp === false) {
        return;
    }

    flock($fp, LOCK_EX);
    fwrite($fp, json_encode(['fetchedAt' => time(), 'payload' => $payload], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    flock($fp, LOCK_UN);
    fclose($fp);
    @rename($tmpFile, CACHE_FILE);
}

function is_fresh(int $fetchedAt): bool
{
    return (time() - $fetchedAt) < CACHE_TTL_SECONDS;
}

/** @return array{0: int, 1: string, 2: ?string} [statusCode, body, curlError] */
function fetch_from_google(string $apiKey): array
{
    $url = 'https://places.googleapis.com/v1/places/' . PLACE_ID . '?languageCode=it';

    if (!function_exists('curl_init')) {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "X-Goog-Api-Key: {$apiKey}\r\nX-Goog-FieldMask: " . FIELD_MASK . "\r\n",
                'timeout' => HTTP_TOTAL_TIMEOUT,
                'ignore_errors' => true,
            ],
        ]);

        $body = @file_get_contents($url, false, $context);
        if ($body === false) {
            return [0, '', 'file_get_contents fallita'];
        }

        $status = 0;
        if (isset($http_response_header[0]) && preg_match('#HTTP/\S+\s(\d+)#', $http_response_header[0], $m)) {
            $status = (int) $m[1];
        }

        return [$status, $body, null];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => HTTP_CONNECT_TIMEOUT,
        CURLOPT_TIMEOUT => HTTP_TOTAL_TIMEOUT,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_HTTPHEADER => [
            'X-Goog-Api-Key: ' . $apiKey,
            'X-Goog-FieldMask: ' . FIELD_MASK,
        ],
    ]);

    $body = curl_exec($ch);
    if ($body === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return [0, '', $error];
    }

    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$status, $body, null];
}

function normalize_review(array $review): ?array
{
    $author = is_array($review['authorAttribution'] ?? null) ? $review['authorAttribution'] : [];
    $authorName = $author['displayName'] ?? null;

    $textObj = is_array($review['text'] ?? null) ? $review['text'] : null;
    $originalObj = is_array($review['originalText'] ?? null) ? $review['originalText'] : null;

    $text = $textObj['text'] ?? ($originalObj['text'] ?? null);

    // Una recensione è "tradotta" solo se abbiamo sia il testo mostrato sia
    // l'originale, con lingue dichiarate esplicitamente diverse. In ogni altro
    // caso (dati mancanti, stessa lingua) non si presume nulla: translated=false.
    $translated = $textObj !== null
        && $originalObj !== null
        && isset($textObj['languageCode'], $originalObj['languageCode'])
        && $textObj['languageCode'] !== $originalObj['languageCode'];

    $originalText = $translated ? ($originalObj['text'] ?? null) : null;

    // Senza autore o senza contenuto la recensione non è presentabile: la si scarta
    // piuttosto che mostrarla incompleta.
    if (!$authorName || ($text === null && !isset($review['rating']))) {
        return null;
    }

    return [
        'authorName' => $authorName,
        'authorPhotoUri' => $author['photoUri'] ?? null,
        'authorProfileUri' => $author['uri'] ?? null,
        'rating' => isset($review['rating']) ? (int) $review['rating'] : null,
        'text' => $text,
        'translated' => $translated,
        'originalText' => $originalText,
        'relativeTime' => $review['relativePublishTimeDescription'] ?? null,
        'reviewUri' => $review['googleMapsUri'] ?? null,
    ];
}

function normalize_place_response(array $json): array
{
    $reviews = [];
    foreach (($json['reviews'] ?? []) as $review) {
        if (!is_array($review)) {
            continue;
        }
        $normalized = normalize_review($review);
        if ($normalized !== null) {
            $reviews[] = $normalized;
        }
    }

    return [
        'available' => true,
        'name' => $json['displayName']['text'],
        'rating' => isset($json['rating']) ? (float) $json['rating'] : null,
        'userRatingCount' => isset($json['userRatingCount']) ? (int) $json['userRatingCount'] : null,
        'googleMapsUri' => $json['googleMapsUri'] ?? null,
        'reviews' => $reviews,
    ];
}

// --------------------------------------------------------------------------
// Flusso principale
// --------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    send_json(['available' => false], 405);
}

$cache = read_cache();

if ($cache !== null && is_fresh($cache['fetchedAt'])) {
    send_json($cache['payload']);
}

$apiKey = load_api_key();

if ($apiKey === null) {
    error_log('google-reviews: GOOGLE_PLACES_API_KEY non configurata');
    send_json($cache['payload'] ?? ['available' => false]);
}

try {
    [$status, $body, $curlError] = fetch_from_google($apiKey);

    if ($curlError !== null) {
        throw new RuntimeException('richiesta a Google fallita: ' . $curlError);
    }
    if ($status !== 200) {
        throw new RuntimeException('Google ha risposto con HTTP ' . $status);
    }

    $json = json_decode($body, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($json)) {
        throw new RuntimeException('risposta JSON non valida');
    }
    if (!isset($json['displayName']['text'])) {
        throw new RuntimeException('risposta incompleta (manca displayName)');
    }

    $payload = normalize_place_response($json);
    write_cache($payload);
    send_json($payload);
} catch (Throwable $e) {
    error_log('google-reviews: ' . $e->getMessage());
    send_json($cache['payload'] ?? ['available' => false]);
}
