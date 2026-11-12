import StatusBadge from "@/components/StatusBadge";
import type { Status } from "@/lib/status";

// A reusable dashboard tile.
// `status` is optional: tiles without limits simply show no badge.
type TileProps = {
  title: string;
  value: number;
  unit: string;
  status?: Status;
};

const borderStyles: Record<Status, string> = {
  ok: "border-line",
  warn: "border-warn",
  crit: "border-crit",
};

export default function Tile({ title, value, unit, status }: TileProps) {
  const border = status ? borderStyles[status] : "border-line";

  return (
    <div className={`rounded-md border-l-4 bg-surface p-6 ${border}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink-muted">{title}</h3>
        {status && <StatusBadge status={status} />}
      </div>
      <p className="mt-4 text-4xl font-semibold text-ink">
        {value} <span className="text-lg font-normal text-ink-muted">{unit}</span>
      </p>
    </div>
  );
}
