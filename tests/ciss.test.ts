/**
 * Test della logica del questionario CISS (nessuna dipendenza):  npm test
 * Le domande sono ricopiate qui dal PDF «DOC-20250709-WA0003..pdf» in modo indipendente
 * da src/data/ciss.ts, così un refuso o una modifica accidentale ai dati fa fallire il test.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cissAccess, cissInstructions, cissMaxScore, cissOptions, cissQuestions } from '../src/data/ciss.ts';
import { calculateScore, checkAge, isComplete } from '../src/utils/ciss.ts';

const PDF_QUESTIONS = [
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
];

const all = (value: number | null) => Array.from({ length: 15 }, () => value);

test('le 15 domande coincidono con il PDF, parola per parola e in ordine', () => {
  assert.deepEqual([...cissQuestions], PDF_QUESTIONS);
});

test('le istruzioni per il soggetto coincidono con il PDF', () => {
  assert.equal(
    cissInstructions,
    'Ti preghiamo di rispondere alle seguenti domande su come senti i tuoi occhi quando leggi o lavori da vicino.',
  );
});

test('le cinque risposte hanno etichette e punti del PDF', () => {
  assert.deepEqual(
    cissOptions.map((o) => [o.label, o.value]),
    [
      ['Mai', 0],
      ['Raramente', 1],
      ['Qualche volta', 2],
      ['Spesso', 3],
      ['Sempre', 4],
    ],
  );
});

test('il punteggio massimo è 60', () => {
  assert.equal(cissMaxScore, 60);
});

test('punteggio minimo: tutte «Mai» = 0', () => {
  assert.equal(calculateScore(all(0)), 0);
});

test('punteggio massimo: tutte «Sempre» = 60', () => {
  assert.equal(calculateScore(all(4)), 60);
});

test('punteggio intermedio: somma semplice dei punti', () => {
  // 5×0 + 4×1 + 3×2 + 2×3 + 1×4 = 20
  const answers = [0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4];
  assert.equal(calculateScore(answers), 20);
  // tutte «Qualche volta»: 15 × 2 = 30
  assert.equal(calculateScore(all(2)), 30);
});

test('nessun punteggio finché manca anche una sola risposta', () => {
  const answers = all(4);
  answers[7] = null;
  assert.equal(isComplete(answers), false);
  assert.equal(calculateScore(answers), null);
  assert.equal(calculateScore([]), null);
  assert.equal(calculateScore(all(4).slice(0, 14)), null);
});

test('valori fuori scala o non numerici non sono risposte valide', () => {
  assert.equal(calculateScore([...all(1).slice(0, 14), 5]), null);
  assert.equal(calculateScore([...all(1).slice(0, 14), -1]), null);
  assert.equal(calculateScore([...all(1).slice(0, 14), 1.5]), null);
  assert.equal(calculateScore([...all(1).slice(0, 14), '2' as unknown as number]), null);
  assert.equal(calculateScore([...all(1), 1]), null);
});

test('età: campo vuoto o non numerico è un errore', () => {
  for (const raw of ['', '   ', null, undefined, 'abc', '12a', '9,5', '9.5', '-3', '1e1']) {
    assert.equal(checkAge(raw).status, 'invalid', `«${raw}» dovrebbe essere non valida`);
  }
});

test('età: fuori dal limite di digitazione è un errore', () => {
  assert.equal(checkAge('121').status, 'invalid');
  assert.equal(checkAge(999).status, 'invalid');
  assert.equal(checkAge('0').status, 'not-eligible');
});

test('età: l’intervallo documentato (9–18) è incluso agli estremi', () => {
  assert.equal(checkAge('9').status, 'eligible');
  assert.equal(checkAge(' 12 ').status, 'eligible');
  assert.equal(checkAge('18').status, 'eligible');
  assert.equal(checkAge('8').status, 'not-eligible');
  assert.equal(checkAge('19').status, 'not-eligible');
  assert.equal(checkAge('45').status, 'not-eligible');
});

test('età: l’accesso segue la configurazione, senza intervalli non entra nessuno', () => {
  const none = { ...cissAccess, ranges: [] };
  assert.equal(checkAge('12', none).status, 'not-eligible');
  const adults = { ...cissAccess, ranges: [{ min: 19, max: 99 }] };
  assert.equal(checkAge('40', adults).status, 'eligible');
  assert.equal(checkAge('12', adults).status, 'not-eligible');
});
