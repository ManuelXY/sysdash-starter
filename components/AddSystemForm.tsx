"use client";

import { useState, type FormEvent } from "react";
import type { System } from "@/data/systems";

type AddSystemFormProps = {
  // Called with the finished system (including its id) from the server.
  onAdded: (system: System) => void;
};

// Checks that the server answer really looks like a system before we use it.
function isSystem(data: unknown): data is System {
  const system = data as Partial<System> | null;
  return (
    typeof system?.id === "string" &&
    typeof system?.title === "string" &&
    typeof system?.value === "number" &&
    typeof system?.unit === "string"
  );
}

// Form to add a system. State flow:
// input -> state (title, value) -> POST /api/systems -> answer -> onAdded()
export default function AddSystemForm({ onAdded }: AddSystemFormProps) {
  // Controlled inputs: one state per field. An <input> always holds text,
  // so `value` is a string here and is converted to a number on submit.
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Without this the browser would reload the page to send the form.
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, value: Number(value) }),
      });
      const data: unknown = await response.json();

      // fetch does not throw on HTTP errors, so check `ok` ourselves.
      // On status 400 the route explains what is wrong in { error }.
      if (!response.ok) {
        const message = (data as { error?: unknown } | null)?.error;
        setError(typeof message === "string" ? message : "The system could not be added.");
        return;
      }
      if (!isSystem(data)) {
        setError("The server sent an unexpected answer.");
        return;
      }

      // Hand the new system to the dashboard and clear the form.
      onAdded(data);
      setTitle("");
      setValue("");
    } catch (cause) {
      // Network failure or an answer that is not JSON.
      console.error("[SysDash] Adding a system failed", cause);
      setError("No connection to the server. Try again.");
    } finally {
      setSending(false);
    }
  }

  const inputStyle =
    "mt-2 block w-full rounded-md border border-ink-muted bg-surface px-4 py-2 text-ink";

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="add-system-heading"
      className="mt-8 rounded-md border border-line bg-surface p-6"
    >
      <h3 id="add-system-heading" className="font-semibold text-ink">
        Add a system
      </h3>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="w-full md:w-64">
          <label htmlFor="system-title" className="block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="system-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={40}
            autoComplete="off"
            className={inputStyle}
          />
        </div>
        <div className="w-full md:w-48">
          <label htmlFor="system-value" className="block text-sm font-medium text-ink">
            Value in % (0 to 100)
          </label>
          <input
            id="system-value"
            type="number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
            min={0}
            max={100}
            step="any"
            className={inputStyle}
          />
        </div>
        <button
          type="submit"
          aria-disabled={sending}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-surface aria-disabled:opacity-60"
        >
          {sending ? "Adding…" : "Add system"}
        </button>
      </div>

      {/* role="alert": screen readers read the message as soon as it appears. */}
      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-crit">
          {error}
        </p>
      )}
    </form>
  );
}
