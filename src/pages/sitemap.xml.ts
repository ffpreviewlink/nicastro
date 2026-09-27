import type { APIRoute } from 'astro';

/**
 * Sitemap generata dalle pagine presenti in src/pages: aggiungere una pagina
 * .astro basta a includerla. Le pagine di errore sono escluse.
 */
const pages = import.meta.glob('./**/*.astro');

export const GET: APIRoute = ({ site }) => {
  const origin = site!.origin;
  const paths = Object.keys(pages)
    .map((file) => file.replace(/^\.\//, '').replace(/\.astro$/, ''))
    .filter((name) => name !== '404')
    .map((name) => (name === 'index' ? '/' : `/${name.replace(/(^|\/)index$/, '')}/`.replace(/\/+/g, '/')))
    .sort();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
