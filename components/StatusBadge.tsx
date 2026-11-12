import { statusLabel, type Status } from "@/lib/status";

// Record<Status, string> forces an entry for every status:
// a missing key is a type error.
const badgeStyles: Record<Status, string> = {
  ok: "border border-line text-ok",
  warn: "bg-warn text-warn-ink",
  crit: "bg-crit text-crit-ink",
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
