import { fetchApi, FetchError } from "@/lib/http";
import { toNumber, type Reading } from "@/lib/readings";

// The parts of the OpenWeatherMap answer we use. Everything is optional and
// `unknown`, because we do not trust the shape: fields can be missing
// (no gust, no rain) or have an unexpected type.
type OwmResponse = {
  main?: { temp?: unknown; humidity?: unknown; pressure?: unknown };
  wind?: { speed?: unknown; gust?: unknown };
  rain?: { "1h"?: unknown };
};

// m/s -> km/h. A missing value stays missing.
function toKmh(metersPerSecond: number | null): number | null {
  return metersPerSecond === null ? null : metersPerSecond * 3.6;
}

// Pure function: turns the raw JSON into tiles. Optional chaining (?.)
// returns undefined instead of throwing when a level is missing.
export function parseWeather(data: unknown): Reading[] {
  const weather = data as OwmResponse | null;

  // Without the "main" block the answer holds no measurements.
  // An empty list is shown as the empty state.
  if (!weather?.main) return [];

  return [
    { id: "temp", title: "Temperature", value: toNumber(weather?.main?.temp), unit: "°C" },
    { id: "humidity", title: "Humidity", value: toNumber(weather?.main?.humidity), unit: "%" },
    { id: "pressure", title: "Air pressure", value: toNumber(weather?.main?.pressure), unit: "hPa" },
    { id: "wind", title: "Wind", value: toKmh(toNumber(weather?.wind?.speed)), unit: "km/h" },
    // Gusts are only sent when there are any: the tile then shows "no data".
    { id: "gust", title: "Wind gusts", value: toKmh(toNumber(weather?.wind?.gust)), unit: "km/h" },
    // No "rain" field means it did not rain: fall back to 0.
    { id: "rain", title: "Rain, last hour", value: toNumber(weather?.rain?.["1h"]) ?? 0, unit: "mm" },
  ];
}

// Loads the weather through our own API route and parses it.
export async function loadWeather(): Promise<Reading[]> {
  const response = await fetchApi("/api/weather");
  const data: unknown = await response.json().catch(() => {
    throw new FetchError("invalid-data");
  });
  return parseWeather(data);
}
