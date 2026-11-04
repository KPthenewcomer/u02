# Kevin | Developer Portfolio

Publicerad sida: https://github.com/KPthenewcomer/u01.git

## Reflektion

### Från skiss till kod

Jag utgick från Pawans design och delade upp innehållet i Home, About, Tech Stack, Projects och Contact. Uppdelningen gjorde det lättare att koppla varje del av skissen till en tydlig struktur i HTML.

En utmaning var att få profilbildens gradientram att fungera. När jag använde `filter: grayscale(100%)` på bilden påverkades även en ram som låg på samma element. Lösningen blev att lägga bilden i en separat `.profile-frame`. Då kunde ramen ha en färgad gradient medan själva bilden var svartvit. Gradientens färger är `#00c0fd` och `#e70faa`.
Jag försökte först återskapa logotypen med text och CSS, men tecknens former blev annorlunda än i skissen. Därför bytte jag den övre delen till fem SVG-bilder. Det gör att formerna följer originalet och behåller sin skärpa när de skalas. Namnet Kevin/r under symbolen är fortfarande text.

Jag valde en silhuettbild av Michael Jackson eftersom jag inte hittade någon bra profilbild på mig själv som passade. Det fungerar som en tillfällig visuell lösning, men gör portfolion mindre personlig. Med mer tid skulle jag ersätta den med ett eget fotografi.

Jag har samlat innehållet i en HTML-fil. Navigationen använder därför ankarlänkar, exempelvis `href="#about"`, som leder till motsvarande sektions `id`. Jag föredrog också att visa logotypen och sidfotstexten en gång. Det innebär en avvikelse från uppgiftens krav på separata undersidor, vilket jag behöver stämma av med läraren.

### Semantik

Jag använde `header` för sidans inledning och `nav` för huvudnavigationen. Sidans huvudinnehåll ligger i `main`, där varje ämnesområde har en egen `section`. På så sätt beskriver HTML-strukturen innehållets funktion.

Introduktionen har sidans `h1`. Sektionerna använder `h2` och exempelvis projektens rubriker använder `h3`. Rubriknivåerna visar innehållets ordning och väljs inte enbart efter önskad textstorlek.

Projektkorten använder `article` eftersom varje projekt är en självständig presentation. Teknikerna ligger i en lista eftersom de är en samling likvärdiga objekt.

Jag använder `div` där jag behöver gruppera element för layout utan att gruppen har en egen semantisk betydelse. Exempel är `.home-content` och `.profile-frame`. Profilramens uppgift är visuell, så ett eget semantiskt element skulle inte tillföra något.

### Layout och responsivitet

Flexbox passar för delar där innehållet främst ordnas i en riktning, till exempel navigationen och introduktionens text och bild. Grid passar bättre för projektkorten och teknikikonerna, där jag behöver styra flera kolumner och mellanrum mellan dem.

CSS:en utgår från mobilens mindre utrymme. Media queries anpassar sedan layouten till större skärmar, exempelvis genom att visa fler kolumner och placera introduktionens text och bild bredvid varandra. Brytpunkterna behöver ligga där innehållet får tillräckligt med plats, snarare än enbart följa en viss telefonmodell.

Färgvariabler gör det lättare att hålla samma färger genom hela sidan. Om en färg behöver ändras kan jag göra det på ett ställe.

Jag har även lagt till `position: sticky` på `.site-header` för att navigationen ska vara tillgänglig när man scrollar. `scroll-margin-top` på sektionerna lämnar utrymme ovanför innehållet när en ankarlänk används, så att headern inte täcker det.

### Tillgänglighet och tester

Navigationen består av vanliga länkar som kan användas med tangentbord. Sociala länkar har beskrivande `aria-label`, medan bilderna inuti har tom `alt` eftersom länkens namn redan förklarar målet.

Profilbilden har alt-texten ”Silhouette of Michael Jackson”, eftersom alternativtexten ska beskriva bilden som faktiskt visas. Projektens abstrakta bilder har tom alt-text eftersom de används som dekoration och inte tillför information om projekten.

Mobilmenyn använder `details` och `summary`. Det ger en inbyggd funktion för att öppna och stänga menyn utan JavaScript. Menyn stängs däremot inte automatiskt när en länk väljs, vilket är en begränsning i lösningen.

Jag har lagt till synlig fokusmarkering med `:focus-visible` och en ”Skip to content”-länk så att tangentbordsanvändare kan hoppa över navigationen. Med `prefers-reduced-motion` stängs mjuk scrollning av för användare som föredrar mindre rörelse.

Kontrastberäkningen visade att originalgradientens blå färg hade för låg kontrast mot vitt. Därför använder läsbar gradienttext en mörkare variant, medan logotypen och profilramen behåller originalfärgerna. Även texten på de gröna etiketterna har mörkats. Det är en medveten avvägning mellan skissens färger och läsbarhet.

Jag validerade HTML med W3C:s validator. Den första kontrollen visade 18 fel som berodde på mellanslag i bildsökvägarna. Efter att mellanslagen skrivits som `%20` fick jag 0 fel. Eftersom HTML därefter har ändrats behöver även slutversionen valideras.

Jag testade också sidan med Lighthouse i mobilvy. Resultatet blev 100 poäng för tillgänglighet, 91 för prestanda,100 för Best Practices och 91 för SEO. De automatiska tillgänglighetskontrollerna hittade inga poängsänkande problem. Resultatet behöver kompletteras med manuella tester av tangentbordsnavigation, mobilmenyn och
layouten, eftersom automatiska tester inte kan kontrollera allt.

### Styrkor och brister

En styrka är att innehållet har en tydlig struktur och att återkommande delar använder samma klasser. Det gör det lättare att ändra exempelvis alla projektkort samtidigt.

Det svåraste har varit att hålla HTML-strukturen korrekt och förstå hur olika CSS-regler påverkar varandra. Med mer tid skulle jag rensa bort överlappande regler, jämföra avstånd och storlekar mer noggrant med Figma och ersätta exempelmaterial med egna projekt.

### AI-verktyg

Jag har använt ChatGPT för kodförslag, felsökning och förklaringar av HTML och CSS. AI har även hjälpt mig att formulera denna reflektion.

Jag har anpassat förslagen genom att ändra namn, bildfiler, gradientfärger och navigation. Bland annat ändrade jag länkar till separata filer till ankarlänkar. Arbetet visade att genererad kod behöver granskas i sitt sammanhang: ett förslag kan fungera för en annan struktur än den jag faktiskt använder.
