import { describeFetchError } from "./fetch-json.js";

const SLOW_RESPONSE_DELAY_MS = 3000;

/*
  Sköter de lägen som både CV:t och projekten har gemensamt:
  laddar, svarar långsamt, fel med återförsök och klart.
  `load` hämtar och renderar datan och returnerar statustexten som ska visas.
*/
export function createDataSection({ statusElement, retryButton, busyElement, subject, load }) {
  async function run() {
    const slowTimerId = setTimeout(() => {
      statusElement.textContent = `Hämtar fortfarande ${subject}, servern svarar långsamt…`;
    }, SLOW_RESPONSE_DELAY_MS);

    statusElement.textContent = `Hämtar ${subject}…`;
    statusElement.classList.add("is-loading");
    busyElement.setAttribute("aria-busy", "true");
    retryButton.disabled = true;

    try {
      statusElement.textContent = await load();
      hideRetryButton();
    } catch (error) {
      statusElement.textContent = `${describeFetchError(error, subject)} Försök igen.`;
      retryButton.hidden = false;
    } finally {
      clearTimeout(slowTimerId);
      statusElement.classList.remove("is-loading");
      busyElement.setAttribute("aria-busy", "false");
      retryButton.disabled = false;
    }
  }

  // Fokus flyttas till statustexten om knappen som har fokus försvinner.
  function hideRetryButton() {
    if (document.activeElement === retryButton) {
      statusElement.focus();
    }

    retryButton.hidden = true;
  }

  retryButton.addEventListener("click", run);

  return run;
}
