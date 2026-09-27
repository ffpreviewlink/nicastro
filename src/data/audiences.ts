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
  text: string;
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
    text: "Con l’analisi visiva si verifica se le abilità visive del bambino sono adeguate a quanto atteso per la sua età. Se non lo sono, si può impostare un percorso di rieducazione visiva. È l’ambito in cui lavoro più spesso.",
    cta: { label: "Scopri l’analisi visiva", href: getService('analisi-visiva-optometrica').path },
    whatsappMessage:
      "Buongiorno, vorrei avere informazioni per mio figlio/a sull’analisi visiva optometrica.",
    image: 'bambini',
  },
  {
    id: 'adulti',
    label: 'Adulti',
    title: 'Anche per gli adulti',
    text: "Le abilità visive non riguardano solo i bambini. Se sei un adulto e vuoi capire se una valutazione può avere senso per te, scrivimi: ne parliamo.",
    cta: { label: 'Vedi i servizi', href: '/servizi/' },
    whatsappMessage:
      'Buongiorno, sono un adulto e vorrei capire se una valutazione delle abilità visive può avere senso per me.',
    image: 'adulti',
  },
  {
    id: 'sportivi',
    label: 'Sportivi',
    title: 'Per chi fa sport',
    text: "Un percorso in due fasi per chi pratica sport, a livello amatoriale o agonistico: prima la correzione, poi il potenziamento vero e proprio.",
    cta: { label: 'Scopri il potenziamento', href: getService('potenziamento-visivo-sportivo').path },
    whatsappMessage:
      'Buongiorno, pratico sport e vorrei avere informazioni sul potenziamento visivo sportivo.',
    image: 'sportivi',
  },
];
