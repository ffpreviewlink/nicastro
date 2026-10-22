/**
 * Questionario CISS (Convergence Insufficiency Symptom Survey, versione italiana).
 *
 * Domande, istruzioni, etichette e valori delle risposte sono quelli del PDF
 * originale: NON vanno parafrasati né aggiunti. Tutto il resto di questo file
 * (accesso per età, testi della schermata finale) è configurazione che il
 * professionista può approvare o modificare senza toccare il codice.
 */

/** Nome con cui il percorso si presenta nel sito (nome accessibile della finestra). */
export const cissName = 'Questionario sui sintomi visivi';

/** Istruzioni per il soggetto, dal PDF. */
export const cissInstructions =
  'Ti preghiamo di rispondere alle seguenti domande su come senti i tuoi occhi quando leggi o lavori da vicino.';

/** Le 15 domande, nell'ordine del PDF (la domanda n è alla posizione n − 1). */
export const cissQuestions = [
  'Senti gli occhi stanchi quando leggi o lavori da vicino?',
  'Senti fastidio agli occhi quando leggi o lavori da vicino?',
  'Hai mal di testa quando leggi o lavori da vicino?',
  'Ti senti assonnato quando leggi o lavori da vicino?',
  'Perdi la concentrazione quando leggi o lavori da vicino?',
  'Hai difficoltà a ricordare ciò che hai letto?',
  'Vedi doppio quando leggi o lavori da vicino?',
  'Vedi le parole muoversi, saltare, fluttuare o ti sembra che galleggino sulla pagina quando leggi o lavori da vicino?',
  'Ti sembra di leggere lentamente?',
  'Ti fanno mai male gli occhi quando leggi o lavori da vicino?',
  'Senti mai gli occhi irritati quando leggi o lavori da vicino?',
  'Senti “tirare” intorno agli occhi quando leggi o lavori da vicino?',
  'Noti che le parole sono annebbiate o che la messa a fuoco va e viene mentre leggi o lavori da vicino?',
  'Perdi il segno mentre leggi o lavori da vicino?',
  'Devi rileggere la stessa riga di parole quando leggi?',
] as const;

export interface CissOption {
  label: string;
  /** Punti assegnati alla risposta (la colonna «x 0 … x 4» del PDF). */
  value: number;
}

/** Le cinque risposte possibili, uguali per tutte le domande. */
export const cissOptions: readonly CissOption[] = [
  { label: 'Mai', value: 0 },
  { label: 'Raramente', value: 1 },
  { label: 'Qualche volta', value: 2 },
  { label: 'Spesso', value: 3 },
  { label: 'Sempre', value: 4 },
];

/** Punteggio massimo: 15 domande × 4 punti = 60 (il minimo è 0). */
export const cissMaxScore = cissQuestions.length * Math.max(...cissOptions.map((o) => o.value));

/** Fonti riportate in calce al PDF: mostrate come attribuzione. */
export const cissSource = {
  title: 'Convergence Insufficiency Symptom Survey (CISS), versione italiana',
  credits: [
    'Developed by Borsting EJ, Rouse MW, Mitchell GL, Scheiman M, Cotter SA, Cooper J, Kulp MT, London R, Convergence Insufficiency Treatment Trial Group. Validity and reliability of the revised convergence insufficiency symptom survey in children aged 9 to 18 years. Optometry and Vision Science. 2003 Dec 1;80(12):832-8.',
    'Adattamento in Italiano a cura del Centro di Ricerca in Ottica e Optometria (CoMiB) dell’Università di Milano Bicocca, dell’Instituto per la ricerca e gli studi in Ottica e Optometria (IRSOO), di Vinci, e dell’Aston University di Birmingham: Boccardo L, Di Vizio A, Galli G, Naroo SA, Fratini A, Tavazzi S, Gurioli M, Zeri F. Translation and validation of convergence insufficiency symptom survey to Italian: Psychometric results. Journal of Optometry. 2023 Jul 1;16(3):189-98.',
  ],
};

/** Intervallo di età (in anni, estremi inclusi). */
export interface AgeRange {
  min: number;
  max: number;
}

/**
 * Chi può proseguire con le 15 domande.
 *
 * TODO(cliente): decisione clinica di Nicolais Nicastro. Il PDF documenta lo studio di
 * validazione del questionario su ragazzi dai 9 ai 18 anni, ed è l'unica popolazione di
 * riferimento nota: per questo è l'unico intervallo abilitato. Per ammettere altre fasce,
 * aggiungere intervalli a `ranges` (es. { min: 19, max: 99 }); con `ranges` vuoto nessuno
 * accede alle domande. Non esistono versioni alternative del questionario.
 */
export const cissAccess = {
  ranges: [{ min: 9, max: 18 }] as AgeRange[],
  /** Limiti del campo età: oltre questi valori l'input è considerato un errore di digitazione. */
  inputMin: 0,
  inputMax: 120,
  /** Schermata mostrata a chi non rientra negli intervalli sopra. */
  notEligible: {
    title: 'Prima di proseguire serve un confronto con lo studio',
    text: [
      'Il questionario di riferimento è documentato per ragazzi dai 9 ai 18 anni. Per l’età indicata non è stato definito un percorso online.',
      'Se vuoi, contatta lo studio: valuteremo insieme come procedere.',
    ],
  },
};

/**
 * Schermata finale.
 *
 * TODO(cliente): i testi sono da approvare. Non devono contenere diagnosi, soglie,
 * classificazioni del punteggio o indicazioni terapeutiche, salvo conferma esplicita
 * del professionista.
 */
export const cissResult = {
  title: 'Questionario completato',
  scoreLabel: 'Punteggio totale',
  note: 'Questo questionario raccoglie informazioni sui sintomi riferiti durante le attività da vicino. Il risultato non costituisce una diagnosi e deve essere interpretato nell’ambito di una valutazione professionale.',
  contact: {
    title: 'Parliamone insieme',
    text: (businessName: string) => `Se vuoi confrontarti con il professionista, contatta lo ${businessName}.`,
    /** Il messaggio WhatsApp NON contiene risposte né punteggio. */
    whatsappMessage: 'Buongiorno, ho compilato il questionario sul sito e vorrei un confronto con il professionista.',
    emailSubject: 'Questionario sul sito',
  },
};

/** Popup iniziale. */
export const cissPopup = {
  title: 'Vuoi capire se questo percorso può essere adatto a te?',
  text: 'Rispondi ad alcune domande sui tuoi occhi durante la lettura e le attività da vicino. Il questionario può aiutare a raccogliere informazioni utili da approfondire con un professionista.',
  start: 'Inizia il questionario',
  dismiss: 'Continua a visitare il sito',
  /** Chiave in sessionStorage: ricorda solo che il popup è già comparso in questa sessione. */
  sessionKey: 'ciss-popup-shown',
};
