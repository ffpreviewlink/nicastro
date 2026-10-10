import type { ImageKey } from './images';
import { getService } from './services';

/**
 * Le tre slide del carosello in home: un pubblico per slide.
 * Bambini è il target principale e compare per primo.
 */
export interface Audience {
  id: string;
  /** Etichetta del selettore. */
  label: string;
  title: string;
  /** Un paragrafo, oppure più paragrafi. */
  text: string | string[];
  /** Link primario verso la pagina di approfondimento. */
  cta: { label: string; href: string };
  whatsappMessage: string;
  image: ImageKey;
}

export const audiences: Audience[] = [
  {
    id: 'bambini',
    label: 'Bambini',
    title: 'Per i bambini: capire come usano gli occhi',
    text: "Attraverso l’analisi visiva optometrica valuto le abilità visive del bambino, per capire se sono adeguate alla sua età e alle attività quotidiane, come la lettura, la scrittura e l’apprendimento. Quando emergono difficoltà nelle abilità visive, è possibile progettare un percorso personalizzato di rieducazione visiva per aiutarlo a svilupparle e utilizzarle in modo più efficace.",
    cta: { label: "Scopri l’analisi visiva", href: getService('analisi-visiva-optometrica').path },
    whatsappMessage:
      "Buongiorno, vorrei avere informazioni per mio figlio/a sull’analisi visiva optometrica.",
    image: 'bambini',
  },
  {
    id: 'adulti',
    label: 'Adulti',
    title: 'Anche per gli adulti',
    text: [
      "Ti capita di avere mal di testa dopo una giornata al computer? Avverti occhi stanchi, difficoltà a mettere a fuoco o fastidio durante la lettura e il lavoro da vicino?",
      "Questi disturbi possono avere diverse cause, tra cui alcune difficoltà delle abilità visive. Con un’analisi visiva optometrica posso valutare come lavora il tuo sistema visivo e verificare se è opportuno intervenire con strategie mirate a migliorare il comfort visivo.",
    ],
    cta: { label: 'Vedi i servizi', href: '/servizi/' },
    whatsappMessage:
      'Buongiorno, sono un adulto e vorrei capire se una valutazione delle abilità visive può avere senso per me.',
    image: 'adulti',
  },
  {
    id: 'sportivi',
    label: 'Sportivi',
    title: 'Migliora la tua performance sportiva allenando anche la vista.',
    text: [
      "Sapevi che molti atleti affiancano all’allenamento fisico esercizi specifici per sviluppare le proprie abilità visive?",
      "La capacità di reagire rapidamente agli stimoli, individuare i movimenti degli avversari, utilizzare la visione periferica e coordinare occhi e corpo può fare la differenza in molte discipline sportive.",
      "Attraverso un percorso personalizzato di allenamento visivo sportivo, è possibile lavorare su queste abilità e allenare il sistema visivo a rispondere in modo più efficiente alle richieste del proprio sport.",
      "Allena il corpo. Allena la vista. Esprimi al meglio il tuo potenziale.",
    ],
    cta: { label: 'Scopri il potenziamento', href: getService('potenziamento-visivo-sportivo').path },
    whatsappMessage:
      'Buongiorno, pratico sport e vorrei avere informazioni sul potenziamento visivo sportivo.',
    image: 'sportivi',
  },
];
