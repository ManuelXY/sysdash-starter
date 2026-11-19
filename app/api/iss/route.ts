import { errorResponse, FetchError, fetchWithTimeout, kindFromStatus } from "@/lib/http";

// NORAD catalog number of the International Space Station.
const SATELLITE_ID = "25544";

// GET /api/iss
// Fetches the current ISS telemetry as JSON. This source needs no key.
export async function GET(): Promise<Response> {
  const url = `https://api.wheretheiss.at/v1/satellites/${SATELLITE_ID}`;

  try {
    const upstream = await fetchWithTimeout(url, 8_000);
    // fetch does not throw on HTTP errors like 404 or 500.
    // `ok` is only true for a status from 200 to 299, so we check it ourselves.
    if (!upstream.ok) return errorResponse(kindFromStatus(upstream.status));

    // Pass the JSON through unchanged; the browser picks the fields it needs.
    const data: unknown = await upstream.json();
    return Response.json(data);
  } catch (error) {
    // FetchError: timeout or network. Anything else: the body was not JSON.
    return errorResponse(error instanceof FetchError ? error.kind : "invalid-data");
  }
}
