import { systems, type System } from "@/data/systems";

// How far each value may move away from its base value, in its own unit.
// There are no real servers behind this course project, so GET simulates
// measurements: each call returns the base value plus a small random change.
const SPREAD: Record<string, number> = {
  cpu: 6,
  ram: 6,
  disk: 3,
  temp: 6,
  net: 6,
  uptime: 0.3,
};

// A simulated current value: base value plus/minus up to `spread`,
// rounded to one decimal place. Percent values stay between 0 and 100.
function simulate(system: System): number {
  const spread = SPREAD[system.id] ?? 0;
  const change = (Math.random() * 2 - 1) * spread;
  const value = Math.round((system.value + change) * 10) / 10;
  return system.unit === "%" ? Math.min(100, Math.max(0, value)) : Math.max(0, value);
}

// GET /api/systems
// Returns the current state of all known systems. The dashboard polls this
// route to keep itself up to date.
export async function GET(): Promise<Response> {
  const current: System[] = systems.map((system) => ({ ...system, value: simulate(system) }));
  // no-store: every request must get fresh values, never a cached answer.
  return Response.json(current, { headers: { "Cache-Control": "no-store" } });
}

const MAX_TITLE_LENGTH = 40;

// Answer for invalid input: status 400 (Bad Request) with a readable message.
function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

// POST /api/systems
// Takes { title, value } from the form, creates the finished system and
// sends it back. There is no database yet: nothing is stored here, the
// browser keeps the new system in its state. The route practices the full
// round trip client -> server -> client.
export async function POST(request: Request): Promise<Response> {
  // The body comes from outside, so it is `unknown` until we have checked it.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("The request body must be JSON.");
  }

  const input = body as { title?: unknown; value?: unknown } | null;

  // Never trust the client: validate again on the server, even though the
  // form already checks. Requests can also come from other tools.
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  if (title === "") return badRequest("Name is required.");
  if (title.length > MAX_TITLE_LENGTH) {
    return badRequest(`Name must be at most ${MAX_TITLE_LENGTH} characters.`);
  }

  const value = input?.value;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return badRequest("Value must be a number.");
  }
  if (value < 0 || value > 100) return badRequest("Value must be between 0 and 100.");

  // The server "creates" the entry: it assigns the id and sets defaults.
  // A new system counts as a load in percent with the usual limits.
  const system: System = {
    id: crypto.randomUUID(),
    title,
    value,
    unit: "%",
    limits: { warnHigh: 75, critHigh: 90 },
  };

  // 201 Created: the standard status for "a new entry was created".
  return Response.json(system, { status: 201 });
}
