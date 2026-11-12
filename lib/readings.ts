// A single measured value from an external source, shown as one tile.
// `value` is null when the source did not send this field.
export type Reading = {
  id: string;
  title: string;
  value: number | null;
  unit: string;
};

// Accepts anything and returns a finite number or null.
// Text is parsed leniently: "6+" becomes 6, "VRB" becomes null.
export function toNumber(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}
