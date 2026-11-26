import type { System } from "@/data/systems";

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
