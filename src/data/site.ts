/**
 * Indirizzo dell'attività (sede legale/fiscale, confermato dal cliente): usato in
 * footer, Contatti (riga P.IVA) e dati strutturati. Non è una sede di ricezione
 * pazienti: per quello vedi `locations` più sotto.
 */
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
  role: 'Optometrista, Rieducatore visivo',
  /** Regioni in cui è disponibile (dati strutturati, aree di servizio, titoli e descrizioni). */
  regions: ['Marche', 'Umbria'],
  locale: 'it_IT',
  description:
    'Analisi visiva, rieducazione visiva (visual training) e potenziamento visivo sportivo per bambini, adulti e sportivi, in Marche e Umbria.',
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
  vatId: '02156950434',

  address,

  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61578618864824',
  },

  /**
   * Studi in cui riceve attualmente. Nessuna sede confermata al momento: elenco
   * vuoto finché il cliente non ne conferma una. Aggiungere una voce qui appena
   * disponibile.
   */
  locations: [] as string[],

  googleReviews: {
    /**
     * Place ID della scheda Google Business Profile dell'attività (non è un
     * segreto: è un riferimento pubblico e permanente). Usato per costruire
     * il link "Vedi su Google" e, lato server, dall'endpoint
     * public/api/google-reviews.php per interrogare Google Places API.
     * Se cambia va aggiornato in ENTRAMBI i posti.
     */
    placeId: 'ChIJAxnfu4PFLRMRqZ-Zw4r50fI',
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
