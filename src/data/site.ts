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

const businessName = 'Studio Optometrico Nicastro';

/**
 * Place ID della scheda Google Business Profile dell'attività: è un riferimento pubblico e
 * permanente, non un segreto. Se cambia va aggiornato anche in public/api/google-reviews.php.
 */
const googlePlaceId = 'ChIJAxnfu4PFLRMRqZ-Zw4r50fI';

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
  businessName,
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

  email: 'info@studio-nicastro.it',
  /** Facoltativo. Lascia vuoto ('') per non mostrare alcun numero di telefono. */
  phone: '',
  vatId: '02156950434',

  address,

  /**
   * Studi in cui riceve attualmente. Nessuna sede confermata al momento: elenco
   * vuoto finché il cliente non ne conferma una. Aggiungere una voce qui appena
   * disponibile.
   */
  locations: [] as string[],

  googleReviews: {
    /** Usato anche, lato server, da public/api/google-reviews.php: se cambia va aggiornato in ENTRAMBI i posti. */
    placeId: googlePlaceId,
    /**
     * Scheda Google dello studio, dove si leggono le recensioni (formato «Maps URLs» documentato
     * da Google, con Place ID). Funziona su qualunque hosting: è solo un link, senza backend.
     */
    readUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}&query_place_id=${googlePlaceId}`,
    /** Pagina ufficiale di Google per scrivere una recensione (chiede l'accesso all'account Google). */
    writeUrl: `https://search.google.com/local/writereview?placeid=${googlePlaceId}`,
  },

  contactForm: {
    /**
     * Endpoint che riceve il modulo: public/api/contact.php (SMTP Aruba, configurato nel file
     * api/.env sul server). Funziona solo dove gira PHP: sull'anteprima GitHub Pages e in
     * `astro dev` il modulo mostra il messaggio di errore con i contatti alternativi.
     * Vuoto = il modulo apre il programma di posta con il messaggio già scritto.
     */
    endpoint: '/api/contact.php',
  },
};

export type Site = typeof site;
