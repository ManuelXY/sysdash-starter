import StatusBadge from "@/components/StatusBadge";
import type { Status } from "@/lib/status";

// A reusable dashboard tile, rendered as a list item inside <TileGrid>.
// `status` is optional: tiles without limits show no status strip.
// `value` is null when a data source did not deliver this field.
type TileProps = {
  title: string;
  value: number | null;
  unit: string;
  status?: Status;
};

// At most one decimal place: 7.34 becomes "7.3", 93 stays "93".
const numberFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

// A critical tile gets a colored frame, so it stands out in the grid.
const frameStyles: Record<Status, string> = {
  ok: "border-line",
  warn: "border-warn",
  crit: "border-crit ring-2 ring-crit",
};

export default function Tile({ title, value, unit, status }: TileProps) {
  const frame = status ? frameStyles[status] : "border-line";

  return (
    <li className={`flex flex-col overflow-hidden rounded-md border bg-surface ${frame}`}>
      <div className="p-6">
        <h3 className="text-sm font-medium text-ink-muted">{title}</h3>
        {/* tabular-nums: all digits have the same width, so numbers line up. */}
        {value === null ? (
          <p className="mt-2 text-4xl font-semibold text-ink-muted">
            {/* The dash is hidden from screen readers, which read "No data" instead. */}
            <span aria-hidden="true">–</span>
            <span className="sr-only">No data</span>
          </p>
        ) : (
          <p className="mt-2 text-4xl font-semibold tabular-nums text-ink">
            {numberFormat.format(value)}{" "}
            <span className="text-lg font-normal text-ink-muted">{unit}</span>
          </p>
        )}
      </div>
      {/* mt-auto pushes the strip to the bottom when tiles differ in height. */}
      {status && <StatusBadge status={status} className="mt-auto border-t border-line px-6 py-2" />}
    </li>
  );
}
