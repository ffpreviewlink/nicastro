/**
 * Questionario CISS (Convergence Insufficiency Symptom Survey, versione italiana).
 *
 * Domande, istruzioni, etichette e valori delle risposte sono quelli del PDF
 * originale: NON vanno parafrasati né aggiunti. Tutto il resto di questo file
 * (campo età, fasce di punteggio, testi della schermata finale) è configurazione che il
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

/**
 * Campo età.
 *
 * L'età non blocca più nessuno: chiunque può compilare le 15 domande (richiesta del
 * cliente: anche i bambini sotto i 9 anni). Poter compilare il questionario NON significa che
 * l'interpretazione del punteggio sia validata per ogni età: lo studio citato nelle fonti
 * riguarda ragazzi dai 9 ai 18 anni. Per questo l'età serve solo a scegliere le fasce di
 * `cissScoreBands` e non cambia mai il punteggio.
 *
 * `inputMin`/`inputMax` sono solo limiti di digitazione: oltre questi valori l'input è
 * considerato un errore di battitura.
 */
export const cissAge = {
  inputMin: 0,
  inputMax: 120,
};

/** Colore di una fascia; il codice colore vero è nel CSS di CissQuestionnaire.astro. */
export type CissTone = 'red' | 'yellow' | 'green';

/** Fascia di punteggio: estremi interi inclusi. */
export interface ScoreBand {
  min: number;
  max: number;
  tone: CissTone;
  /** Testo che accompagna il colore: il colore da solo non basta per capire. */
  label: string;
}

export interface ScoreBandGroup {
  /**
   * Vero solo dopo la conferma del professionista. Finché è false, per questa categoria il
   * risultato resta neutro (nessun colore, nessuna fascia), qualunque sia il punteggio.
   */
  approved: boolean;
  /** Fasce ordinate, senza buchi né sovrapposizioni su tutto l'intervallo 0 – cissMaxScore. */
  bands: readonly ScoreBand[];
}

/**
 * Testo di ciascun colore. Nella schermata finale NON si vede: il risultato mostra solo il
 * colore (richiesta del cliente). Il testo è letto dagli screen reader, così chi non vede i
 * colori ha comunque l'informazione.
 */
const bandLabels: Record<CissTone, string> = {
  green: 'Nessuna urgenza di una visita',
  yellow: 'Situazione intermedia: una visita può essere utile',
  red: 'Visita fortemente consigliata',
};

/**
 * Colore e fascia del punteggio. È l'UNICO posto dove vanno cambiate le soglie.
 *
 * Significato dei colori, come detto dal cliente: rosso = ha bisogno di una visita,
 * giallo = situazione in bilico, verde = a posto.
 *
 * `childMaxAge`: fino a che età (inclusa) si usano le fasce dei bambini. CONFERMATO dal
 * cliente: bambini fino a 18 anni, adulti dai 19 in su. Con `null` nessuna età avrebbe una
 * categoria e il risultato resterebbe neutro.
 *
 * Bambini: soglie dette a voce dal cliente (sopra 18 rosso, sotto 10 verde, in mezzo giallo).
 * Adulti: il cliente ha detto «più alte» ma non i valori. Quelle qui sono una PROPOSTA
 * tecnica, spostata di 5 punti rispetto ai bambini (in letteratura il punto di taglio
 * indicato è 16 per i ragazzi e 21 per gli adulti: cade nella fascia gialla in entrambi i casi).
 * TODO(cliente): soglie di bambini e adulti sono da confermare, non sono una tabella clinica
 * definitiva.
 *
 * `approved: false` spegne i colori di una categoria senza toccare le sue soglie: il
 * risultato resta neutro (solo il numero).
 */
export const cissScoreBands: {
  childMaxAge: number | null;
  groups: { child: ScoreBandGroup; adult: ScoreBandGroup };
} = {
  childMaxAge: 18,
  groups: {
    child: {
      approved: true,
      bands: [
        { min: 0, max: 9, tone: 'green', label: bandLabels.green },
        { min: 10, max: 18, tone: 'yellow', label: bandLabels.yellow },
        { min: 19, max: cissMaxScore, tone: 'red', label: bandLabels.red },
      ],
    },
    adult: {
      approved: true,
      bands: [
        { min: 0, max: 14, tone: 'green', label: bandLabels.green },
        { min: 15, max: 23, tone: 'yellow', label: bandLabels.yellow },
        { min: 24, max: cissMaxScore, tone: 'red', label: bandLabels.red },
      ],
    },
  },
};

/**
 * Schermata finale.
 *
 * TODO(cliente): i testi sono da approvare. Non devono contenere diagnosi o indicazioni
 * terapeutiche. Il punteggio si mostra come numero semplice, mai come «X su 60»; il suo
 * significato lo dà la fascia colorata (vedi `cissScoreBands`).
 */
export const cissResult = {
  title: 'Questionario completato',
  scoreLabel: 'Punteggio del questionario',
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
