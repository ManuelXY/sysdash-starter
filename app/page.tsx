import StatusSummary from "@/components/StatusSummary";
import Tile from "@/components/Tile";
import { systems } from "@/data/systems";
import { getStatus } from "@/lib/status";

export default function Home() {
  // Derive the status once per system from its value and limits.
  const ratedSystems = systems.map((system) => ({
    ...system,
    status: getStatus(system.value, system.limits),
  }));

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Manuels Website
        </h1>
        <p className="text-slate-400">
          System status at a glance
        </p>
        <StatusSummary statuses={ratedSystems.map((s) => s.status)} />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
