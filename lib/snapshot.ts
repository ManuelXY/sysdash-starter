import type { Reading } from "@/lib/readings";

// The last successful readings of a source, with the time they were loaded.
export type Snapshot = {
  readings: Reading[];
  savedAt: Date;
};

// Stores the snapshot in the browser's localStorage, so it survives a page
// reload. localStorage only holds text, so the data is saved as JSON.
// Storage can be unavailable (private mode, full): then we simply skip it.
export function saveSnapshot(key: string, snapshot: Snapshot): void {
  try {
    const text = JSON.stringify({
      readings: snapshot.readings,
      savedAt: snapshot.savedAt.toISOString(),
    });
    localStorage.setItem(key, text);
  } catch {
    // Not being able to save must never break the dashboard.
  }
}

// Reads the snapshot back. Returns null when nothing usable is stored.
// Stored text is not trusted: it may be missing, broken or from an old version.
export function loadSnapshot(key: string): Snapshot | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    const data = stored as { readings?: unknown; savedAt?: unknown } | null;

    if (!Array.isArray(data?.readings) || typeof data?.savedAt !== "string") return null;

    const savedAt = new Date(data.savedAt);
    if (Number.isNaN(savedAt.getTime())) return null;

    return { readings: data.readings as Reading[], savedAt };
  } catch {
    return null;
  }
}
