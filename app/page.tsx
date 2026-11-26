import Dashboard from "@/components/Dashboard";
import StatusSummary from "@/components/StatusSummary";
import { systems } from "@/data/systems";
import { compareBySeverity, getStatus } from "@/lib/status";

export default function Home() {
  // Derive the status once per system from its value and limits,
  // then show the most severe tiles first. `map` returns a new array,
  // so sorting it does not change the original `systems` list.
  const ratedSystems = systems
    .map((system) => ({
      ...system,
      status: getStatus(system.value, system.limits),
    }))
    .sort((a, b) => compareBySeverity(a.status, b.status));

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-sm font-semibold text-ink-muted">SysDash</h1>
        <StatusSummary statuses={ratedSystems.map((s) => s.status)} />
      </header>

      <main className="flex flex-col gap-12">
        {/* The header above always summarizes ALL systems.
            The search inside <Dashboard> only changes which tiles are shown. */}
        <Dashboard systems={ratedSystems} />
      </main>
    </div>
  );
}
