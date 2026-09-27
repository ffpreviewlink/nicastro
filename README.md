# Studio Optometrico Nicastro

Sito del professionista (optometria comportamentale, rieducazione e potenziamento visivo). Astro 7, sito statico, nessuna libreria lato client.

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # genera ./dist
npm run preview    # serve ./dist
```

## Dove si modifica cosa

Ogni dato ha un solo posto: cambiandolo lì, si aggiorna in tutto il sito.

| Cosa | File |
| :-- | :-- |
| Nome, nome dell'attività, email, telefono, P.IVA, **numero WhatsApp**, indirizzo, Facebook, sedi in cui riceve, recensioni Google (valutazione, link, widget), endpoint del modulo | [src/data/site.ts](src/data/site.ts) |
| Servizi: nome, prezzo, durata, testi di sintesi, messaggio WhatsApp | [src/data/services.ts](src/data/services.ts) |
| Esperienze, formazione, specializzazioni, punti di autorevolezza | [src/data/credentials.ts](src/data/credentials.ts) |
| Recensioni Google reali | [src/data/reviews.ts](src/data/reviews.ts) |
| Le tre slide del hero (bambini, adulti, sportivi) | [src/data/audiences.ts](src/data/audiences.ts) |
| Immagini e relativi testi alternativi | [src/data/images.ts](src/data/images.ts) |
| Voci del menu | [src/data/navigation.ts](src/data/navigation.ts) |
| Colori, font, spaziature, pulsanti | [src/styles/global.css](src/styles/global.css) |
| Dominio del sito | variabile `SITE_URL` in fase di build (o [astro.config.mjs](astro.config.mjs)) |

I testi delle pagine sono nei file di [src/pages/](src/pages/).

## Contenuti ancora da inserire

Ciò che il professionista non ha ancora fornito è scritto tra parentesi quadre, ad esempio `[INSERIRE P.IVA]`, e nel sito compare **evidenziato in giallo**. Nessun dato è stato inventato. Per elencarli tutti:

```sh
grep -rn "\[INSERIRE\|DA INSERIRE" src
grep -rn "TODO(cliente)" src     # scelte da confermare con il cliente
```

Quando un valore in `site.ts` è reale, l'evidenziazione sparisce da sola. Se il numero WhatsApp tornasse a essere un segnaposto, i pulsanti punterebbero alla pagina Contatti e il build stamperebbe un avviso.

Da fornire, in sintesi: P.IVA, altri studi in cui riceve, fotografie, recensioni Google (e link alla scheda), esperienze/formazione/specializzazioni, durata dell'analisi, dettagli su come si svolgono analisi, sedute e potenziamento, segnali per cui una valutazione visiva può essere pertinente, prezzo del potenziamento sportivo.

## Immagini

I segnaposto sono in `public/images/placeholder-*.jpg` (con la scritta «Foto da sostituire»). Per usare una foto vera: sovrascrivere il file con lo stesso nome (oppure cambiare il nome in `images.ts`), poi aggiornare `alt` e impostare `placeholder: false`.

I riquadri hanno proporzioni fisse e la foto viene ritagliata, non deformata. I file in `public/` non sono ottimizzati da Astro: esportarli già ridimensionati (max 1600 px sul lato lungo, JPG/WebP sotto i ~250 KB).

## Modulo di contatto

Senza configurazione apre il programma di posta con il messaggio già scritto (usa l'email in `site.ts`). Per un invio vero, impostare `contactForm.endpoint` con l'URL di un servizio (Formspree, Web3Forms, Netlify Forms…): il modulo invia via `fetch` e mostra l'esito.

## Recensioni

Aggiungere le recensioni reali in `reviews.ts`; valutazione media, numero e link Google in `site.ts`. Per un widget/embed Google Reviews incollare il suo codice HTML in `googleReviews.embedHtml`: la pagina Recensioni lo mostra da sola.

## Prima di pubblicare

- Impostare il dominio (`SITE_URL`): senza, canonical, sitemap e Open Graph puntano a `www.example.com`.
- Sostituire tutti i segnaposto (vedi `grep` sopra) e rifare il build.
- **Privacy policy**: il modulo raccoglie nome e recapito, quindi serve un'informativa (titolare, P.IVA, finalità). Non è nella sitemap richiesta e va fornita dal professionista.
- Far rivedere al professionista le frasi delle note legali (footer e pagine servizio: «non sono un medico…, non sostituisce il parere del medico o dell'oculista»).
- Sostituire l'immagine di anteprima social `public/images/og-default.jpg` (1200×630).

## Responsive

Mobile-first, quattro soli breakpoint (documentati in cima a [global.css](src/styles/global.css)): `30rem` telefoni grandi, `48rem` tablet verticale, `64rem` laptop, `76rem` solo header (serve ~1170 px per logo + 6 voci + CTA). Sotto 76rem il menu è a hamburger. Le schede servizio, la timeline e l'elenco «perché affidarsi» usano container query: si adattano alla propria colonna, non allo schermo. Il contenitore è fisso a 72rem; da 1600 px la scala del sito cresce del 12,5% (25% da 2240 px). Un titolo con una parola molto lunga usa `.fit-text` + `.nowrap` (vedi `professionisti.astro`) invece di spezzarla a metà.

## Movimento

Sistema unico e nativo (nessuna libreria), tutto attivo solo se l'utente non ha chiesto «riduci movimento»:

- scroll fluido con `scroll-behavior: smooth` e `scroll-padding-top` (le sezioni non finiscono sotto l'header);
- dissolvenza di 160 ms al cambio pagina (`@view-transition`, CSS puro; header e pulsante WhatsApp restano fermi);
- ingresso discreto delle sezioni sotto la piega ([src/scripts/reveal.ts](src/scripts/reveal.ts) + `.reveal` in `global.css`): opacity + 14 px, 0,46 s, sfasamento massimo 120 ms;
- ingresso del hero e delle testate al caricamento, senza ritardo sul titolo;
- dissolvenza di 160 ms per sottomenu e menu mobile; hover dei link a 180 ms.

Per escludere o aggiungere blocchi ai reveal basta modificare l'elenco `TARGETS` in `reveal.ts`.

## Scelte da sapere

- Il carosello del hero non scorre da solo: l'utente sceglie il pubblico dalle schede (Bambini / Adulti / Sportivi) o scorrendo. Senza JavaScript le tre slide sono impilate e leggibili.
- Il pulsante WhatsApp fisso si nasconde quando nella schermata c'è già una CTA WhatsApp e non compare in Contatti.
- L'indirizzo di Matelica compare in footer, Contatti e dati strutturati, ed è anche il primo degli studi in cui riceve (Contatti e Chi sono, `locations` in `site.ts`). Gli altri studi vanno aggiunti nello stesso elenco.
