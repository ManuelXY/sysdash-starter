import { fetchApi, FetchError } from "@/lib/http";
import { toNumber, type Reading } from "@/lib/readings";

// Multiplies a value that may be missing. null stays null.
function convert(value: number | null, factor: number): number | null {
  return value === null ? null : value * factor;
}

// Turns the METAR XML into tiles. Runs in the browser, where DOMParser exists.
// .json() cannot read XML, so the text is parsed into a document that can be
// searched with querySelector, just like HTML.
export function parseMetar(xml: string): Reading[] {
  // An empty answer means: no report available.
  if (xml.trim() === "") return [];

  const doc = new DOMParser().parseFromString(xml, "application/xml");

  // DOMParser does not throw on broken XML. It returns a document that
  // contains a <parsererror> element instead.
  if (doc.querySelector("parsererror")) throw new FetchError("invalid-data");

  // No <METAR> element: the station sent no report. Shown as the empty state.
  const metar = doc.querySelector("METAR");
  if (!metar) return [];

  // Reads one child element as a number. METAR fields vary: a missing
  // element (?.) or text like "VRB" simply results in null.
  const read = (tag: string) => toNumber(metar.querySelector(tag)?.textContent);

  return [
    { id: "temp", title: "Temperature", value: read("temp_c"), unit: "°C" },
    { id: "dewpoint", title: "Dew point", value: read("dewpoint_c"), unit: "°C" },
    // knots -> km/h
    { id: "wind", title: "Wind", value: convert(read("wind_speed_kt"), 1.852), unit: "km/h" },
    { id: "gust", title: "Wind gusts", value: convert(read("wind_gust_kt"), 1.852), unit: "km/h" },
    // statute miles -> km. "10+" (10 miles or more) is read as 10.
    { id: "visibility", title: "Visibility", value: convert(read("visibility_statute_mi"), 1.609), unit: "km" },
    // inches of mercury -> hPa
    { id: "pressure", title: "Air pressure", value: convert(read("altim_in_hg"), 33.864), unit: "hPa" },
  ];
}

// Loads the report through our own API route and parses it.
export async function loadMetar(): Promise<Reading[]> {
  const response = await fetchApi("/api/metar");
  return parseMetar(await response.text());
}
