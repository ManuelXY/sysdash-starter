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
  ok: "border-green-500",
  warn: "border-amber-400",
  crit: "border-red-500",
};

export default function Tile({ title, value, unit, status }: TileProps) {
  const border = status ? borderStyles[status] : "border-sky-500";

  return (
    <div className={`rounded-2xl border-l-4 bg-slate-800 p-6 shadow-lg ${border}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
        {status && <StatusBadge status={status} />}
      </div>
      <p className="mt-4 text-4xl font-bold text-white">
        {value} <span className="text-lg font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  );
}
