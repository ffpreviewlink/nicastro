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
  /** Punto di messa a fuoco del ritaglio (object-position). Default: centro. */
  position?: string;
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
  professionista: {
    src: '/images/professionista.jpg',
    width: 960,
    height: 1200,
    alt: `${site.name} in camice bianco con uno strumento per l’esame della vista in mano`,
    position: 'center 25%',
    placeholder: false,
  },
  bambini: {
    src: '/images/bambini-analisi-visiva.jpg',
    width: 921,
    height: 1218,
    alt: 'Un bambino con occhiali rosso-verdi osserva una scheda per la valutazione della visione tridimensionale',
    position: 'center 38%',
    placeholder: false,
  },
  bambiniLavagna: {
    src: '/images/bambini-lavagna.jpg',
    width: 921,
    height: 1216,
    alt: 'Una bambina di spalle osserva una lavagna con schede e tabelle di lettere per un esercizio visivo',
    position: 'center 66%',
    placeholder: false,
  },
  bambiniTavolo: {
    src: '/images/bambini-tavolo.jpg',
    width: 921,
    height: 683,
    alt: 'Una bambina scrive a un tavolo con schede, matite e costruzioni colorate durante un’attività visiva',
    placeholder: false,
  },
  adulti: placeholder('placeholder-adulti.jpg', 1200, 900, 'Un adulto durante una valutazione visiva'),
  sportivi: placeholder('placeholder-sportivi.jpg', 1200, 900, 'Un atleta durante un esercizio visivo'),
  analisiVisivaStrumenti: {
    src: '/images/analisi-strumenti.jpg',
    width: 1200,
    height: 1584,
    alt: 'Strumenti per la valutazione delle abilità visive: una scheda con palloni, una cordicella con perline e lenti di prova',
    position: 'center 51%',
    placeholder: false,
  },
  analisiVisivaTavolo: {
    src: '/images/analisi-tavolo.jpg',
    width: 1400,
    height: 780,
    alt: 'Strumenti optometrici su un tavolo: cassetta delle lenti di prova, test stereoscopico e occhiali rosso-verdi',
    placeholder: false,
  },
  analisiVisivaLavagna: {
    src: '/images/analisi-lavagna.jpg',
    width: 1400,
    height: 778,
    alt: 'Una lavagna con schede e test visivi appesi con magneti colorati',
    position: '8% center',
    placeholder: false,
  },
  rieducazioneVisiva: {
    src: '/images/rieducazione-visiva.jpg',
    width: 921,
    height: 1218,
    alt: 'Un paziente con occhiali rosso-verdi durante un esercizio di rieducazione visiva su tablet',
    position: 'center 63%',
    placeholder: false,
  },
  potenziamentoSportivo: placeholder(
    'placeholder-potenziamento-sportivo.jpg',
    1200,
    800,
    'Un esercizio di potenziamento visivo sportivo',
  ),
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
