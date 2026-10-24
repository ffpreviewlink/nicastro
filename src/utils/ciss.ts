/**
 * Logica del questionario CISS. Funzioni pure, senza DOM, coperte da tests/ciss.test.ts.
 * Tre compiti separati:
 *   1. punteggio: solo la somma dei punti, mai influenzata dall'età;
 *   2. età: validazione del dato digitato (nessun blocco);
 *   3. fascia: categoria d'età + soglie da `cissScoreBands` (src/data/ciss.ts).
 * La presentazione grafica del risultato sta nel componente, non qui.
 */
import { cissAge, cissOptions, cissQuestions, cissScoreBands } from '../data/ciss.ts';
import type { CissOption, ScoreBand } from '../data/ciss.ts';

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

export type AgeCheck = { status: 'invalid'; message: string } | { status: 'valid'; age: number };

/** Controlla l'età digitata (anni interi). Qualunque età valida può proseguire. */
export function checkAge(
  raw: string | number | null | undefined,
  limits: { inputMin: number; inputMax: number } = cissAge,
): AgeCheck {
  const text = String(raw ?? '').trim();

  if (text === '') return { status: 'invalid', message: 'Inserisci l’età in anni.' };
  if (!/^\d+$/.test(text)) {
    return { status: 'invalid', message: 'Scrivi l’età con le sole cifre, in anni interi: per esempio 12.' };
  }

  const age = Number(text);
  if (age < limits.inputMin || age > limits.inputMax) {
    return {
      status: 'invalid',
      message: `Inserisci un’età compresa tra ${limits.inputMin} e ${limits.inputMax} anni.`,
    };
  }

  return { status: 'valid', age };
}

export type AgeGroup = 'child' | 'adult';

/**
 * Categoria d'età secondo `childMaxAge` (incluso). Null finché il confine non è stato definito
 * dal professionista: l'età non viene mai interpretata "a intuito".
 */
export function getAgeGroup(
  age: number | null | undefined,
  childMaxAge: number | null = cissScoreBands.childMaxAge,
): AgeGroup | null {
  if (typeof age !== 'number' || !Number.isFinite(age) || childMaxAge === null) return null;
  return age <= childMaxAge ? 'child' : 'adult';
}

export type ScoreClassification =
  | { status: 'neutral' }
  | { status: 'banded'; group: AgeGroup; band: ScoreBand };

/**
 * Fascia del punteggio per l'età data. Resta "neutral" (nessun colore né etichetta) se manca
 * il punteggio o l'età, se il confine bambino/adulto non è definito, se la categoria non è
 * approvata o se nessuna fascia contiene il punteggio. Non modifica mai il punteggio.
 */
export function classifyScore(
  score: number | null | undefined,
  age: number | null | undefined,
  config: typeof cissScoreBands = cissScoreBands,
): ScoreClassification {
  const group = getAgeGroup(age, config.childMaxAge);
  if (typeof score !== 'number' || group === null) return { status: 'neutral' };

  const { approved, bands } = config.groups[group];
  const band = approved ? bands.find((b) => score >= b.min && score <= b.max) : undefined;
  return band ? { status: 'banded', group, band } : { status: 'neutral' };
}
