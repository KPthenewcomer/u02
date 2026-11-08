// Gemensam hämtning för både CV-filen och GitHubs API.

export class HttpError extends Error {
  constructor(response) {
    super(`HTTP error: ${response.status}`);
    this.name = "HttpError";
    this.status = response.status;
    // GitHub skickar 0 här när gränsen för anrop utan inloggning är nådd.
    this.rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
  }
}

export class DataError extends Error {
  constructor(message) {
    super(message);
    this.name = "DataError";
  }
}

const DEFAULT_TIMEOUT_MS = 10000;

export async function fetchJson(url, { timeoutMs = DEFAULT_TIMEOUT_MS, headers } = {}) {
  // AbortSignal.timeout avbryter anropet och kastar ett TimeoutError.
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(timeoutMs),
  });

  // Fetch kastar inte vid exempelvis 404 eller 403, så det kontrolleras här.
  if (!response.ok) {
    throw new HttpError(response);
  }

  try {
    return await response.json();
  } catch {
    throw new DataError("The response was not valid JSON");
  }
}

// Översätter ett tekniskt fel till en mening som besökaren förstår.
export function describeFetchError(error, subject) {
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return `Loading ${subject} took too long.`;
  }

  if (error instanceof HttpError) {
    if ((error.status === 403 || error.status === 429) && error.rateLimitRemaining === "0") {
      return `GitHub has temporarily limited requests, so ${subject} could not be loaded. The limit resets within an hour.`;
    }

    if (error.status === 404) {
      return `${capitalize(subject)} could not be found.`;
    }

    return `The server answered with an error (${error.status}), so ${subject} could not be loaded.`;
  }

  if (error instanceof DataError) {
    return `${capitalize(subject)} arrived in an unexpected format.`;
  }

  // Fetch kastar TypeError när nätverket inte går att nå.
  if (error instanceof TypeError) {
    return `Could not connect to load ${subject}. Check your connection.`;
  }

  return `Something went wrong while loading ${subject}.`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
