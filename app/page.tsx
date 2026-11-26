import Dashboard from "@/components/Dashboard";
import { systems } from "@/data/systems";

// Server component: it only hands the starting data to the dashboard.
// Everything interactive lives in <Dashboard>, a client component.
export default function Home() {
  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <Dashboard initialSystems={systems} />
    </div>
  );
}
