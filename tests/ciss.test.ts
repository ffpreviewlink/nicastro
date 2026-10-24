/**
 * Test della logica del questionario CISS (nessuna dipendenza):  npm test
 * Le domande sono ricopiate qui dal PDF «DOC-20250709-WA0003..pdf» in modo indipendente
 * da src/data/ciss.ts, così un refuso o una modifica accidentale ai dati fa fallire il test.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cissAge,
  cissInstructions,
  cissMaxScore,
  cissOptions,
  cissQuestions,
  cissScoreBands,
} from '../src/data/ciss.ts';
import { calculateScore, checkAge, classifyScore, getAgeGroup, isComplete } from '../src/utils/ciss.ts';

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
  assert.equal(checkAge('0').status, 'valid');
  assert.equal(checkAge('120').status, 'valid');
});

test('età: nessun blocco, sotto i 9 anni e sopra i 18 si prosegue', () => {
  for (const age of ['0', '3', '5', '8', '9', '12', '18', '19', '45', '99']) {
    assert.deepEqual(checkAge(age), { status: 'valid', age: Number(age) }, `età ${age}`);
  }
  assert.equal(checkAge(' 7 ').status, 'valid');
  assert.deepEqual(cissAge, { inputMin: 0, inputMax: 120 });
});

// --- Fascia del punteggio -------------------------------------------------

/** Configurazione di prova: confine a 12 anni e fasce di esempio, entrambe approvate. */
const approved = {
  childMaxAge: 12,
  groups: {
    child: {
      approved: true,
      bands: [
        { min: 0, max: 9, tone: 'green', label: 'bassa' },
        { min: 10, max: 18, tone: 'yellow', label: 'intermedia' },
        { min: 19, max: 60, tone: 'red', label: 'alta' },
      ],
    },
    adult: {
      approved: true,
      bands: [
        { min: 0, max: 19, tone: 'green', label: 'adulto bassa' },
        { min: 20, max: 29, tone: 'yellow', label: 'adulto intermedia' },
        { min: 30, max: 60, tone: 'red', label: 'adulto alta' },
      ],
    },
  },
} as typeof cissScoreBands;

const labelOf = (score: number, age: number, config = approved) => {
  const result = classifyScore(score, age, config);
  return result.status === 'banded' ? `${result.group}:${result.band.label}` : 'neutral';
};

test('fasce: i valori esattamente sul confine vanno nella fascia giusta', () => {
  assert.equal(labelOf(0, 8), 'child:bassa');
  assert.equal(labelOf(9, 8), 'child:bassa');
  assert.equal(labelOf(10, 8), 'child:intermedia');
  assert.equal(labelOf(18, 8), 'child:intermedia');
  assert.equal(labelOf(19, 8), 'child:alta');
  assert.equal(labelOf(60, 8), 'child:alta');
});

test('fasce: bambini e adulti usano ciascuno la propria configurazione', () => {
  // stesso punteggio, categoria diversa → fascia diversa
  assert.equal(labelOf(25, 12), 'child:alta');
  assert.equal(labelOf(25, 13), 'adult:adulto intermedia');
  assert.equal(labelOf(19, 13), 'adult:adulto bassa');
  assert.equal(labelOf(20, 13), 'adult:adulto intermedia');
  assert.equal(labelOf(29, 40), 'adult:adulto intermedia');
  assert.equal(labelOf(30, 40), 'adult:adulto alta');
});

test('categoria: il confine bambino/adulto è incluso nei bambini', () => {
  assert.equal(getAgeGroup(12, 12), 'child');
  assert.equal(getAgeGroup(13, 12), 'adult');
  assert.equal(getAgeGroup(0, 12), 'child');
});

test('categoria: senza confine definito nessuna età ha una categoria', () => {
  assert.equal(getAgeGroup(8, null), null);
  assert.equal(getAgeGroup(40, null), null);
  assert.equal(getAgeGroup(null, 12), null);
  assert.equal(getAgeGroup(Number.NaN, 12), null);
});

test('fasce: risultato neutro se manca un presupposto', () => {
  // categoria non approvata
  const unapproved = { ...approved, groups: { ...approved.groups, child: { ...approved.groups.child, approved: false } } };
  assert.equal(labelOf(25, 8, unapproved), 'neutral');
  // categoria senza fasce (come gli adulti nella configurazione reale)
  const noAdultBands = { ...approved, groups: { ...approved.groups, adult: { approved: true, bands: [] } } };
  assert.equal(labelOf(25, 40, noAdultBands), 'neutral');
  // confine non definito
  assert.equal(labelOf(25, 8, { ...approved, childMaxAge: null }), 'neutral');
  // punteggio o età assenti
  assert.deepEqual(classifyScore(null, 8, approved), { status: 'neutral' });
  assert.deepEqual(classifyScore(25, null, approved), { status: 'neutral' });
  // punteggio che nessuna fascia contiene
  const holes = { ...approved, groups: { ...approved.groups, child: { approved: true, bands: [{ min: 0, max: 9, tone: 'green', label: 'x' }] } } };
  assert.equal(labelOf(30, 8, holes), 'neutral');
});

test('fasce: la classificazione non cambia il punteggio né dipende dalle risposte', () => {
  const answers = all(2);
  assert.equal(calculateScore(answers), 30);
  classifyScore(30, 8, approved);
  assert.equal(calculateScore(answers), 30);
});

const realTone = (score: number, age: number) => {
  const result = classifyScore(score, age);
  return result.status === 'banded' ? result.band.tone : 'neutral';
};

test('configurazione reale: bambini (fino a 18 anni) sui valori di confine', () => {
  for (const age of [0, 3, 8, 9, 12, 18]) {
    assert.equal(getAgeGroup(age), 'child');
    assert.deepEqual(
      [0, 9, 10, 18, 19, 60].map((score) => realTone(score, age)),
      ['green', 'green', 'yellow', 'yellow', 'red', 'red'],
      `età ${age}`,
    );
  }
});

test('configurazione reale: adulti (dai 19 anni) sui valori di confine', () => {
  for (const age of [19, 25, 40, 90]) {
    assert.equal(getAgeGroup(age), 'adult');
    assert.deepEqual(
      [0, 14, 15, 23, 24, 60].map((score) => realTone(score, age)),
      ['green', 'green', 'yellow', 'yellow', 'red', 'red'],
      `età ${age}`,
    );
  }
});

test('configurazione reale: lo stesso punteggio cambia fascia tra 18 e 19 anni', () => {
  assert.equal(realTone(20, 18), 'red');
  assert.equal(realTone(20, 19), 'yellow');
});

test('configurazione reale: ogni fascia ha un testo (per gli screen reader)', () => {
  for (const group of Object.values(cissScoreBands.groups)) {
    for (const band of group.bands) assert.ok(band.label.trim() !== '');
  }
});

test('configurazione reale: le fasce coprono 0–60 senza buchi né sovrapposizioni', () => {
  for (const [name, group] of Object.entries(cissScoreBands.groups)) {
    assert.equal(group.bands[0].min, 0, `${name}: parte da 0`);
    assert.equal(group.bands.at(-1)!.max, cissMaxScore, `${name}: arriva a ${cissMaxScore}`);
    group.bands.forEach((band, i) => {
      assert.ok(band.min <= band.max, `${name}: fascia ${i} valida`);
      assert.ok(band.label.trim() !== '', `${name}: fascia ${i} ha un'etichetta testuale`);
      if (i > 0) assert.equal(band.min, group.bands[i - 1].max + 1, `${name}: fascia ${i} contigua`);
    });
  }
});
