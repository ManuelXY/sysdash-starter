import { statusLabel, type Status } from "@/lib/status";

// Record<Status, string> forces an entry for every status:
// a missing key is a type error.
const badgeStyles: Record<Status, string> = {
  ok: "bg-green-950 text-green-300",
  warn: "bg-amber-950 text-amber-300",
  crit: "bg-red-950 text-red-300",
};

type StatusBadgeProps = {
  status: Status;
};

// Shows the status as a word, so it never depends on color alone.
export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
