import StatusIcon from "@/components/StatusIcon";
import { statusLabel, type Status } from "@/lib/status";

// Record<Status, string> forces an entry for every status:
// a missing key is a type error.
// OK stays quiet (no fill); warning and critical are filled like a lit lamp.
const badgeStyles: Record<Status, string> = {
  ok: "text-ok",
  warn: "bg-warn text-warn-ink",
  crit: "bg-crit text-crit-ink",
};

type StatusBadgeProps = {
  status: Status;
  className?: string;
};

// Status as icon + word, so it never depends on color alone.
export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`flex items-center gap-2 text-sm font-semibold ${badgeStyles[status]} ${className}`}
    >
      <StatusIcon status={status} />
      {statusLabel(status)}
    </span>
  );
}
