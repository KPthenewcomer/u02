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
    return `Det tog för lång tid att hämta ${subject}.`;
  }

  if (error instanceof HttpError) {
    if ((error.status === 403 || error.status === 429) && error.rateLimitRemaining === "0") {
      return `GitHub har tillfälligt begränsat antalet anrop, så ${subject} kunde inte hämtas. Gränsen återställs inom en timme.`;
    }

    if (error.status === 404) {
      return `${capitalize(subject)} hittades inte.`;
    }

    return `Servern svarade med ett fel (${error.status}), så ${subject} kunde inte hämtas.`;
  }

  if (error instanceof DataError) {
    return `${capitalize(subject)} kom i ett oväntat format.`;
  }

  // Fetch kastar TypeError när nätverket inte går att nå.
  if (error instanceof TypeError) {
    return `Det gick inte att ansluta för att hämta ${subject}. Kontrollera din internetanslutning.`;
  }

  return `Något gick fel när ${subject} skulle hämtas.`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
