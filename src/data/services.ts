import type { ImageKey } from './images';

/**
 * I servizi. Nome, prezzo, durata, testi di sintesi e messaggio WhatsApp
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
  /** Senza immagine, la testata della pagina mostra il pannello con il prezzo. */
  image?: ImageKey;
  /** Etichetta discreta sulla card. */
  note?: string;
  /** true = prestazione a domicilio: niente area servita nei dati strutturati (la zona non è dichiarata),
   *  fuori dallo slider delle specializzazioni e dalla griglia di /servizi/ (ha una sezione dedicata). */
  atHome?: boolean;
  whatsappMessage: string;
  /** Titolo e testo della fascia finale della pagina di dettaglio (default: quelli generici). */
  cta?: { title: string; text: string };
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
  {
    slug: 'controllo-visivo-a-domicilio',
    path: '/servizi/controllo-visivo-a-domicilio/',
    name: 'Controllo visivo a domicilio',
    shortName: 'Controllo a domicilio',
    summary:
      'Il controllo visivo direttamente a casa tua, pensato per chi ha difficoltà a spostarsi o necessita di un servizio più comodo e personalizzato.',
    audience: 'Chi ha difficoltà a spostarsi',
    price: { amount: 50, unit: 'a domicilio' },
    note: 'A domicilio',
    atHome: true,
    whatsappMessage: 'Buongiorno, vorrei avere informazioni sul controllo visivo a domicilio.',
    cta: {
      title: 'Hai bisogno di un controllo a domicilio?',
      text: 'Scrivimi per verificare la disponibilità del servizio e concordare un appuntamento.',
    },
    seo: {
      title: 'Controllo visivo a domicilio',
      description:
        'Controllo visivo a domicilio per chi ha difficoltà a spostarsi: mi reco a casa tua, valuto le necessità visive e, se serve, realizzo gli occhiali più adatti. 50 €.',
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

/**
 * Contenuti del controllo visivo a domicilio condivisi tra la sezione in evidenza
 * di /servizi/ e la pagina di dettaglio. Nome, prezzo, sintesi e messaggio WhatsApp
 * vengono dal servizio `controllo-visivo-a-domicilio` qui sopra.
 */
export const homeVisit = {
  slug: 'controllo-visivo-a-domicilio',
  /** Ancora della sezione in /servizi/. */
  anchor: 'domicilio',
  /** Micro-descrizione sotto il prezzo. */
  priceLabel: 'Controllo visivo a domicilio',
  points: [
    'Mi reco direttamente al tuo domicilio',
    'Effettuo il controllo visivo',
    'Valuto le necessità visive della persona',
    'In base alla valutazione, può essere realizzato l’occhiale più adatto',
  ],
  audiences: [
    'Persone anziane',
    'Persone con difficoltà motorie',
    'Persone temporaneamente impossibilitate a raggiungere lo studio',
    'Persone che necessitano di una valutazione direttamente al proprio domicilio',
  ],
  steps: [
    { title: 'Richiedi il servizio', text: 'Contatti lo studio per concordare il controllo a domicilio.' },
    { title: 'Vengo io da te', text: 'Il controllo viene effettuato direttamente presso il tuo domicilio.' },
    { title: 'Valutazione visiva', text: 'Viene effettuata la valutazione delle tue esigenze visive.' },
    {
      title: 'Soluzione personalizzata',
      text: 'In base alla valutazione, è possibile procedere con la realizzazione degli occhiali più adatti.',
    },
  ],
} as const;
