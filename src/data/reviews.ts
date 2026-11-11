/**
 * Recensioni Google inserite a mano.
 *
 * Si usano SOLO finché l'endpoint live (public/api/google-reviews.php, con chiave Google
 * Places) non risponde: quando è attivo le recensioni vere e aggiornate hanno la precedenza.
 *
 * Regole (sono le recensioni di persone reali):
 * - il testo va copiato IDENTICO a quello pubblicato su Google, senza correggerlo né accorciarlo
 *   (se è lungo si taglia da solo a video; il testo integrale resta nel file);
 * - il nome è quello che Google mostra pubblicamente (o solo nome e iniziale del cognome);
 * - non inserire recensioni scritte da altri, riassunti o testi «ispirati» a una recensione;
 * - aggiornare `checkedOn` ogni volta che si ricontrolla la scheda Google (promemoria interno:
 *   non è mostrata sul sito);
 * - lasciare `items` vuoto se non ci sono recensioni da mostrare: la sezione resta con i due
 *   pulsanti verso Google.
 */
export interface ManualReview {
  /** Nome come appare su Google. */
  author: string;
  /** Stelle assegnate, da 1 a 5. Se non si conoscono si omette: non si mostra alcuna stella. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Testo identico all'originale; una riga vuota separa i paragrafi. */
  text: string;
  /** Facoltativo: link alla recensione su Google («Condividi» sulla recensione). */
  url?: string;
}

export const manualReviews: {
  /** Data (AAAA-MM-GG) in cui le recensioni sono state ricontrollate sulla scheda Google. */
  checkedOn: string | null;
  /**
   * Facoltativo, solo se i valori sono quelli letti sulla scheda Google in quella data:
   * media e numero totale di recensioni. Senza, non si mostra alcuna valutazione.
   */
  summary: { rating: number; count: number } | null;
  items: ManualReview[];
} = {
  checkedOn: '2026-11-11',
  summary: null,
  items: [
    {
      author: 'Eleonora Salari',
      rating: 5,
      text: `Professionale, gentile e super competente. Mi ha aiutato moltissimo per la mia situazione e ha capito immediatamente il problema. Sono andata dal Dottor Nicastro perché avevo un leggero problema di vista e una forte stanchezza oculare, la quale mi impediva di mettere bene a fuoco. Avevo spesso mal di testa dato che il mio lavoro mi vede a lavorare quasi otto ore al giorno davanti ad un pc. Guidare era diventato un grosso problema proprio perché sembravo perdere la messa a fuoco e gli occhi dopo un po' si andavano ad incrociare per lo sforzo. Sono andata da diversi ottici/oculisti ma tutti mi hanno rimbalzato dicendo che non avevo bisogno di occhiali in quanto avevo un astigmatismo troppo lieve per poter avere la prescrizione di lenti. Il dott. Nicastro mi ha ascoltato con attenzione e mi ha sottoposto a numerosi test visivi. La visita è stata professionale e lui mi ha pazientemente spiegato tutti i test e il loro scopo. Infine il dottore mi ha prescritto lenti per un astigmatismo -0.5 D. Ora i mal di testa sono passati e le lenti mi aiutano nelle piccole cose di ogni giorno senza timore di arrivare a fine giornata con gli occhi stanchissimi. Consigliatissimo!`,
    },
    {
      author: 'Matteo Frontini',
      // TODO: stelle non indicate nel testo ricevuto («(stelle)»): aggiungere `rating` quando note
      text: `Consigliati dalla Logopedista, da qualche mese nostro figlio Edoardo, di 10 anni, dislessico, ha iniziato un percorso con Dott. Nicolais Nicastro. Abbiamo visto già dopo le prime settimane un miglioramento nell'approccio alla lettura, sia nella fluidità che nella comprensione rapida. Gli esercizi sono accattivanti ed il metodo di Nicolais lo coinvolge e lo stimola. Il percorso non è ancora finito ed Edoardo esegue con piacere e sempre di più comincia a percepire quanto gli sia utile! Ultimamente sta trovando anche piacere nell'aprire libri di storie e leggere per svago.... Una cosa che non lo avevamo mai visto fare prima. Il percorso continua!! Consigliamo a tutti il Dott. Nicolais, sempre super disponibile, capace, competente , professionale, empatico ed anche simpatico.`,
    },
    {
      author: 'Francesca Barboni',
      rating: 5,
      text: `Dopo aver consultato vari oculisti , ortottisti e optometristi mi sono trovata finalmente molto soddisfatta della visita accurata e scrupolosa ricevuta nello studio Nicastro, dove mio figlio sta svolgendo la giusta terapia per il suo problema.

Ho trovato professionalità, gentilezza, disponibilità ,simpatia e prezzi onesti.

Oltretutto vicino casa, che non guasta.

Lo raccomando vivamente!!!`,
    },
    {
      author: 'Giacomo Tombesi',
      rating: 5,
      text: `Abbiamo conosciuto il dott Nicastro quando in collaborazione con una logopedista hanno valutato nostra figlia di 8 anni che aveva problemi di lettura. Fin da subito ci ha colpito la sua empatia e professionalità infatti dopo una accuratissima visita è riuscito a capire quali problemi avesse nostra figlia e ci ha proposto un percorso da fare che l avrebbe aiutata con la lettura e così è stato. Fin da subito abbiamo notato netti miglioramenti fino a quando a distanza di pochi mesi il problema si è completamente risolto. Quindi oltre che a ringraziare il dottor Nicastro ci sentiamo di consigliarlo a chi avesse gli stessi problemi.`,
    },
  ],
};
