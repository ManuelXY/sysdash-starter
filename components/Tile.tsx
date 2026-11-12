import StatusBadge from "@/components/StatusBadge";
import type { Status } from "@/lib/status";

// A reusable dashboard tile, rendered as a list item inside <TileGrid>.
// `status` is optional: tiles without limits show no status strip.
type TileProps = {
  title: string;
  value: number;
  unit: string;
  status?: Status;
};

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
        <p className="mt-2 text-4xl font-semibold tabular-nums text-ink">
          {value} <span className="text-lg font-normal text-ink-muted">{unit}</span>
        </p>
      </div>
      {/* mt-auto pushes the strip to the bottom when tiles differ in height. */}
      {status && <StatusBadge status={status} className="mt-auto border-t border-line px-6 py-2" />}
    </li>
  );
}
