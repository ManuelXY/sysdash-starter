// Domain logic for tile status.
// The status is never stored: it is derived from a value and its limits.

export type Status = "ok" | "warn" | "crit";

// Each side is optional. A metric can be bad when it is too high (CPU),
// too low (uptime) or both (temperature).
export type Limits = {
  critLow?: number;
  warnLow?: number;
  warnHigh?: number;
  critHigh?: number;
};

// Pure function: same input, same output, no side effects.
// Critical limits are checked first, so "crit" always wins over "warn".
export function getStatus(value: number, l: Limits = {}): Status {
  if (l.critLow !== undefined && value <= l.critLow) return "crit";
  if (l.critHigh !== undefined && value >= l.critHigh) return "crit";
  if (l.warnLow !== undefined && value <= l.warnLow) return "warn";
  if (l.warnHigh !== undefined && value >= l.warnHigh) return "warn";
  return "ok";
}
