import { describeFetchError } from "./fetch-json.js";

const SLOW_RESPONSE_DELAY_MS = 3000;

/*
  Sköter de lägen som både CV:t och projekten har gemensamt:
  laddar, svarar långsamt, fel med återförsök och klart.
  `load` hämtar och renderar datan och returnerar statustexten som ska visas.
*/
export function createDataSection({ statusElement, retryButton, busyElement, subject, load }) {
  async function run() {
    // Måste läsas innan knappen inaktiveras, eftersom den då tappar fokus.
    const retryHadFocus = document.activeElement === retryButton;

    const slowTimerId = setTimeout(() => {
      statusElement.textContent = `Still loading ${subject}, the server is responding slowly…`;
    }, SLOW_RESPONSE_DELAY_MS);

    statusElement.textContent = `Loading ${subject}…`;
    statusElement.classList.add("is-loading");
    busyElement.setAttribute("aria-busy", "true");
    retryButton.disabled = true;

    try {
      statusElement.textContent = await load();
      retryButton.hidden = true;

      if (retryHadFocus) {
        moveFocusAfterSuccess();
      }
    } catch (error) {
      statusElement.textContent = `${describeFetchError(error, subject)} Please try again.`;
      retryButton.hidden = false;
    } finally {
      clearTimeout(slowTimerId);
      statusElement.classList.remove("is-loading");
      busyElement.setAttribute("aria-busy", "false");
      retryButton.disabled = false;
    }

    // Misslyckades ett nytt försök får knappen tillbaka fokus.
    if (retryHadFocus && !retryButton.hidden) {
      retryButton.focus();
    }
  }

  /*
    Knappen som hade fokus är borta. Fokus flyttas till statustexten,
    eller till sektionens rubrik om statustexten är tom.
  */
  function moveFocusAfterSuccess() {
    const focusTarget = statusElement.textContent
      ? statusElement
      : statusElement.closest("section").querySelector("h2");

    focusTarget.tabIndex = -1;
    focusTarget.focus();
  }

  retryButton.addEventListener("click", run);

  return run;
}
