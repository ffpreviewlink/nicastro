// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Dominio pubblico del sito. Serve a canonical, Open Graph, sitemap.xml e robots.txt.
// [INSERIRE DOMINIO] → imposta la variabile SITE_URL in fase di deploy (es. https://www.nomecognome.it)
// oppure sostituisci il valore di fallback qui sotto.
const site = process.env.SITE_URL || 'https://www.example.com';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',
  // I font vengono scaricati in fase di build e serviti dal sito stesso:
  // nessuna richiesta a server terzi da parte del visitatore (performance + privacy).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      weights: [500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});
