"use client";

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
import { matchesQuery } from "@/lib/filter";
import { compareBySeverity, getStatus } from "@/lib/status";

type DashboardProps = {
  // The systems the page starts with (from data/systems.ts).
  initialSystems: System[];
};

// The interactive part of the page: header summary, search field, all tile
// sections and the form. It is a client component because the list of
// systems and the search text are state in the browser.
export default function Dashboard({ initialSystems }: DashboardProps) {
  // State 1: the list of systems. It starts with the given systems and
  // grows when the form adds one.
  const [systems, setSystems] = useState(initialSystems);
  // State 2: the text the user typed into the search field.
  const [query, setQuery] = useState("");

  // Everything below is NOT state. It is calculated from `systems` and
  // `query` on every render, so it can never get out of sync with them.

  // Derive the status of each system from its value and limits, then show
  // the most severe first. `map` returns a new array, so sorting it does
  // not change the `systems` state.
  const ratedSystems = systems
    .map((system) => ({ ...system, status: getStatus(system.value, system.limits) }))
    .sort((a, b) => compareBySeverity(a.status, b.status));

  const visibleSystems = ratedSystems.filter((system) => matchesQuery(system.title, query));

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
        <div role="search">
          <label htmlFor="tile-search" className="block text-sm font-medium text-ink">
            Filter tiles by name
          </label>
          {/* Controlled input: React state is the single source of truth.
              `value` shows the state, `onChange` writes every keystroke back. */}
          <input
            id="tile-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. temperature"
            autoComplete="off"
            className="mt-2 block w-full max-w-md rounded-md border border-ink-muted bg-surface px-4 py-2 text-ink placeholder:text-ink-muted"
          />
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
                <Tile key={s.id} title={s.title} value={s.value} unit={s.unit} status={s.status} />
              ))}
            </TileGrid>
          )}
          <AddSystemForm onAdded={addSystem} />
        </section>

        {/* The live sections get the search text and filter their own tiles. */}
        <WeatherSection query={query} />
        <MetarSection query={query} />
        <IssSection query={query} />
      </main>
    </>
  );
}
