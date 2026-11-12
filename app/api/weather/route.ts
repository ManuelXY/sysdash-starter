import { errorResponse, FetchError, fetchWithTimeout, kindFromStatus } from "@/lib/http";

const CITY = "Luzern";

// GET /api/weather
// The browser calls this route instead of OpenWeatherMap directly.
// That way the API key stays on the server and never reaches the browser.
export async function GET(): Promise<Response> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return errorResponse("not-configured");

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("q", CITY);
  url.searchParams.set("units", "metric");
  url.searchParams.set("appid", key);

  try {
    const upstream = await fetchWithTimeout(url.toString(), 8_000);
    if (!upstream.ok) return errorResponse(kindFromStatus(upstream.status));

    // Pass the JSON through unchanged; the browser picks the fields it needs.
    const data: unknown = await upstream.json();
    return Response.json(data);
  } catch (error) {
    // FetchError: timeout or network. Anything else: the body was not JSON.
    return errorResponse(error instanceof FetchError ? error.kind : "invalid-data");
  }
}
