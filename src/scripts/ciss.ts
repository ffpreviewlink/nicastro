/**
 * Comportamento del popup e del questionario CISS (markup in CissPopup.astro e
 * CissQuestionnaire.astro, domande e testi in src/data/ciss.ts, calcoli in src/utils/ciss.ts).
 *
 * Privacy: le risposte vivono solo in questa variabile `state`, in memoria. Non vanno
 * in storage, URL, rete o analytics, e vengono cancellate alla chiusura del questionario.
 * Unica traccia: in sessionStorage resta il solo fatto che il popup è già comparso.
 */
import { cissMaxScore, cissOptions, cissPopup, cissQuestions } from '../data/ciss';
import { calculateScore, checkAge, isComplete } from '../utils/ciss';

type Screen = 'age' | 'ineligible' | 'question' | 'review' | 'result';

interface State {
  screen: Screen;
  /** Testo digitato nel campo età (non viene interpretato come dato personale: resta qui). */
  age: string;
  /** Indice (0-based) della domanda mostrata. */
  index: number;
  answers: (number | null)[];
  /** Vero se la domanda è stata aperta da «Modifica» nel riepilogo: poi si torna lì. */
  fromReview: boolean;
}

const freshState = (): State => ({
  screen: 'age',
  age: '',
  index: 0,
  answers: cissQuestions.map(() => null),
  fromReview: false,
});

let state = freshState();

/** Inserisce nella pagina il contenuto di un <template data-ciss-template> (una volta sola). */
function mount(name: 'popup' | 'questionnaire') {
  const template = document.querySelector<HTMLTemplateElement>(`template[data-ciss-template="${name}"]`);
  if (!template) return false;
  document.body.append(template.content.cloneNode(true));
  template.remove();
  return true;
}

let questionnaire: ReturnType<typeof setupQuestionnaire> | null | undefined;

function getQuestionnaire() {
  if (questionnaire === undefined) {
    const root = mount('questionnaire') ? document.querySelector<HTMLDialogElement>('#ciss') : null;
    const confirmEl = document.querySelector<HTMLDialogElement>('#ciss-confirm');
    questionnaire = root && confirmEl ? setupQuestionnaire(root, confirmEl) : null;
  }
  return questionnaire;
}

setupPopup();

// ---------------------------------------------------------------------------
// Punti d'accesso: qualunque elemento con data-ciss-open apre il questionario
// ---------------------------------------------------------------------------
document.addEventListener('click', (event) => {
  const trigger = (event.target as Element | null)?.closest('[data-ciss-open]');
  const current = trigger ? getQuestionnaire() : null;
  if (!current || current.root.open) return;
  event.preventDefault();
  document.querySelector<HTMLDialogElement>('#ciss-popup')?.close();
  current.open();
});

// ---------------------------------------------------------------------------
// Popup iniziale
// ---------------------------------------------------------------------------
function setupPopup() {
  if (!document.querySelector('template[data-ciss-template="popup"]') || !shouldShowPopup()) return;

  const show = () => {
    // Non interrompe chi sta già scrivendo o ha un'altra finestra aperta
    const active = document.activeElement;
    if (document.querySelector('dialog[open]') || active?.matches('input, textarea, select')) return;
    if (!mount('popup')) return;

    const el = document.querySelector<HTMLDialogElement>('#ciss-popup')!;
    el.addEventListener('click', (event) => {
      const target = event.target as Element;
      // clic sullo sfondo (il <dialog> stesso, non il suo contenuto) o sui pulsanti di chiusura
      if (target === el || target.closest('[data-ciss-popup-close]')) el.close();
    });
    markPopupShown();
    el.showModal();
  };

  // Dopo che la pagina è completa, con un attimo di respiro
  const schedule = () => window.setTimeout(show, 1200);
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}

function shouldShowPopup(): boolean {
  try {
    return sessionStorage.getItem(cissPopup.sessionKey) === null;
  } catch {
    // storage bloccato: meglio non riproporre il popup a ogni pagina
    return false;
  }
}

function markPopupShown() {
  try {
    sessionStorage.setItem(cissPopup.sessionKey, '1');
  } catch {
    /* niente da fare: il popup non verrà riproposto in questa pagina */
  }
}

