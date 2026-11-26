"use client";

import NoMatch from "@/components/NoMatch";
import StatusBadge from "@/components/StatusBadge";
import Tile from "@/components/Tile";
import TileGrid from "@/components/TileGrid";
import {
  healthOf,
  useRemoteData,
  type RemoteState,
  type SourceHealth,
} from "@/hooks/useRemoteData";
import { matchesQuery } from "@/lib/filter";
import { errorMessage } from "@/lib/http";
import type { Reading } from "@/lib/readings";
import type { Status } from "@/lib/status";

type RemoteSectionProps = {
  id: string;
  title: string;
  load: () => Promise<Reading[]>;
  // Search text from the dashboard: only tiles whose title matches are shown.
  query: string;
};

const timeFormat = new Intl.DateTimeFormat("en-GB", { timeStyle: "medium" });
// Stale data can be from another day, so this format includes the date.
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "medium" });

// How each health level looks: it reuses the status colors and icons,
// with its own word. Record<SourceHealth, ...> forces an entry for each level.
const healthBadge: Record<SourceHealth, { status: Status; label: string }> = {
  ok: { status: "ok", label: "OK" },
  degraded: { status: "warn", label: "Degraded" },
  down: { status: "crit", label: "Down" },
};

// A dashboard section fed by an external source. It owns its own loading,
// empty and error state, so one failing source never breaks the other.
export default function RemoteSection({ id, title, load, query }: RemoteSectionProps) {
  // The key under which this source keeps its last successful readings.
  const { state, refresh } = useRemoteData(`sysdash:last-good:${id}`, load);
  const headingId = `${id}-heading`;
  const loading = state.phase === "loading";
  const health = healthOf(state);

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 id={headingId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {/* Health badge of this source. Hidden while loading (health is null). */}
            {health && (
              <StatusBadge
                status={healthBadge[health].status}
                label={healthBadge[health].label}
                className="rounded-md px-2 py-1"
              />
            )}
          </div>
          <p className="text-sm text-ink-muted">
            {state.phase === "ready"
              ? `Updated at ${timeFormat.format(state.updatedAt)}`
              : state.phase === "stale"
                ? "Live data unavailable"
                : "Live data"}
          </p>
        </div>
        {/* A real <button>: reachable with Tab, triggered with Enter or Space.
            While loading it is only marked as disabled (aria-disabled) and
            ignores clicks. A truly disabled button would lose keyboard focus. */}
        <button
          type="button"
          onClick={() => {
            if (!loading) refresh();
          }}
          aria-disabled={loading}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-surface aria-disabled:opacity-60"
        >
          {loading ? "Loading…" : "Refresh"}
          <span className="sr-only"> {title}</span>
        </button>
      </div>

      {/* aria-live: screen readers announce when the content changes, e.g.
          an error appears. While fresh values are shown it is off, otherwise
          every automatic refresh (every 30 s) would be read out loud. */}
      <div aria-live={state.phase === "ready" ? "off" : "polite"} aria-busy={loading}>
        <SectionContent state={state} query={query} />
      </div>
    </section>
  );
}

// One branch per phase of the union.
function SectionContent({ state, query }: { state: RemoteState; query: string }) {
  switch (state.phase) {
    case "loading":
      return (
        <>
          <p className="sr-only">Loading data…</p>
          {/* Gray placeholders in the shape of tiles while data is loading.
              They are decoration only, so screen readers skip them. */}
          <div aria-hidden="true">
            <TileGrid>
              {[1, 2, 3].map((n) => (
                <li key={n} className="rounded-md border border-line bg-surface p-6">
                  <div className="h-4 w-24 rounded-md bg-line motion-safe:animate-pulse" />
                  <div className="mt-4 h-8 w-32 rounded-md bg-line motion-safe:animate-pulse" />
                </li>
              ))}
            </TileGrid>
          </div>
        </>
      );
    case "error":
      return (
        <div className="rounded-md border border-crit bg-surface p-6">
          <p className="font-semibold text-crit">Data could not be loaded</p>
          <p className="mt-2 text-sm text-ink">{errorMessage(state.kind)}</p>
        </div>
      );
    case "empty":
      return (
        <div className="rounded-md border border-line bg-surface p-6">
          <p className="font-semibold text-ink">No readings available</p>
          <p className="mt-2 text-sm text-ink-muted">
            The service answered but sent no measurements. Try again later.
          </p>
        </div>
      );
    case "stale":
      // The source failed, but older readings exist: show them with a note
      // that says how old they are, instead of an error only.
      // The "Degraded" badge next to the heading marks the source itself.
      return (
        <>
          <div className="mb-4 rounded-md border border-warn bg-surface p-4">
            <p className="text-sm text-ink">
              <strong className="font-semibold">Stale values</strong> from{" "}
              {dateTimeFormat.format(state.updatedAt)}. {errorMessage(state.kind)}
            </p>
          </div>
          <ReadingTiles readings={state.readings} query={query} />
        </>
      );
    case "ready":
      return <ReadingTiles readings={state.readings} query={query} />;
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}

// The tiles of a source, filtered by the search text. The filtered list is
// calculated here on every render and is not kept in state.
function ReadingTiles({ readings, query }: { readings: Reading[]; query: string }) {
  const visible = readings.filter((reading) => matchesQuery(reading.title, query));

  if (visible.length === 0) return <NoMatch query={query} />;

  return (
    <TileGrid>
      {visible.map((reading) => (
        <Tile key={reading.id} title={reading.title} value={reading.value} unit={reading.unit} />
      ))}
    </TileGrid>
  );
}
