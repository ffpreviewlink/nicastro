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
    text: 'Il mio percorso attraversa realtà professionali diverse. Le tappe principali sono raccontate nella pagina Chi sono.',
    placeholder: '[INSERIRE SINTESI DELLE ESPERIENZE PRINCIPALI]',
  },
  {
    title: 'Uno studio dedicato',
    text: 'Sono stato l’unico, nelle Marche, ad avere uno studio dedicato esclusivamente all’optometria comportamentale e alla rieducazione visiva.',
  },
  {
    title: 'Formazione e specializzazioni',
    text: '',
    placeholder: '[INSERIRE FORMAZIONE E SPECIALIZZAZIONI PRINCIPALI]',
  },
  {
    title: 'Il lavoro con altri professionisti',
    text: 'Una parte importante delle famiglie arriva su indicazione di logopedisti, psicologi e neuropsicomotricisti.',
  },
  {
    title: 'Dove serve',
    text: 'Oggi ricevo presso diversi studi: porto la mia competenza dove c’è bisogno.',
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
    period: '[INSERIRE PERIODO]',
    title: '[INSERIRE RUOLO E STRUTTURA]',
    description: '[INSERIRE DESCRIZIONE BREVE DELL’ESPERIENZA]',
  },
  {
    period: '[INSERIRE PERIODO]',
    title: '[INSERIRE RUOLO E STRUTTURA]',
    description: '[INSERIRE DESCRIZIONE BREVE DELL’ESPERIENZA]',
  },
  {
    period: '[INSERIRE PERIODO]',
    title: 'Studio dedicato all’optometria comportamentale',
    place: 'Marche',
    description:
      'Sono stato l’unico, nelle Marche, ad avere uno studio dedicato esclusivamente a questa attività.',
  },
  {
    period: 'Oggi',
    title: 'Presso diversi studi',
    description:
      'Il mio modo di lavorare si sta evolvendo: mi sposto e ricevo in studi diversi, portando la mia competenza dove serve.',
  },
];

export interface Education {
  title: string;
  place: string;
  period: string;
}

export const education: Education[] = [
  {
    title: '[INSERIRE TITOLO DI STUDIO O CORSO]',
    place: '[INSERIRE ENTE / UNIVERSITÀ]',
    period: '[INSERIRE ANNO]',
  },
  {
    title: '[INSERIRE TITOLO DI STUDIO O CORSO]',
    place: '[INSERIRE ENTE / UNIVERSITÀ]',
    period: '[INSERIRE ANNO]',
  },
];
