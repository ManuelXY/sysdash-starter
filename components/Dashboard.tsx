"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import AddSystemForm from "@/components/AddSystemForm";
import IssSection from "@/components/IssSection";
import MetarSection from "@/components/MetarSection";
import NoMatch from "@/components/NoMatch";
import StatusSummary from "@/components/StatusSummary";
import Tile from "@/components/Tile";
import TileGrid from "@/components/TileGrid";
import WeatherSection from "@/components/WeatherSection";
import type { System } from "@/data/systems";
import {
  buildFilterQuery,
  filterByTitle,
  isSortKey,
  parseSortKey,
  rateSystems,
  sortSystems,
  type SortKey,
} from "@/lib/systemLogic";

type DashboardProps = {
  // The systems the page starts with (from data/systems.ts).
  initialSystems: System[];
};

// The interactive part of the page: header summary, search field, sort
// control, all tile sections and the form. It only holds state and calls
// the functions in lib/systemLogic.ts - it makes no decisions itself.
export default function Dashboard({ initialSystems }: DashboardProps) {
  // State 1: the list of systems. It starts with the given systems and
  // grows when the form adds one.
  const [systems, setSystems] = useState(initialSystems);
  // Tools to read and write the address bar (?q=cpu&sort=name).
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // State 2: the text the user typed into the search field.
  // State 3: how the tiles are sorted.
  // Both start with the value from the URL. The function form of useState
  // runs only on the first render, so a reload or a shared link restores them.
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [sortKey, setSortKey] = useState(() => parseSortKey(searchParams.get("sort")));

  // Everything below is NOT state. It is calculated from the three states
  // on every render, so it can never get out of sync with them.
  // The pure functions return new arrays and never change the state.
  const ratedSystems = rateSystems(systems);
  const visibleSystems = sortSystems(filterByTitle(ratedSystems, query), sortKey);

  // Changes search and sorting: updates the state (the page reacts at once)
  // and writes the same values into the URL. `replace` swaps the current
  // history entry, so typing does not fill the browser's back button.
  // scroll: false keeps the page where it is.
  function updateFilter(nextQuery: string, nextSortKey: SortKey) {
    setQuery(nextQuery);
    setSortKey(nextSortKey);
    router.replace(`${pathname}${buildFilterQuery(nextQuery, nextSortKey)}`, { scroll: false });
  }

  // Called by the form with the system the server sent back.
  // A new array (instead of push) tells React that the state changed.
  function addSystem(system: System) {
    setSystems((current) => [...current, system]);
  }

  return (
    <>
      <header className="mb-12">
        <h1 className="text-sm font-semibold text-ink-muted">SysDash</h1>
        {/* The summary always counts ALL systems, not only the filtered ones. */}
        <StatusSummary statuses={ratedSystems.map((s) => s.status)} />
      </header>

      <main className="flex flex-col gap-12">
        <div className="flex flex-wrap items-end gap-4">
          <div role="search" className="w-full max-w-md">
            <label htmlFor="tile-search" className="block text-sm font-medium text-ink">
              Filter tiles by name
            </label>
            {/* Controlled input: React state is the single source of truth.
                `value` shows the state, `onChange` writes every keystroke back. */}
            <input
              id="tile-search"
              type="search"
              value={query}
              onChange={(event) => updateFilter(event.target.value, sortKey)}
              placeholder="e.g. temperature"
              autoComplete="off"
              className="mt-2 block w-full rounded-md border border-ink-muted bg-surface px-4 py-2 text-ink placeholder:text-ink-muted"
            />
          </div>

          <div>
            <label htmlFor="system-sort" className="block text-sm font-medium text-ink">
              Sort tiles by
            </label>
            {/* Controlled dropdown. Its value is a plain string, so isSortKey
                checks it before it becomes the new state. */}
            <select
              id="system-sort"
              value={sortKey}
              onChange={(event) => {
                if (isSortKey(event.target.value)) updateFilter(query, event.target.value);
              }}
              className="mt-2 block rounded-md border border-ink-muted bg-surface px-4 py-2 text-ink"
            >
              <option value="severity">Severity</option>
              <option value="name">Name</option>
              <option value="value">Value</option>
            </select>
          </div>
        </div>

        {/* aria-labelledby gives the section its heading as accessible name. */}
        <section aria-labelledby="systems-heading">
          <h2 id="systems-heading" className="mb-4 text-lg font-semibold text-ink">
            Server metrics
          </h2>
          {visibleSystems.length === 0 ? (
            <NoMatch query={query} />
          ) : (
            <TileGrid>
              {visibleSystems.map((s) => (
                <Tile
                  key={s.id}
                  title={s.title}
                  value={s.value}
                  unit={s.unit}
                  status={s.status}
                  query={query}
                />
              ))}
            </TileGrid>
          )}
          <AddSystemForm onAdded={addSystem} />
        </section>

        {/* The live sections get the search text and the sort key and apply
            them to their own tiles. */}
        <WeatherSection query={query} sortKey={sortKey} />
        <MetarSection query={query} sortKey={sortKey} />
        <IssSection query={query} sortKey={sortKey} />
      </main>
    </>
  );
}
