// Adatta l'output statico (già generato da `astro build`) per essere pubblicato
// sotto un sotto-percorso di GitHub Pages (es. https://utente.github.io/nicastro/).
//
// Il sito è scritto assumendo di vivere alla radice di un dominio (link tipo
// "/chi-sono/", "/images/foto.jpg", ecc: vedi README). Questo script NON tocca
// il codice sorgente né la configurazione usata per il deploy reale su Aruba:
// riscrive solo i file già generati in dist/, dopo la build, solo in questa
// pipeline di anteprima.
//
// Cosa fa, sui soli file dist/**/*.{html,xml,txt}:
// 1. Prefissa ogni riferimento assoluto alla radice (href="/...", src="/...",
//    action="/...", url(/...)) con BASE_PATH.
// 2. Prefissa ogni URL assoluto che inizia con ORIGIN (canonical, Open Graph,
//    JSON-LD, sitemap.xml, robots.txt) con BASE_PATH.
// 3. Aggiunge dist/.nojekyll, perché GitHub Pages processa per default con
//    Jekyll, che ignora le cartelle che iniziano con "_" (es. "_astro/",
//    dove Astro mette CSS/JS/font): senza questo file il sito si pubblica
//    ma senza stile.
//
// Endpoint PHP delle recensioni Google: non serve riscriverlo. GitHub Pages
// non esegue PHP, quindi /api/google-reviews.php non risponderà in ogni caso;
// il componente GoogleReviews.astro gestisce già questo caso mostrando lo
// stato vuoto, senza errori in console (comportamento verificato).

import { readdirSync, readFileSync, writeFileSync, statSync, writeFileSync as writeFile } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
const BASE_PATH = process.env.BASE_PATH; // es. "/nicastro"
const ORIGIN = process.env.SITE_URL; // es. "https://fuffafederico.github.io"

if (!BASE_PATH || !BASE_PATH.startsWith('/') || BASE_PATH.endsWith('/')) {
  throw new Error(`BASE_PATH non valido: "${BASE_PATH}" (atteso es. "/nicastro", senza slash finale)`);
}
if (!ORIGIN) {
  throw new Error('SITE_URL mancante');
}

const TEXT_EXTENSIONS = new Set(['.html', '.xml', '.txt']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) walk(full, out);
    else if (TEXT_EXTENSIONS.has(extname(entry))) out.push(full);
  }
  return out;
}

const files = walk(DIST);
let touched = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');

  const rewritten = original
    // URL assoluti (canonical, Open Graph, JSON-LD, sitemap, robots.txt)
    .replaceAll(`${ORIGIN}/`, `${ORIGIN}${BASE_PATH}/`)
    // Riferimenti radice-assoluti in href/src/action
    .replace(/(href|src|action)="\//g, `$1="${BASE_PATH}/`)
    // CSS url(/...) nei blocchi <style> inline (font, eventuali immagini di sfondo):
    // Astro emette gli url dei font tra virgolette, es. url("/_astro/fonts/...woff2")
    .replace(/url\((["']?)\//g, `url($1${BASE_PATH}/`);

  if (rewritten !== original) {
    writeFileSync(file, rewritten);
    touched++;
  }
}

writeFile(join(DIST, '.nojekyll'), '');

console.log(`prepare-gh-pages: ${touched}/${files.length} file riscritti per il sotto-percorso ${BASE_PATH}, aggiunto .nojekyll.`);
