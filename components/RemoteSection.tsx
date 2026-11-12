"use client";

import Tile from "@/components/Tile";
import TileGrid from "@/components/TileGrid";
import { useRemoteData, type RemoteState } from "@/hooks/useRemoteData";
import { errorMessage } from "@/lib/http";
import type { Reading } from "@/lib/readings";

type RemoteSectionProps = {
  id: string;
  title: string;
  load: () => Promise<Reading[]>;
};

const timeFormat = new Intl.DateTimeFormat("en-GB", { timeStyle: "medium" });

// A dashboard section fed by an external source. It owns its own loading,
// empty and error state, so one failing source never breaks the other.
export default function RemoteSection({ id, title, load }: RemoteSectionProps) {
  const { state, refresh } = useRemoteData(load);
  const headingId = `${id}-heading`;
  const loading = state.phase === "loading";

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id={headingId} className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <p className="text-sm text-ink-muted">
            {state.phase === "ready"
              ? `Updated at ${timeFormat.format(state.updatedAt)}`
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

      {/* aria-live: screen readers announce when the content changes. */}
      <div aria-live="polite" aria-busy={loading}>
        <SectionContent state={state} />
      </div>
    </section>
  );
}

// One branch per phase of the union.
function SectionContent({ state }: { state: RemoteState }) {
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
    case "ready":
      return (
        <TileGrid>
          {state.readings.map((reading) => (
            <Tile key={reading.id} title={reading.title} value={reading.value} unit={reading.unit} />
          ))}
        </TileGrid>
      );
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}
