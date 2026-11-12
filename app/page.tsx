import StatusSummary from "@/components/StatusSummary";
import Tile from "@/components/Tile";
import TileGrid from "@/components/TileGrid";
import WeatherSection from "@/components/WeatherSection";
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
        {/* aria-labelledby gives the section its heading as accessible name. */}
        <section aria-labelledby="systems-heading">
          <h2 id="systems-heading" className="mb-4 text-lg font-semibold text-ink">
            Server metrics
          </h2>
          <TileGrid>
            {ratedSystems.map((s) => (
              <Tile
                key={s.id}
                title={s.title}
                value={s.value}
                unit={s.unit}
                status={s.status}
              />
            ))}
          </TileGrid>
        </section>

        <WeatherSection />
      </main>
    </div>
  );
}
