"use client";

import { useState } from "react";
import IssSection from "@/components/IssSection";
import MetarSection from "@/components/MetarSection";
import NoMatch from "@/components/NoMatch";
import Tile from "@/components/Tile";
import TileGrid from "@/components/TileGrid";
import WeatherSection from "@/components/WeatherSection";
import type { System } from "@/data/systems";
import { matchesQuery } from "@/lib/filter";
import type { Status } from "@/lib/status";

// A system together with the status the page derived for it.
type RatedSystem = System & { status: Status };

type DashboardProps = {
  systems: RatedSystem[];
};

// The interactive part of the page: the search field and all tile sections.
// It is a client component because the search text is state in the browser.
export default function Dashboard({ systems }: DashboardProps) {
  // The only state of the search: the text the user typed.
  const [query, setQuery] = useState("");

  // The filtered list is NOT state. It is calculated from `systems` and
  // `query` on every render, so it can never get out of sync with them.
  const visibleSystems = systems.filter((system) => matchesQuery(system.title, query));

  return (
    <>
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
      </section>

      {/* The live sections get the search text and filter their own tiles. */}
      <WeatherSection query={query} />
      <MetarSection query={query} />
      <IssSection query={query} />
    </>
  );
}
