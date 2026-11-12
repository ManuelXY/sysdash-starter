import StatusBadge from "@/components/StatusBadge";
import { countStatuses, worstStatus, type Status } from "@/lib/status";

type StatusSummaryProps = {
  statuses: Status[];
};

// "1 warning" / "2 warnings": pick singular or plural by count.
function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

// Overall picture for the page header: worst status plus counts.
export default function StatusSummary({ statuses }: StatusSummaryProps) {
  const counts = countStatuses(statuses);
  const overall = worstStatus(statuses);

  const text =
    overall === "ok"
      ? `All ${statuses.length} systems OK`
      : [
          counts.crit > 0 ? `${counts.crit} critical` : null,
          counts.warn > 0 ? pluralize(counts.warn, "warning", "warnings") : null,
          `${counts.ok} OK`,
        ]
          .filter((part) => part !== null)
          .join(", ");

  return (
    <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink">
      <StatusBadge status={overall} />
      <span>{text}</span>
    </p>
  );
}
