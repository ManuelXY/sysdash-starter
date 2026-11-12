import StatusSummary from "@/components/StatusSummary";
import Tile from "@/components/Tile";
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
    <main className="mx-auto max-w-7xl p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">
          Manuels Website
        </h1>
        <p className="text-ink-muted">
          System status at a glance
        </p>
        <StatusSummary statuses={ratedSystems.map((s) => s.status)} />
      </header>

      {/* 1 column on phones, 2 from 768 px (md), 3 from 1280 px (xl). */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ratedSystems.map((s) => (
          <Tile
            key={s.id}
            title={s.title}
            value={s.value}
            unit={s.unit}
            status={s.status}
          />
        ))}
      </section>
    </main>
  );
}
