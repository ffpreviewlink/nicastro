# Studio Optometrico Nicastro

Sito del professionista (optometrista, rieducatore visivo: analisi, rieducazione e potenziamento visivo). Astro 7, sito statico, nessuna libreria lato client.

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
| Nome, nome dell'attività, email, telefono, P.IVA, **numero WhatsApp**, indirizzo, sedi in cui riceve, Place ID Google, endpoint del modulo | [src/data/site.ts](src/data/site.ts) |
| Servizi: nome, prezzo, durata, testi di sintesi, messaggio WhatsApp | [src/data/services.ts](src/data/services.ts) |
| Esperienze, formazione, specializzazioni, punti di autorevolezza | [src/data/credentials.ts](src/data/credentials.ts) |
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

Da fornire, in sintesi: altri studi in cui riceve, fotografie, esperienze/formazione/specializzazioni, durata dell'analisi, dettagli su come si svolgono analisi, sedute e potenziamento, segnali per cui una valutazione visiva può essere pertinente, prezzo del potenziamento sportivo.

## Immagini

I segnaposto sono in `public/images/placeholder-*.jpg` (con la scritta «Foto da sostituire»). Per usare una foto vera: sovrascrivere il file con lo stesso nome (oppure cambiare il nome in `images.ts`), poi aggiornare `alt` e impostare `placeholder: false`.

I riquadri hanno proporzioni fisse e la foto viene ritagliata, non deformata. I file in `public/` non sono ottimizzati da Astro: esportarli già ridimensionati (max 1600 px sul lato lungo, JPG/WebP sotto i ~250 KB).

## Modulo di contatto

Senza configurazione apre il programma di posta con il messaggio già scritto (usa l'email in `site.ts`). Per un invio vero, impostare `contactForm.endpoint` con l'URL di un servizio (Formspree, Web3Forms, Netlify Forms…): il modulo invia via `fetch` e mostra l'esito.

## Recensioni Google

Le recensioni (Homepage e pagina Recensioni) sono **reali e live**: il componente [GoogleReviews.astro](src/components/GoogleReviews.astro) chiama, via `fetch` dal browser, l'endpoint PHP [public/api/google-reviews.php](public/api/google-reviews.php), che interroga Google Places API (New) e mantiene una cache server-side di 12 ore. Il sito resta statico: nessun dato è scritto nel codice, nessuna chiave API arriva mai al browser.

**Per funzionare in produzione serve solo una cosa**: creare il file `.env` **direttamente sul server Aruba**, dentro `htdocs/api/.env` (mai nel repository), con:

```
GOOGLE_PLACES_API_KEY=la-tua-chiave-reale
```

Vedi la sezione "Google Cloud" e "Deploy su Aruba" più sotto per la procedura completa. In locale (`astro dev`), senza PHP in esecuzione, il componente mostra semplicemente lo stato vuoto ("Le recensioni non sono disponibili al momento.") e il link diretto alla scheda Google: è il comportamento atteso, non un errore.

Il Place ID (`ChIJAxnfu4PFLRMRqZ-Zw4r50fI`, Studio Optometrico Nicastro) è configurato in due punti che vanno tenuti allineati se mai cambiasse: `site.googleReviews.placeId` (per costruire il link "Vedi su Google", lato frontend — non è un segreto) e la costante `PLACE_ID` in cima a `google-reviews.php` (usata per la vera chiamata a Google, lato server).

### Google Cloud: cosa abilitare

1. **API da abilitare**: solo **Places API (New)** nel progetto Google Cloud collegato alla fatturazione.
2. **API key da creare**: una nuova chiave dedicata a questo uso (non riutilizzare chiavi di altri progetti).
3. **Restrizioni da applicare**:
   - *Restrizioni applicazione*: **IP address restriction**, con l'IP pubblico del server Aruba (non "Nessuna restrizione"). Le API key lato server non possono usare restrizioni per referrer HTTP (quelle sono per chiavi lato browser, che qui non esistono).
   - *Restrizioni API*: limitare la chiave esclusivamente a **Places API (New)**.
4. **Dove va inserita**: solo nel file `.env` sul server (vedi sopra). Mai in Astro, mai in JavaScript, mai nel repository.
5. **API da NON abilitare**: Maps JavaScript API, Geocoding API, Places API (Legacy) e qualunque altra API della piattaforma Maps non sono necessarie per questa funzionalità e andrebbero abilitate solo se servissero ad altro.

### Cache

- File: `public/api/cache/reviews.json` (creato automaticamente al primo utilizzo; non è nel repository).
- TTL: 12 ore, costante `CACHE_TTL_SECONDS` in cima a `google-reviews.php`.
- Se Google non risponde (timeout, errore HTTP, JSON non valido, chiave mancante) ma esiste una cache precedente, anche scaduta, viene servita quella: l'utente non vede mai un errore tecnico.
- La cartella `cache/` ha un `.htaccess` che nega qualunque accesso HTTP diretto.

### Sicurezza della chiave

- Letta da `getenv('GOOGLE_PLACES_API_KEY')` oppure, in mancanza, da un file `.env` (parser minimale, nessuna dipendenza) nella stessa cartella dello script.
- `.env` è protetto da `.htaccess` (`Require all denied`) oltre a non essere mai committato.
- Il Place ID usato per la chiamata è una costante fissa nello script: l'endpoint ignora qualunque parametro ricevuto in query string.
- Nessun header CORS: endpoint e frontend sono sullo stesso dominio.

### Deploy su Aruba (Hosting Basic Linux)

1. `npm run build` genera `dist/`, che include già `dist/api/google-reviews.php`, `dist/api/.htaccess` e `dist/api/cache/.htaccess` (copiati automaticamente da `public/`).
2. Caricare **tutto il contenuto di `dist/`** nella document root del sito su Aruba (tipicamente `web/htdocs/<dominio>/httpdocs/` o simile: verificare il percorso esatto nel pannello Aruba).
3. Via FTP, creare manualmente `htdocs/api/.env` (stesso percorso di `google-reviews.php`) con `GOOGLE_PLACES_API_KEY=...`: questo file non arriva mai dal repository/build, va creato una sola volta direttamente sul server.
4. Permessi: la cartella `api/cache/` deve essere scrivibile dal processo PHP (in genere il default FTP/Aruba va già bene; se il primo caricamento fallisse in silenzio, verificare i permessi a 755/775 su quella cartella).
5. Verificare che Apache abbia `AllowOverride` attivo per gli `.htaccess` (standard su Aruba Hosting Linux) e che il modulo PHP sia PHP 7.4 o superiore.
6. Non sono richieste altre configurazioni: nessun Node.js, nessun database, nessun processo da avviare.

Se in futuro il piano Aruba cambiasse (es. passaggio a un piano con SSH o pannello con variabili d'ambiente native), la chiave può restare dov'è: lo script legge prima `getenv()` e usa `.env` solo come ripiego, quindi funziona senza modifiche in entrambi i casi.

## Prima di pubblicare

- Impostare il dominio (`SITE_URL`): senza, canonical, sitemap e Open Graph puntano a `www.example.com`.
- Sostituire tutti i segnaposto (vedi `grep` sopra) e rifare il build.
- **Privacy policy**: il modulo raccoglie nome e recapito, quindi serve un'informativa (titolare, P.IVA, finalità). Non è nella sitemap richiesta e va fornita dal professionista.
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
