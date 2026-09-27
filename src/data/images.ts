import { site } from './site';

/**
 * Immagini del sito. Per sostituire un placeholder basta sovrascrivere il file
 * in /public/images con la foto reale (stesso nome) e aggiornare qui il testo
 * alternativo, che deve descrivere la foto vera.
 *
 * Suggerimento: esportare le foto già ridimensionate (max 1600 px sul lato lungo,
 * JPG/WebP sotto i 250 KB): i file in /public non vengono ottimizzati da Astro.
 * Le proporzioni dei riquadri sono fisse: la foto viene ritagliata, non deformata.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** true finché il file è un segnaposto: il componente lo marca con data-placeholder. */
  placeholder: boolean;
}

const placeholder = (
  file: string,
  width: number,
  height: number,
  alt: string,
): SiteImage => ({ src: `/images/${file}`, width, height, alt, placeholder: true });

export const images = {
  professionista: placeholder(
    'placeholder-professionista.jpg',
    1000,
    1250,
    `Ritratto di ${site.name}`,
  ),
  bambini: placeholder('placeholder-bambini.jpg', 1200, 900, 'Un bambino durante un esercizio visivo'),
  adulti: placeholder('placeholder-adulti.jpg', 1200, 900, 'Un adulto durante una valutazione visiva'),
  sportivi: placeholder('placeholder-sportivi.jpg', 1200, 900, 'Un atleta durante un esercizio visivo'),
  analisiVisiva: placeholder(
    'placeholder-analisi-visiva.jpg',
    1200,
    800,
    "Un momento dell’analisi visiva optometrica",
  ),
  rieducazioneVisiva: placeholder(
    'placeholder-rieducazione-visiva.jpg',
    1200,
    800,
    'Una seduta di rieducazione visiva',
  ),
  potenziamentoSportivo: placeholder(
    'placeholder-potenziamento-sportivo.jpg',
    1200,
    800,
    'Un esercizio di potenziamento visivo sportivo',
  ),
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
