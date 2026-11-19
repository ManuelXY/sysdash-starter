import { fetchApi, FetchError } from "@/lib/http";
import { toNumber, type Reading } from "@/lib/readings";

// Tolerant reader: we only describe the few fields we use. The API sends
// more (timestamp, solar position, ...) and may add or rename fields at any
// time - none of that affects us. Every field is optional and `unknown`.
type IssResponse = {
  latitude?: unknown;
  longitude?: unknown;
  altitude?: unknown;
  velocity?: unknown;
  footprint?: unknown;
};

// Pure function: turns the raw JSON into tiles.
// A missing or malformed field becomes null and is shown as "no data".
export function parseIss(data: unknown): Reading[] {
  const iss = data as IssResponse | null;

  // Without a position and an altitude the answer holds nothing useful:
  // an empty list is shown as the empty state.
  if (toNumber(iss?.latitude) === null && toNumber(iss?.altitude) === null) return [];

  return [
    { id: "altitude", title: "Altitude", value: toNumber(iss?.altitude), unit: "km" },
    { id: "velocity", title: "Speed", value: toNumber(iss?.velocity), unit: "km/h" },
    { id: "latitude", title: "Latitude", value: toNumber(iss?.latitude), unit: "°" },
    { id: "longitude", title: "Longitude", value: toNumber(iss?.longitude), unit: "°" },
    // Diameter of the area on the ground from which the ISS is visible.
    { id: "footprint", title: "Visible area, diameter", value: toNumber(iss?.footprint), unit: "km" },
  ];
}

// The one function the rest of the app uses to get ISS data (our "layer").
// It hides where the data comes from and what the raw answer looks like.
export async function loadIss(): Promise<Reading[]> {
  // fetchApi checks response.ok and throws a FetchError for every failure.
  const response = await fetchApi("/api/iss");

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new FetchError("invalid-data");
  }

  return parseIss(data);
}
