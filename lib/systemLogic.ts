// All decisions about which tiles are shown and in which order.
// Only pure functions: same input, same output, and no input is changed.
// The components just hold state and call these functions.

import type { System } from "@/data/systems";
import { compareBySeverity, getStatus, type Status } from "@/lib/status";

// A system together with the status derived from its value and limits.
export type RatedSystem = System & { status: Status };

// The ways the system tiles can be sorted.
export type SortKey = "severity" | "name";

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

// Sorts systems by severity (critical first) or by name (A to Z).
// Array.sort changes the array it is called on, so we sort a copy ([...]).
export function sortSystems(systems: RatedSystem[], sortKey: SortKey): RatedSystem[] {
  const copy = [...systems];

  switch (sortKey) {
    case "severity":
      return copy.sort((a, b) => compareBySeverity(a.status, b.status));
    case "name":
      // localeCompare sorts text alphabetically, ignoring upper/lower case.
      return copy.sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
    default: {
      const unhandled: never = sortKey;
      return unhandled;
    }
  }
}

// Type guard for the value of the sort dropdown, which is a plain string.
export function isSortKey(value: string): value is SortKey {
  return value === "severity" || value === "name";
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
