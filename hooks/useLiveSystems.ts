"use client";

import { useEffect, useState } from "react";
import type { System } from "@/data/systems";
import { applyValueUpdates, readValueUpdates } from "@/lib/systemLogic";

// How often the system values are refreshed, in milliseconds.
const POLL_INTERVAL_MS = 10_000;

// Result of the last refresh, shown next to the section heading.
export type LiveInfo =
  | { phase: "waiting" } // no answer yet
  | { phase: "live"; updatedAt: Date } // last refresh worked
  | { phase: "failed" }; // last refresh failed, older values are shown

// Holds the list of systems and keeps their values up to date by polling
// GET /api/systems. Systems added through the form stay in the list.
export function useLiveSystems(initialSystems: System[]) {
  const [systems, setSystems] = useState(initialSystems);
  const [info, setInfo] = useState<LiveInfo>({ phase: "waiting" });

  useEffect(() => {
    // Set by the cleanup below, so a late answer is ignored once the
    // component is gone.
    let stopped = false;

    async function refresh() {
      // Do not poll while the browser tab is in the background.
      if (document.hidden) return;

      try {
        const response = await fetch("/api/systems", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const updates = readValueUpdates(await response.json());
        if (stopped) return;

        // The function form gets the newest list, including systems the
        // user added in the meantime. Only the values are replaced.
        setSystems((current) => applyValueUpdates(current, updates));
        setInfo({ phase: "live", updatedAt: new Date() });
      } catch (error) {
        if (stopped) return;
        // Keep the last values on screen and log the failure.
        console.error("[SysDash] Refreshing the systems failed", error);
        setInfo({ phase: "failed" });
      }
    }

    refresh(); // once right away ...
    const timer = setInterval(refresh, POLL_INTERVAL_MS); // ... then regularly

    // Cleanup: stop the timer when the component disappears.
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);

  // A new array (instead of push) tells React that the state changed.
  function addSystem(system: System) {
    setSystems((current) => [...current, system]);
  }

  return { systems, addSystem, info };
}
