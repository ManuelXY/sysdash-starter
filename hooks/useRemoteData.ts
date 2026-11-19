"use client";

import { useEffect, useRef, useState } from "react";
import { FetchError, type ErrorKind } from "@/lib/http";
import type { Reading } from "@/lib/readings";
import { loadSnapshot, saveSnapshot, type Snapshot } from "@/lib/snapshot";

// Every state a data source can be in. A union instead of several booleans
// makes impossible combinations (loading AND error) unrepresentable.
export type RemoteState =
  | { phase: "loading" }
  | { phase: "error"; kind: ErrorKind }
  | { phase: "empty" }
  | { phase: "ready"; readings: Reading[]; updatedAt: Date }
  // The source failed, but we still have the last successful readings.
  | { phase: "stale"; readings: Reading[]; updatedAt: Date; kind: ErrorKind };

// Loads readings when the component appears and again on every refresh().
// `storageKey` names the place where the last successful readings are kept.
export function useRemoteData(storageKey: string, load: () => Promise<Reading[]>) {
  const [state, setState] = useState<RemoteState>({ phase: "loading" });
  // Counting up `attempt` re-runs the effect below, which reloads the data.
  const [attempt, setAttempt] = useState(0);
  // Last successful readings in memory. A ref keeps its value between
  // renders without causing a new render when it changes.
  const lastGood = useRef<Snapshot | null>(null);

  useEffect(() => {
    // If a newer request has started (or the component is gone),
    // the answer of this older request is ignored.
    let outdated = false;

    load()
      .then((readings) => {
        if (outdated) return;
        if (readings.length === 0) {
          setState({ phase: "empty" });
          return;
        }
        // Success: remember these readings in memory and in localStorage.
        const snapshot: Snapshot = { readings, savedAt: new Date() };
        lastGood.current = snapshot;
        saveSnapshot(storageKey, snapshot);
        setState({ phase: "ready", readings, updatedAt: snapshot.savedAt });
      })
      .catch((error: unknown) => {
        if (outdated) return;
        // Unknown errors (e.g. a bug while parsing) count as unreadable data.
        const kind = error instanceof FetchError ? error.kind : "invalid-data";
        // Log the failure for later monitoring.
        console.error(`[SysDash] Source "${storageKey}" failed: ${kind}`, error);

        // Fall back to the last successful readings: first from memory,
        // then from localStorage (e.g. after a page reload).
        const snapshot = lastGood.current ?? loadSnapshot(storageKey);
        setState(
          snapshot
            ? { phase: "stale", readings: snapshot.readings, updatedAt: snapshot.savedAt, kind }
            : { phase: "error", kind },
        );
      });

    return () => {
      outdated = true;
    };
  }, [storageKey, load, attempt]);

  function refresh() {
    setState({ phase: "loading" });
    setAttempt((count) => count + 1);
  }

  return { state, refresh };
}
