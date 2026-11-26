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

// Type guard for the value of the sort dropdown, which is a plain string.
export function isSortKey(value: string): value is SortKey {
  return value === "severity" || value === "name" || value === "value";
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
