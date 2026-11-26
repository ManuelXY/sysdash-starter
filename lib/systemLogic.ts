// All decisions about which tiles are shown and in which order.
// Only pure functions: same input, same output, and no input is changed.
// The components just hold state and call these functions.

import type { System } from "@/data/systems";
import type { Reading } from "@/lib/readings";
import { getStatus, severityRank, type Status } from "@/lib/status";

// A system together with the status derived from its value and limits.
export type RatedSystem = System & { status: Status };

// The ways the tiles can be sorted.
export type SortKey = "severity" | "name" | "value";

// Derives the status of every system. `map` returns a new array.
export function rateSystems(systems: System[]): RatedSystem[] {
  return systems.map((system) => ({
    ...system,
    status: getStatus(system.value, system.limits),
  }));
}

// Does a title match the search text? Upper/lower case and spaces around
// the text are ignored. An empty search matches everything.
export function matchesQuery(title: string, query: string): boolean {
  return title.toLowerCase().includes(query.trim().toLowerCase());
}

// Keeps the items whose title matches the search text.
// Generic (<T>): works for systems and for readings, because both have a
// title. `filter` returns a new array and leaves the original untouched.
export function filterByTitle<T extends { title: string }>(items: T[], query: string): T[] {
  return items.filter((item) => matchesQuery(item.title, query));
}

// Generic sort: works for a list of ANY type T.
// `getKey` says which value of an item to sort by, e.g. (s) => s.title.
// TypeScript checks that getKey fits the items, so no `any` is needed.
// Numbers are compared as numbers, text alphabetically (ignoring case).
// Array.sort changes the array it is called on, so we sort a copy ([...]).
export function sortBy<T>(
  items: T[],
  getKey: (item: T) => string | number,
  direction: "asc" | "desc" = "asc",
): T[] {
  // 1 keeps the order of the comparison, -1 turns it around.
  const factor = direction === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const keyA = getKey(a);
    const keyB = getKey(b);

    const result =
      typeof keyA === "number" && typeof keyB === "number"
        ? keyA - keyB
        : String(keyA).localeCompare(String(keyB), "en", { sensitivity: "base" });

    return result * factor;
  });
}

// Sorts the system tiles. Every case uses the same generic sortBy,
// only the key and the direction differ.
export function sortSystems(systems: RatedSystem[], sortKey: SortKey): RatedSystem[] {
  switch (sortKey) {
    case "severity":
      // Most severe first.
      return sortBy(systems, (system) => severityRank(system.status), "desc");
    case "name":
      return sortBy(systems, (system) => system.title);
    case "value":
      // Highest value first.
      return sortBy(systems, (system) => system.value, "desc");
    default: {
      const unhandled: never = sortKey;
      return unhandled;
    }
  }
}

// Sorts the tiles of a live source: the same sortBy with another type.
// Readings have no severity, so that choice keeps their original order.
export function sortReadings(readings: Reading[], sortKey: SortKey): Reading[] {
  switch (sortKey) {
    case "severity":
      return readings;
    case "name":
      return sortBy(readings, (reading) => reading.title);
    case "value":
      // Highest value first. A missing value (null) goes to the end.
      return sortBy(readings, (reading) => reading.value ?? -Infinity, "desc");
    default: {
      const unhandled: never = sortKey;
      return unhandled;
    }
  }
}

// Keeps the most important systems on top: all critical ones first, then
// the rest. Inside both groups the given order stays as it is, so this can
// be applied after any sorting. Returns a new array.
export function pinCritical(systems: RatedSystem[]): RatedSystem[] {
  const critical = systems.filter((system) => system.status === "crit");
  const others = systems.filter((system) => system.status !== "crit");
  return [...critical, ...others];
}

// Reads fresh values from an API answer (tolerant reader): only `id` and
// `value` of well-formed entries are used, everything else is ignored.
export function readValueUpdates(data: unknown): Map<string, number> {
  const updates = new Map<string, number>();
  if (!Array.isArray(data)) return updates;

  for (const entry of data as unknown[]) {
    const item = entry as { id?: unknown; value?: unknown } | null;
    if (typeof item?.id === "string" && typeof item?.value === "number" && Number.isFinite(item.value)) {
      updates.set(item.id, item.value);
    }
  }
  return updates;
}

// Applies fresh values to the list of systems. Systems without an update
// (for example the ones added through the form) are kept unchanged.
// Returns a new array with new objects; the given list is not changed.
export function applyValueUpdates(systems: System[], updates: Map<string, number>): System[] {
  return systems.map((system) => {
    const value = updates.get(system.id);
    return value === undefined ? system : { ...system, value };
  });
}

// Type guard for the value of the sort dropdown, which is a plain string.
export function isSortKey(value: string): value is SortKey {
  return value === "severity" || value === "name" || value === "value";
}

// The sort order used when the URL names none (or an unknown one).
export const DEFAULT_SORT_KEY: SortKey = "severity";

// Reads the sort key from a URL parameter. A missing or unknown value
// (someone may have edited the link by hand) falls back to the default.
export function parseSortKey(value: string | null): SortKey {
  return value !== null && isSortKey(value) ? value : DEFAULT_SORT_KEY;
}

// Builds the query string for the URL, e.g. "?q=cpu&sort=name".
// Empty search and default sorting are left out, so the plain address
// stays clean. URLSearchParams escapes special characters such as spaces.
export function buildFilterQuery(query: string, sortKey: SortKey): string {
  const params = new URLSearchParams();
  if (query.trim() !== "") params.set("q", query);
  if (sortKey !== DEFAULT_SORT_KEY) params.set("sort", sortKey);

  const text = params.toString();
  return text === "" ? "" : `?${text}`;
}

// A title cut into three parts around the first match of the search text.
export type TitleParts = { before: string; match: string; after: string };

// Splits a title so the matching part can be highlighted.
// "Temperature" with query "per" becomes { before: "Tem", match: "per", after: "ature" }.
// Without a search text or without a match, everything is in `before`.
export function splitTitle(title: string, query: string): TitleParts {
  const needle = query.trim().toLowerCase();
  const start = needle === "" ? -1 : title.toLowerCase().indexOf(needle);

  if (start === -1) return { before: title, match: "", after: "" };

  const end = start + needle.length;
  return {
    before: title.slice(0, start),
    match: title.slice(start, end),
    after: title.slice(end),
  };
}
