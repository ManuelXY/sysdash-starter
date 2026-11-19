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

// How often the data is reloaded automatically, in milliseconds.
const POLL_INTERVAL_MS = 30_000;

// Loads readings when the component appears, on every refresh() and
// automatically every 30 seconds (polling).
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

  // Auto-refresh: a timer counts `attempt` up every 30 seconds, which re-runs
  // the loading effect above. Unlike refresh() it does not switch to the
  // loading state, so the current values stay visible until new ones arrive.
  useEffect(() => {
    const timer = setInterval(() => {
      // Do not poll while the browser tab is in the background.
      if (document.hidden) return;
      setAttempt((count) => count + 1);
    }, POLL_INTERVAL_MS);

    // Cleanup: stop the timer when the component disappears.
    // Without it, every new mount would add one more running timer.
    return () => clearInterval(timer);
  }, []);

  function refresh() {
    setState({ phase: "loading" });
    setAttempt((count) => count + 1);
  }

  return { state, refresh };
}

// Health of a source as shown in its badge.
//   ok       - fresh data
//   degraded - the source answers without data, or it failed and we show older values
//   down     - the source failed and there is nothing to show
// null while loading: the health is not known yet.
export type SourceHealth = "ok" | "degraded" | "down";

export function healthOf(state: RemoteState): SourceHealth | null {
  switch (state.phase) {
    case "loading":
      return null;
    case "ready":
      return "ok";
    case "stale":
    case "empty":
      return "degraded";
    case "error":
      return "down";
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}
