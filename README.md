# Kevin | Portfolio (u02)

Publicerad sida: https://kpthenewcomer.github.io/u02/

## Reflektion

### Datans väg

När sidan laddas anropar `main.js` funktionen `loadProjects()`. Den skickar ett GET-anrop till `https://api.github.com/users/KPthenewcomer/repos?sort=updated&per_page=100` via `fetchJson()` i `fetch-json.js`, med headern `Accept: application/vnd.github+json`. Det är ett CORS-anrop från en annan domän, vilket fungerar eftersom GitHub svarar med `Access-Control-Allow-Origin: *`.

Svaret är en HTTP-respons med statuskod, headers och en JSON-array med ett objekt per repo. `fetch` kastar inget fel vid exempelvis 404 eller 403, så jag kontrollerar `response.ok` själv och kastar ett `HttpError`. Därefter tolkas kroppen med `response.json()`.

Innan något visas kontrollerar `loadAndRenderProjects()` att svaret är en array, filtrerar bort forkar och repon som saknar namn eller länk, och gör om varje repo till ett eget objekt med `toProject()`. Där slås GitHub-datan ihop med mina beskrivningar ur `projects.json`. Resten av koden behöver då bara känna till mitt format. Korten byggs med `createElement` och `textContent` och läggs in med ett enda `replaceChildren()`. `textContent` gör att en beskrivning från GitHub aldrig tolkas som HTML.

### Två datakällor

`cv.json` har jag skrivit själv. Den ligger på samma server, har inga anropsgränser och ändras bara när jag ändrar den. Jag validerar den ändå med `isValidCvList()`, eftersom ett skrivfel i JSON annars ger en trasig sida.

GitHub-datan styr jag inte över. Fält kan vara `null`, som `description` på mina repon. API:et har en gräns på 60 anrop i timmen utan inloggning. Fältet `language` visar bara huvudspråket, så 4YOURSKIN räknades som bara HTML trots att det innehåller CSS och JavaScript. Därför har varje fält en reserv: beskrivningen tas från `projects.json`, sedan från GitHub, sedan en standardtext. Länken till live-versionen byggs från `has_pages` om repot saknar egen webbadress.

`projects.json` är ett tillägg. Om den inte går att läsa returnerar `fetchProjectDetails()` en tom `Map`, och projekten visas ändå. De två hämtningarna körs parallellt med `Promise.all`.

### DOM och händelser

Skriptet laddas med `type="module"`, så det körs först när HTML:en är tolkad och alla element finns.

Jag lyssnar på tre händelser:

- **Klick på temaknappen** i `theme.js`.
- **Klick på "Try again"**. Lyssnaren kopplas en gång i `createDataSection()` och kör samma hämtning igen.
- **Klick på filtergruppen** i `projects.js`. Jag använder event delegation, alltså en lyssnare på gruppen i stället för en per knapp. Knapparna byggs om vid varje hämtning, men gruppen finns kvar. Med `event.target.closest(".filter-button")` hittar jag knappen som klickades.

Filtret döljer kort med `hidden` och uppdaterar statusraden.

### Markup jag inte skrivit för hand

Det genererade följer samma regler som HTML:en. CV-poster och projekt ligger i `ul`/`li`, varje post är en `article`, och rubrikerna fortsätter hierarkin: `h2` för sektionen, `h3` för Work/Education och projektnamn, `h4` för CV-poster. Filtret består av riktiga `button` med `aria-pressed`, i en grupp med `role="group"` och en `aria-label`.

Länkarna heter "View code" visuellt, men en dold `span` gör att skärmläsare hör "View code for brain-climb". Statusraderna har `role="status"` så att laddning och fel läses upp, och listorna får `aria-busy` medan de hämtas. Lyckas ett nytt försök via "Try again" flyttas fokus till sektionens rubrik. Misslyckas det stannar fokus på knappen. Sidan är på engelska (`lang="en"`), men CV-poster och beskrivningar från JSON är på svenska och får `lang="sv"` så att skärmläsare uttalar dem rätt.

### Temaväxlingen

Alla färger är variabler på `:root`. Mörkt läge är regeln `:root.dark-theme`, som ger samma variabler nya värden. JavaScript gör bara `classList.toggle("dark-theme")` och sparar valet i `localStorage`. Vid första besöket används `prefers-color-scheme`. `theme-init.js` körs i `<head>` innan sidan ritas, så ett sparat mörkt läge inte blinkar vitt först.

Med färger i JavaScript hade jag behövt hitta varje element, även kort som skapas senare. Pseudo-element som laddningssnurran (`::before`) och gradienterna går inte att styla inline. Färgerna hade dessutom legat på två ställen, i CSS och i JS.

### När det inte går som tänkt

`createDataSection()` hanterar samma lägen för CV och projekt:

- **Laddar:** "Loading the projects from GitHub…" med en snurra.
- **Långsamt:** efter 3 sekunder ändras texten till att servern svarar långsamt.
- **Inget svar:** `AbortSignal.timeout(10000)` avbryter efter 10 sekunder.
- **Fel:** `describeFetchError()` översätter felet till en begriplig mening (timeout, nätverksfel, GitHubs anropsgräns, serverfel eller felaktigt format) och visar "Try again".
- **Tom lista:** ett meddelande med länk till min GitHub-profil.

Jag testade lägena mot en lokal testserver som svarade med 500-fel, 403 med uttömd anropsgräns, ogiltig JSON, en tom lista och ett svar efter 15 sekunder. Alla gav rätt text på sidan och inga konsolfel.

### Tillgänglighet och test

- **Tangentbord:** jag stegade igenom sidan med Tab i Chrome. Alla 24 interaktiva element nåddes i logisk ordning (skip-länk, meny, tema, filter, projektlänkar, e-post), alla hade synlig fokusmarkering och inget fastnade.
- **Kontrast:** jag räknade ut kontrasten för alla textfärger i båda lägena. Lägst är 5,3:1 (gradienttexten i ljust läge), så allt klarar WCAG AA. Det aktiva filtret visas med både färg och en bock.
- **Validering:** W3C-validatorn gav 0 fel, både för `index.html` och för sidan efter att JavaScript byggt innehållet.

### Styrkor och brister

Jag är mest nöjd med att felhanteringen bara finns på ett ställe. `fetchJson()` och `createDataSection()` används av båda sektionerna, så laddning, timeout och återförsök fungerar likadant överallt.

Det jag skulle bygga om är beroendet av GitHub vid varje besök. Jag skulle spara senaste lyckade svaret i `localStorage` med en tidsstämpel och visa det direkt, och sedan hämta nytt i bakgrunden. Då klarar sidan både anropsgränsen och ett GitHub som ligger nere, och visar "senast uppdaterad" i stället för ett fel. Jag skulle också ta bort den handskrivna tekniklistan i `projects.json` och hämta `languages_url` per repo, men då behövs cachningen först eftersom det blir ett anrop per projekt.

### AI-verktyg

Jag har använt Claude för en del av koden i den här uppgiften: uppdelningen i moduler, hämtningen från GitHub, temaväxlingen, filtret och testerna av fellägena. 

Jag har granskat resultatet på sidan och styrt om flera gånger. Projekten visade bara ett språk och saknade JavaScript, vilket ledde till `projects.json`. Jag rättade beskrivningen av mitt arbete på HVB-hemmet, som gäller ungdomar. Jag bestämde också språket: sidan på engelska och mina egna texter på svenska. Jag har gått igenom koden fil för fil för att kunna förklara den.
