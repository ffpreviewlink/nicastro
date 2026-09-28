/**
 * Percorso professionale e credenziali.
 * Sono usati nella home ("Perché affidarsi"), in "Chi sono" e in "Per i professionisti":
 * si aggiornano qui una volta sola.
 *
 * Regola: niente dati inventati. Le voci tra parentesi quadre sono segnaposto
 * da sostituire con le informazioni reali fornite dal professionista.
 */

export interface TrustPoint {
  title: string;
  text: string;
  /** Dettaglio ancora da fornire, mostrato evidenziato dopo il testo. */
  placeholder?: string;
}

/** Elementi che costruiscono autorevolezza, nell'ordine in cui compaiono. */
export const trustPoints: TrustPoint[] = [
  {
    title: 'Esperienza in contesti diversi',
    text: 'Ottico-optometrista in diversi centri italiani, poi insegnante di Ottica: un percorso professionale che attraversa realtà diverse, raccontato nella pagina Chi sono.',
  },
  {
    title: 'Uno studio dedicato',
    text: 'Sono stato l’unico, nelle Marche, ad avere uno studio dedicato esclusivamente all’analisi e alla rieducazione visiva.',
  },
  {
    title: 'Formazione e specializzazioni',
    text: 'Ottico (2019), Optometria e Rieducazione visiva (2024), Visione e Postura (2025). Il percorso completo è nella pagina Chi sono.',
  },
  {
    title: 'Il lavoro con altri professionisti',
    text: 'Una parte importante delle famiglie arriva su indicazione di logopedisti, psicologi e neuropsicomotricisti.',
  },
  {
    title: 'Dove ricevo',
    text: 'Le sedi in cui ricevo sono in aggiornamento: scrivimi su WhatsApp per saperne di più.',
  },
];

export interface Experience {
  period: string;
  title: string;
  place?: string;
  description: string;
}

/**
 * Esperienze lavorative, in ordine di lettura dall'alto verso il basso.
 * TODO(cliente): sostituire i segnaposto e confermare l'ordine delle tappe.
 */
export const experiences: Experience[] = [
  {
    period: '2019 – 2024',
    title: 'Ottico-optometrista',
    place: 'Fano, Perugia, Imola, Bolzano, Trento',
    description: 'Ho svolto la professione di ottico-optometrista in diversi centri italiani.',
  },
  {
    // TODO(cliente): confermare l'anno esatto di questa esperienza (collocata tra il 2024 e l'apertura dello studio nel 2025)
    period: '[INSERIRE ANNO]',
    title: 'Insegnante di Ottica',
    place: 'Istituto Don E. Pocognoni, Matelica',
    description: 'Sono stato chiamato come insegnante di Ottica.',
  },
  {
    period: 'Dal 2025',
    title: 'Studio dedicato all’analisi e alla rieducazione visiva',
    place: 'Marche',
    description:
      'Ho aperto lo Studio Optometrico Nicastro: sono stato l’unico, nelle Marche, ad avere uno studio dedicato esclusivamente a questa attività.',
  },
  {
    period: 'Oggi',
    title: 'Verso nuove sedi',
    description:
      'Il mio modo di lavorare si sta evolvendo: le sedi in cui ricevo sono in aggiornamento. Scrivimi su WhatsApp per sapere come fissare un appuntamento.',
  },
];

export interface Education {
  title: string;
  place: string;
  period: string;
}

export const education: Education[] = [
  {
    title: 'Ottico – Arte ausiliaria delle professioni sanitarie',
    place: '[INSERIRE ENTE / ISTITUTO]',
    period: '2019',
  },
  {
    title: 'Optometria',
    place: '[INSERIRE ENTE / ISTITUTO]',
    period: '2024',
  },
  {
    title: 'Rieducazione visiva',
    place: '[INSERIRE ENTE / ISTITUTO]',
    period: '2024',
  },
  {
    title: 'Visione e Postura',
    place: '[INSERIRE ENTE / ISTITUTO]',
    period: '2025',
  },
];
