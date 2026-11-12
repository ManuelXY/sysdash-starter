"use client";

import { useEffect, useState } from "react";
import { FetchError, type ErrorKind } from "@/lib/http";
import type { Reading } from "@/lib/readings";

// Every state a data source can be in. A union instead of several booleans
// makes impossible combinations (loading AND error) unrepresentable.
export type RemoteState =
  | { phase: "loading" }
  | { phase: "error"; kind: ErrorKind }
  | { phase: "empty" }
  | { phase: "ready"; readings: Reading[]; updatedAt: Date };

// Loads readings when the component appears and again on every refresh().
export function useRemoteData(load: () => Promise<Reading[]>) {
  const [state, setState] = useState<RemoteState>({ phase: "loading" });
  // Counting up `attempt` re-runs the effect below, which reloads the data.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // If a newer request has started (or the component is gone),
    // the answer of this older request is ignored.
    let outdated = false;

    load()
      .then((readings) => {
        if (outdated) return;
        setState(
          readings.length === 0
            ? { phase: "empty" }
            : { phase: "ready", readings, updatedAt: new Date() },
        );
      })
      .catch((error: unknown) => {
        if (outdated) return;
        // Unknown errors (e.g. a bug while parsing) count as unreadable data.
        const kind = error instanceof FetchError ? error.kind : "invalid-data";
        setState({ phase: "error", kind });
      });

    return () => {
      outdated = true;
    };
  }, [load, attempt]);

  function refresh() {
    setState({ phase: "loading" });
    setAttempt((count) => count + 1);
  }

  return { state, refresh };
}
