/** Indirizzo dell'attività: usato in footer, Contatti, dati strutturati e come primo studio in cui riceve. */
const address = {
  street: 'Via Vittorio Bachelet, 15',
  postalCode: '62024',
  city: 'Matelica',
  province: 'MC',
  country: 'IT',
};

/**
 * Configurazione centrale del sito.
 * I dati del professionista si modificano SOLO qui: header, footer, contatti,
 * metadata e dati strutturati leggono tutti da questo file.
 *
 * Le voci tra parentesi quadre sono segnaposto da sostituire con i dati reali.
 */
export const site = {
  /** Nome e cognome del professionista: compare nei testi in prima persona ("Sono ..."). */
  name: 'Nicolais Nicastro',
  /** Nome dell'attività: marchio in header e footer, titoli delle pagine, dati strutturati. */
  businessName: 'Studio Optometrico Nicastro',
  role: 'Optometrista comportamentale',
  /** Regione di riferimento per la ricerca locale. Nessun indirizzo: il professionista riceve in studi diversi. */
  region: 'Marche',
  locale: 'it_IT',
  description:
    'Optometria comportamentale nelle Marche: analisi visiva, rieducazione visiva (visual training) e potenziamento visivo sportivo per bambini, adulti e sportivi.',
  /** Immagine di anteprima per social e messaggistica (1200×630). */
  ogImage: '/images/og-default.jpg',

  whatsapp: {
    /** Formato internazionale, solo cifre, senza + né spazi: prefisso 39 + numero. */
    number: '393286537596',
    defaultMessage: 'Buongiorno, ho visto il sito e vorrei avere qualche informazione.',
  },

  email: 'studio.nicastronico@gmail.com',
  /** Facoltativo. Lascia vuoto ('') per non mostrare alcun numero di telefono. */
  phone: '',
  /** [INSERIRE P.IVA] — quando sarà fornita */
  vatId: '[INSERIRE P.IVA]',

  /** Indirizzo dell'attività (footer, Contatti, dati strutturati). */
  address,

  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61578618864824',
  },

  /** Studi in cui riceve. Nessuna sede permanente: elencare solo dati reali. */
  locations: [
    `${address.street}, ${address.postalCode} ${address.city} (${address.province})`,
    // TODO(cliente): aggiungere gli altri studi in cui riceve, oppure eliminare questa riga
    '[INSERIRE ALTRI STUDI IN CUI RICEVE, se presenti]',
  ],

  googleReviews: {
    /** Link alla scheda Google dell'attività (per "Vedi tutte su Google"). Vuoto = link nascosto. */
    url: '',
    /** Valutazione media reale, es. '5,0'. Vuoto = riquadro segnaposto. */
    rating: '',
    /** Numero reale di recensioni, es. '48'. */
    count: '',
    /** Codice del widget/embed Google Reviews (HTML). Vuoto = nessun widget. */
    embedHtml: '',
  },

  contactForm: {
    /**
     * Endpoint del servizio che riceve il modulo (es. Formspree, Web3Forms, Netlify Forms).
     * Vuoto = il modulo apre il programma di posta con il messaggio già scritto.
     */
    endpoint: '',
  },
};

export type Site = typeof site;