// ---------------------------------------------------------------------------
// Questionario
// ---------------------------------------------------------------------------
function setupQuestionnaire(root: HTMLDialogElement, confirmEl: HTMLDialogElement) {
  const $ = <T extends Element>(selector: string, scope: ParentNode = root) => scope.querySelector<T>(selector)!;
  const screens = Array.from(root.querySelectorAll<HTMLElement>('[data-screen]'));
  const screenEl = (name: Screen) => screens.find((s) => s.dataset.screen === name)!;

  const ageInput = $<HTMLInputElement>('[data-age]');
  const ageError = $<HTMLElement>('[data-age-error]');
  const answerError = $<HTMLElement>('[data-answer-error]');
  const reviewError = $<HTMLElement>('[data-review-error]');
  const radios = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="ciss-answer"]'));
  const progress = $<HTMLElement>('[data-progress]');
  const progressFill = $<HTMLElement>('[data-progress-fill]');
  const rowTemplate = $<HTMLTemplateElement>('[data-summary-row]');
  const total = cissQuestions.length;

  const hasAnswers = () => state.answers.some((a) => a !== null);
  const labelOf = (value: number | null) => cissOptions.find((o) => o.value === value)?.label ?? '';

  // --- Navigazione tra le schermate ---------------------------------------
  function show(screen: Screen) {
    state.screen = screen;
    for (const el of screens) el.hidden = el.dataset.screen !== screen;

    progress.hidden = screen !== 'question' && screen !== 'review';
    const done = screen === 'question' ? state.index + 1 : total;
    progressFill.style.width = `${(done / total) * 100}%`;

    if (screen === 'age') renderAge();
    if (screen === 'question') renderQuestion();
    if (screen === 'review') renderSummary('review');
    if (screen === 'result') renderResult();

    const current = screenEl(screen);
    const body = current.querySelector<HTMLElement>('.dialog__body');
    if (body) body.scrollTop = 0;
    current.querySelector<HTMLElement>('[data-focus]')?.focus({ preventScroll: true });
  }

  function goToQuestion(index: number, fromReview = false) {
    state.index = index;
    state.fromReview = fromReview;
    show('question');
  }

  // --- Schermata età ------------------------------------------------------
  function renderAge() {
    ageInput.value = state.age;
    setError(ageInput, ageError, '');
  }

  function setError(field: HTMLElement | null, error: HTMLElement, message: string) {
    error.textContent = message;
    error.hidden = message === '';
    field?.setAttribute('aria-invalid', String(message !== ''));
    if (message === '') field?.removeAttribute('aria-invalid');
  }

  ageInput.addEventListener('input', () => {
    state.age = ageInput.value;
    if (!ageError.hidden) setError(ageInput, ageError, '');
  });

  screenEl('age').addEventListener('submit', (event) => {
    event.preventDefault();
    const result = checkAge(ageInput.value);
    if (result.status === 'invalid') {
      setError(ageInput, ageError, result.message);
      ageInput.focus();
    } else if (result.status === 'not-eligible') {
      show('ineligible');
    } else {
      goToQuestion(state.index);
    }
  });

  function firstUnanswered() {
    const first = state.answers.findIndex((a) => a === null);
    return first === -1 ? 0 : first;
  }

  // --- Domanda ------------------------------------------------------------
  function renderQuestion() {
    const { index } = state;
    $('[data-counter]').textContent = `Domanda ${index + 1} di ${total}`;
    $('[data-question]').textContent = cissQuestions[index];
    $<HTMLElement>('[data-instructions]').hidden = index !== 0;
    for (const radio of radios) radio.checked = Number(radio.value) === state.answers[index];
    answerError.hidden = true;
  }

  for (const radio of radios) {
    radio.addEventListener('change', () => {
      state.answers[state.index] = Number(radio.value);
      answerError.hidden = true;
    });
  }

  screenEl('question').addEventListener('submit', (event) => {
    event.preventDefault();
    if (state.answers[state.index] === null) {
      answerError.hidden = false;
      radios[0].focus();
      return;
    }
    if (state.fromReview) show('review');
    else if (state.index < total - 1) goToQuestion(state.index + 1);
    else show('review');
  });

  // --- Riepilogo (modificabile) e punteggio -------------------------------
  function renderSummary(kind: 'review' | 'result') {
    const list = $<HTMLElement>(`[data-summary="${kind}"]`);
    list.replaceChildren();
    reviewError.hidden = true;

    state.answers.forEach((answer, index) => {
      const row = rowTemplate.content.cloneNode(true) as DocumentFragment;
      $<HTMLElement>('[data-row-number]', row).textContent = String(index + 1);
      $<HTMLElement>('[data-row-question]', row).textContent = cissQuestions[index];
      $<HTMLElement>('[data-row-answer]', row).textContent = answer === null ? 'Nessuna risposta' : labelOf(answer);

      const points = $<HTMLElement>('[data-row-points]', row);
      points.textContent = kind === 'result' && answer !== null ? `${answer} ${answer === 1 ? 'punto' : 'punti'}` : '';

      const edit = $<HTMLButtonElement>('[data-row-edit]', row);
      edit.hidden = kind === 'result';
      edit.setAttribute('aria-label', `Modifica la risposta alla domanda ${index + 1}`);
      edit.addEventListener('click', () => goToQuestion(index, true));

      list.append(row);
    });
  }

  screenEl('review').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!isComplete(state.answers, total)) {
      // Non si arriva al punteggio con risposte mancanti: si riparte dalla prima senza risposta
      goToQuestion(firstUnanswered(), true);
      return;
    }
    show('result');
  });

  function renderResult() {
    const score = calculateScore(state.answers, total);
    if (score === null) {
      show('review');
      return;
    }
    $('[data-score]').textContent = String(score);
    $('[data-score-spoken]').textContent = `${score} su ${cissMaxScore}`;
    renderSummary('result');
  }

  // --- Pulsanti ------------------------------------------------------------
  root.addEventListener('click', (event) => {
    const target = event.target as Element;
    const exit = target.closest('[data-ciss-exit]');
    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;

    if (exit) return void requestExit();

    switch (action) {
      case 'age-back':
        return void requestExit();
      case 'ineligible-back':
        return show('age');
      case 'question-back':
        if (state.fromReview) return show('review');
        if (state.index > 0) return goToQuestion(state.index - 1);
        return show('age');
      case 'review-back':
        return goToQuestion(total - 1);
      case 'result-edit':
        return show('review');
      case 'result-restart':
        return void requestRestart();
    }
  });

  // --- Uscita e ricomincia, con conferma se ci sono risposte ----------------
  async function requestExit() {
    if (hasAnswers()) {
      const ok = await ask({
        title: 'Vuoi uscire dal questionario?',
        text: 'Le risposte non vengono salvate: se esci andranno perse.',
        cancel: 'Continua a compilare',
        confirm: 'Esci',
      });
      if (!ok) return;
    }
    root.close();
  }

  async function requestRestart() {
    const ok = await ask({
      title: 'Vuoi ricominciare?',
      text: 'Le risposte inserite verranno cancellate.',
      cancel: 'Annulla',
      confirm: 'Ricomincia',
    });
    if (!ok) return;
    resetUi();
    show('age');
  }

  // Esc: stessa strada del pulsante X, quindi con la conferma
  root.addEventListener('cancel', (event) => {
    event.preventDefault();
    void requestExit();
  });

  // Alla chiusura le risposte vengono cancellate; la schermata si azzera a finestra ormai
  // sparita, così non si vede cambiare durante la dissolvenza.
  root.addEventListener('close', () => {
    state = freshState();
    window.setTimeout(() => {
      if (!root.open) resetUi();
    }, 400);
  });

  function resetUi() {
    state = freshState();
    ageInput.value = '';
    for (const radio of radios) radio.checked = false;
    for (const list of root.querySelectorAll('[data-summary]')) list.replaceChildren();
    $('[data-score]').textContent = '';
    $('[data-score-spoken]').textContent = '';
    for (const el of screens) el.hidden = el.dataset.screen !== 'age';
    progress.hidden = true;
  }

  return {
    root,
    open() {
      if (root.open) return;
      resetUi();
      root.showModal();
      show('age');
    },
  };

  // --- Finestra di conferma -------------------------------------------------
  function ask(options: { title: string; text: string; cancel: string; confirm: string }): Promise<boolean> {
    $('[data-confirm-title]', confirmEl).textContent = options.title;
    $('[data-confirm-text]', confirmEl).textContent = options.text;
    $('[data-confirm-cancel]', confirmEl).textContent = options.cancel;
    $('[data-confirm-ok]', confirmEl).textContent = options.confirm;

    return new Promise((resolve) => {
      confirmEl.addEventListener('close', () => resolve(confirmEl.returnValue === 'confirm'), { once: true });
      confirmEl.returnValue = 'cancel';
      confirmEl.showModal();
    });
  }
}
