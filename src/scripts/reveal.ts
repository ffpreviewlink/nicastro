/**
 * Ingresso discreto delle sezioni durante lo scroll.
 *
 * - Solo le sezioni ancora sotto la piega vengono nascoste (classe .reveal);
 *   ciò che è già visibile al caricamento non viene mai toccato, quindi niente lampeggi.
 * - Quando una sezione entra in vista prende .is-visible: dissolvenza + risalita di 14px (vedi global.css).
 * - Elementi affiancati nello stesso contenitore partono sfalsati di 60 ms (max 120 ms).
 * - Con "riduci movimento" o senza IntersectionObserver lo script non fa nulla: la pagina resta com'è.
 * - Se un elemento nascosto riceve il focus da tastiera viene mostrato subito.
 */
const TARGETS = [
  // titoli di sezione e blocchi di testo
  '.section-head',
  '.about__text',
  '.about__photo',
  '.pro > *',
  '.prose',
  '.rating',
  '.reviews-cta',
  '.others__title',
  '.cta-band__inner',
  '.contact__channels',
  '.contact__form',
  '.service-body__main > section',
  // elenchi: ogni voce entra per conto suo, con lo sfasamento minimo
  '.card-grid > *',
  '.review-columns > *',
  '.others__list > *',
  '.trust > *',
  '.timeline > *',
  '.education > *',
  '.steps > *',
].join(',');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`main ${TARGETS.split(',').join(', main ')}`));

  // Si anima solo l'elemento più esterno: niente animazioni annidate
  const outermost = all.filter((el) => !all.some((other) => other !== el && other.contains(el)));

  // Già in vista (o quasi) al caricamento: resta com'è
  const belowFold = outermost.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);

  const perParent = new Map<Element, number>();
  for (const el of belowFold) {
    const parent = el.parentElement!;
    const index = perParent.get(parent) ?? 0;
    perParent.set(parent, index + 1);
    el.style.setProperty('--reveal-delay', `${(index % 3) * 60}ms`);
    el.classList.add('reveal');
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
        } else if (entry.boundingClientRect.bottom < 0) {
          // superato con un salto (anchor, fine pagina): mostrato senza animazione
          el.classList.remove('reveal');
        } else {
          continue;
        }
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  for (const el of belowFold) {
    observer.observe(el);
    el.addEventListener('focusin', () => el.classList.add('is-visible'), { once: true });
  }

  // Stampa: tutto visibile (il CSS @media print fa il resto)
  window.addEventListener('beforeprint', () => belowFold.forEach((el) => el.classList.add('is-visible')));
}
