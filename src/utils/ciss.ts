/**
 * Logica del questionario CISS: punteggio e accesso per età.
 * Funzioni pure, senza DOM: sono quelle coperte da tests/ciss.test.ts.
 * Nessuna interpretazione del punteggio: il risultato è solo la somma dei punti.
 */
import { cissAccess, cissOptions, cissQuestions } from '../data/ciss.ts';
import type { AgeRange, CissOption } from '../data/ciss.ts';

/** Una risposta per domanda, nell'ordine del questionario; null/undefined = non risposta. */
export type Answers = ReadonlyArray<number | null | undefined>;

function isValidAnswer(value: unknown, options: readonly CissOption[]): value is number {
  return typeof value === 'number' && options.some((option) => option.value === value);
}

/** Vero solo se ogni domanda ha esattamente una risposta tra quelle previste. */
export function isComplete(
  answers: Answers,
  questionCount: number = cissQuestions.length,
  options: readonly CissOption[] = cissOptions,
): boolean {
  if (answers.length !== questionCount) return false;
  return answers.every((answer) => isValidAnswer(answer, options));
}

/**
 * Somma dei punti delle risposte. Restituisce null finché il questionario non è completo:
 * un punteggio parziale non viene mai mostrato.
 */
export function calculateScore(
  answers: Answers,
  questionCount: number = cissQuestions.length,
  options: readonly CissOption[] = cissOptions,
): number | null {
  if (!isComplete(answers, questionCount, options)) return null;
  return (answers as readonly number[]).reduce((sum, answer) => sum + answer, 0);
}

export type AgeCheck =
  | { status: 'invalid'; message: string }
  | { status: 'eligible'; age: number }
  | { status: 'not-eligible'; age: number };

/** Controlla l'età digitata (anni interi) e se rientra negli intervalli di accesso configurati. */
export function checkAge(
  raw: string | number | null | undefined,
  access: { ranges: readonly AgeRange[]; inputMin: number; inputMax: number } = cissAccess,
): AgeCheck {
  const text = String(raw ?? '').trim();

  if (text === '') return { status: 'invalid', message: 'Inserisci l’età in anni.' };
  if (!/^\d+$/.test(text)) {
    return { status: 'invalid', message: 'Scrivi l’età con le sole cifre, in anni interi: per esempio 12.' };
  }

  const age = Number(text);
  if (age < access.inputMin || age > access.inputMax) {
    return {
      status: 'invalid',
      message: `Inserisci un’età compresa tra ${access.inputMin} e ${access.inputMax} anni.`,
    };
  }

  const allowed = access.ranges.some((range) => age >= range.min && age <= range.max);
  return { status: allowed ? 'eligible' : 'not-eligible', age };
}
