import { errorResponse, FetchError, fetchWithTimeout, kindFromStatus } from "@/lib/http";

// ICAO code of the airport: LSZH = Zurich, LSGG = Geneva.
const STATION = "LSZH";

// GET /api/metar
// Fetches the METAR report as XML and passes it on unchanged.
// This source needs no key. The route still helps: the browser may not be
// allowed to call another website directly (CORS), our own server is.
export async function GET(): Promise<Response> {
  const url = new URL("https://aviationweather.gov/api/data/metar");
  url.searchParams.set("ids", STATION);
  url.searchParams.set("format", "xml");

  try {
    const upstream = await fetchWithTimeout(url.toString(), 8_000);
    if (!upstream.ok) return errorResponse(kindFromStatus(upstream.status));

    // XML is plain text for the server; the browser parses it with DOMParser.
    const xml = await upstream.text();
    return new Response(xml, { headers: { "Content-Type": "application/xml" } });
  } catch (error) {
    return errorResponse(error instanceof FetchError ? error.kind : "invalid-data");
  }
}
