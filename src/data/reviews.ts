/**
 * Recensioni Google reali.
 *
 * Finché l'elenco è vuoto il sito mostra riquadri segnaposto ben riconoscibili
 * ("[RECENSIONE GOOGLE DA INSERIRE]"). Non inserire recensioni inventate:
 * ogni voce deve essere copiata da una recensione reale, con il nome come appare su Google.
 *
 * Per aggiungerne una basta un nuovo oggetto:
 *   { author: 'Nome come appare su Google', rating: 5, text: 'Testo della recensione', date: 'marzo 2026' }
 *
 * Quando sarà scelto un widget/embed Google Reviews, il suo codice va in
 * site.googleReviews.embedHtml (src/data/site.ts): la pagina Recensioni lo mostra da sola.
 */
export interface Review {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** Testo libero, es. "marzo 2026". */
  date?: string;
}

export const reviews: Review[] = [];
