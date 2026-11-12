// Shared fetch helpers for the browser and for our API routes.
// Every failure becomes a FetchError with a known `kind`, so the UI can
// show a matching message instead of crashing.

export type ErrorKind =
  | "timeout" // the service did not answer in time
  | "rate-limit" // HTTP 429: too many requests
  | "auth" // HTTP 401/403: API key rejected
  | "not-configured" // API key missing on our server
  | "network" // no connection
  | "http" // any other HTTP error
  | "invalid-data"; // answer could not be parsed

export class FetchError extends Error {
  kind: ErrorKind;

  constructor(kind: ErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

// fetch() with a timeout. fetch only rejects when no answer arrives at all
// (offline, DNS, timeout) - an HTTP error status is still a normal Response.
export async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  try {
    return await fetch(url, {
      cache: "no-store", // always ask for fresh data
      signal: AbortSignal.timeout(timeoutMs), // aborts the request after timeoutMs
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new FetchError(timedOut ? "timeout" : "network");
  }
}

// Maps an HTTP error status to an error kind.
export function kindFromStatus(status: number): ErrorKind {
  if (status === 429) return "rate-limit";
  if (status === 401 || status === 403) return "auth";
  if (status === 504) return "timeout";
  return "http";
}

// Message shown to the user. The switch handles every ErrorKind;
// the `never` assignment makes TypeScript complain if one is missing.
export function errorMessage(kind: ErrorKind): string {
  switch (kind) {
    case "timeout":
      return "The service took too long to answer.";
    case "rate-limit":
      return "Too many requests. Wait a minute before you refresh again.";
    case "auth":
      return "The API key was rejected. A new key can take up to two hours to become active.";
    case "not-configured":
      return "No API key found. Add OPENWEATHER_API_KEY to .env.local and restart the dev server.";
    case "network":
      return "No connection to the service. Check your network.";
    case "http":
      return "The service reported an error.";
    case "invalid-data":
      return "The service sent data that could not be read.";
    default: {
      const unhandled: never = kind;
      return unhandled;
    }
  }
}
