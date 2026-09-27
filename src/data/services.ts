import type { ImageKey } from './images';

/**
 * I tre servizi. Nome, prezzo, durata, testi di sintesi e messaggio WhatsApp
 * si modificano solo qui: home, elenco servizi, pagine di dettaglio, menu,
 * footer e dati strutturati leggono da questo file.
 */
export interface Service {
  slug: string;
  path: string;
  name: string;
  /** Titolo breve per link e navigazione. */
  shortName: string;
  summary: string;
  /** A chi si rivolge, in una riga. */
  audience: string;
  /** null = prezzo non ancora definito (si mostra priceLabel). */
  price: { amount: number; unit: string } | null;
  priceLabel?: string;
  /** Mostrata solo se presente. Un segnaposto [ ... ] compare evidenziato finché non viene sostituito. */
  duration?: string;
  image: ImageKey;
  /** Etichetta discreta sulla card. */
  note?: string;
  whatsappMessage: string;
  seo: { title: string; description: string };
}

export const services: Service[] = [
  {
    slug: 'analisi-visiva-optometrica',
    path: '/servizi/analisi-visiva-optometrica/',
    name: 'Analisi visiva optometrica',
    shortName: 'Analisi visiva',
    summary:
      'Una valutazione delle abilità visive, per capire come gli occhi lavorano nelle attività di ogni giorno.',
    // TODO(cliente): confermare a quali pubblici si rivolge l'analisi
    audience: 'Bambini, adulti e sportivi',
    price: { amount: 75, unit: 'una tantum' },
    duration: '1 ora',
    image: 'analisiVisiva',
    whatsappMessage:
      "Buongiorno, vorrei avere informazioni sull’analisi visiva optometrica.",
    seo: {
      title: 'Analisi visiva optometrica',
      description:
        "Che cos’è l’analisi visiva optometrica, cosa viene valutato e come funziona. Valutazione delle abilità visive per bambini, adulti e sportivi. 75 € una tantum.",
    },
  },
  {
    slug: 'rieducazione-visiva',
    path: '/servizi/rieducazione-visiva/',
    name: 'Rieducazione visiva (Visual Training)',
    shortName: 'Rieducazione visiva',
    summary:
      "Un percorso di sedute per lavorare sulle abilità visive che risultano non adeguate rispetto a quanto atteso per l’età.",
    audience: 'Soprattutto bambini',
    price: { amount: 60, unit: 'a seduta' },
    duration: 'Indicativamente da 3 a 8 mesi',
    image: 'rieducazioneVisiva',
    note: 'Il percorso più frequente',
    whatsappMessage:
      'Buongiorno, vorrei avere informazioni sul percorso di rieducazione visiva (visual training).',
    seo: {
      title: 'Rieducazione visiva (Visual Training)',
      description:
        "Il visual training spiegato ai genitori: come funziona il percorso di rieducazione visiva, durata indicativa (3–8 mesi) e costo, 60 € a seduta.",
    },
  },
  {
    slug: 'potenziamento-visivo-sportivo',
    path: '/servizi/potenziamento-visivo-sportivo/',
    name: 'Potenziamento visivo sportivo',
    shortName: 'Potenziamento sportivo',
    summary:
      'Per chi pratica sport, a livello amatoriale o agonistico: prima la correzione, poi il potenziamento vero e proprio.',
    audience: 'Sportivi e atleti, amatoriali o agonisti',
    price: null,
    priceLabel: 'Prezzo su valutazione',
    image: 'potenziamentoSportivo',
    whatsappMessage:
      'Buongiorno, vorrei avere informazioni sul potenziamento visivo sportivo.',
    seo: {
      title: 'Potenziamento visivo sportivo',
      description:
        'Potenziamento visivo per sportivi e atleti, amatoriali o agonisti: un percorso in due fasi, prima la correzione e poi il potenziamento vero e proprio.',
    },
  },
];

export const getService = (slug: string): Service => {
  const service = services.find((s) => s.slug === slug);
  if (!service) throw new Error(`Servizio non trovato: ${slug}`);
  return service;
};

/** Prezzo pronto da mostrare: { main: '75 €', detail: 'una tantum' } oppure l'etichetta "su valutazione". */
export const formatPrice = (service: Service): { main: string; detail?: string } =>
  service.price
    ? {
        main: `${service.price.amount} €`,
        detail: service.price.unit,
      }
    : { main: service.priceLabel ?? 'Prezzo su valutazione' };
