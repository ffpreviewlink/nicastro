#!/usr/bin/env node
/**
 * Snapshot dei testi del sito costruito (dist/), senza dipendenze.
 *
 *   node scripts/text-snapshot.mjs write <cartella>   salva uno snapshot per ogni pagina
 *   node scripts/text-snapshot.mjs check <cartella>   confronta dist/ con lo snapshot salvato
 *
 * Per ogni pagina HTML estrae, nell'ordine del documento: i testi visibili (script e style
 * esclusi), gli attributi che portano testo (alt, title, aria-*, placeholder, value, content
 * dei meta, href dei link) e i JSON-LD. Gli spazi vengono normalizzati; le classi, gli stili
 * e gli id generati dal build non fanno parte del confronto.
 * La baseline va scritta UNA volta, sul sito prima del restyling, e non va rigenerata.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const [mode, dir] = process.argv.slice(2);
const DIST = 'dist';
if (!['write', 'check'].includes(mode) || !dir) {
  console.error('uso: text-snapshot.mjs <write|check> <cartella-snapshot>');
  process.exit(2);
}

const TEXT_ATTRS = ['alt', 'title', 'aria-label', 'aria-description', 'placeholder', 'value', 'content', 'href', 'label'];
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? m;
  });
const norm = (s) => decode(s).replace(/\s+/g, ' ').trim();

function walk(d) {
  return readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function extract(html) {
  const out = [];
  const re = /<!--[\s\S]*?-->|<[!/?][^>]*>|<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>|<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) {
      if (m[1].toLowerCase() === 'script' && /application\/ld\+json/.test(m[2])) {
        try {
          out.push('JSONLD ' + JSON.stringify(JSON.parse(m[3])));
        } catch {
          out.push('JSONLD-RAW ' + norm(m[3]));
        }
      }
    } else if (m[4]) {
      const tag = m[4].toLowerCase();
      const attrs = m[5];
      const ar = /([a-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
      let a;
      while ((a = ar.exec(attrs))) {
        const name = a[1].toLowerCase();
        const val = norm(a[2] ?? a[3] ?? a[4] ?? '');
        if (!val) continue;
        if (name === 'content' && tag !== 'meta') continue;
        if (name === 'value' && !['input', 'button', 'option'].includes(tag)) continue;
        if (name === 'href' && !['a', 'link'].includes(tag)) continue;
        if (name === 'label' && tag !== 'option') continue;
        if (TEXT_ATTRS.includes(name) || name.startsWith('aria-')) {
          // gli id/riferimenti aria generati non sono testo
          if (['aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns', 'aria-hidden', 'aria-expanded', 'aria-selected', 'aria-current', 'aria-pressed', 'aria-live', 'aria-atomic', 'aria-haspopup', 'aria-orientation', 'aria-roledescription', 'aria-modal', 'aria-disabled', 'aria-required', 'aria-invalid'].includes(name)) continue;
          // i nomi dei file generati dal build cambiano con il contenuto (hash): non sono testo
          out.push(`@[${name}] ${val.replace(/^(\/_astro\/(?:[\w-]+\/)*[\w-]+)\.[\w-]{8}(\.\w+)$/, '$1.*$2')}`);
        }
      }
    } else if (m[6]) {
      const t = norm(m[6]);
      if (t) out.push(t);
    }
  }
  return out;
}

const routeOf = (f) => '/' + relative(DIST, f).replace(/index\.html$/, '').replace(/\.html$/, '');
const pages = walk(DIST).filter((f) => f.endsWith('.html')).sort();
const other = ['sitemap.xml', 'robots.txt'].map((n) => join(DIST, n)).filter(existsSync);
const snap = {};
for (const f of pages) snap[routeOf(f)] = extract(readFileSync(f, 'utf8')).join('\n');
for (const f of other) snap['/' + relative(DIST, f)] = readFileSync(f, 'utf8').replace(/\s+/g, ' ').trim();

const file = (route) => join(dir, (route === '/' ? 'index' : route.replace(/^\/|\/$/g, '').replace(/\//g, '__')) + '.txt');
if (mode === 'write') {
  mkdirSync(dir, { recursive: true });
  const hashes = [];
  for (const [r, t] of Object.entries(snap)) {
    writeFileSync(file(r), t + '\n');
    hashes.push(`${createHash('sha256').update(t).digest('hex')}  ${r}`);
  }
  writeFileSync(join(dir, 'SHA256SUMS'), hashes.join('\n') + '\n');
  console.log(`snapshot scritto: ${hashes.length} pagine in ${dir}`);
} else {
  let bad = 0;
  for (const [r, t] of Object.entries(snap)) {
    const f = file(r);
    if (!existsSync(f)) { console.log(`NUOVA pagina non in baseline: ${r}`); bad++; continue; }
    // I fogli di stile generati dal build (nome con hash, e quanti ne servono a una pagina) non sono testo
    const notCss = (l) => !/^@\[href\] \/_astro\/[\w./*-]+\.css$/.test(l);
    const a = readFileSync(f, 'utf8').replace(/\n$/, '').split('\n').filter(notCss);
    const b = t.split('\n').filter(notCss);
    if (a.join('\n') === b.join('\n')) { console.log(`ok    ${r}  (${b.length} voci)`); continue; }
    bad++;
    console.log(`DIFF  ${r}`);
    const set = (x) => new Map(x.map((v, i) => [v, i]));
    const A = set(a), B = set(b);
    for (const v of a) if (!B.has(v)) console.log(`   - ${v.slice(0, 200)}`);
    for (const v of b) if (!A.has(v)) console.log(`   + ${v.slice(0, 200)}`);
    if (a.length === b.length && [...a].sort().join() === [...b].sort().join()) console.log('   (stesse voci, ordine diverso)');
  }
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.txt'))) {
    // pagine in baseline non più generate
    const route = Object.keys(snap).find((r) => file(r) === join(dir, f));
    if (!route) { console.log(`MANCANTE in dist: ${f}`); bad++; }
  }
  console.log(bad ? `\nFALLITO: ${bad} differenze` : '\nTESTI IDENTICI alla baseline');
  process.exit(bad ? 1 : 0);
}
