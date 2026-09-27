/**
 * Un contenuto non ancora fornito dal cliente è scritto tra parentesi quadre,
 * es. "[INSERIRE EMAIL]". Il sito lo mostra evidenziato (vedi <Fill />) e
 * non lo usa mai in attributi tecnici (href, JSON-LD, meta).
 *
 * Per trovare tutto ciò che manca:  grep -rn "\[INSERIRE\|DA INSERIRE" src
 */
export const isPlaceholder = (value: unknown): value is string =>
  typeof value === 'string' && /^\[.+\]$/.test(value.trim());

/** Vero solo per un valore reale (non vuoto, non segnaposto). */
export const hasValue = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '' && !isPlaceholder(value);
