import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";
import { systems } from "@/data/systems";

// Server component: it only hands the starting data to the dashboard.
// Everything interactive lives in <Dashboard>, a client component.
export default function Home() {
  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      {/* The dashboard reads the URL (useSearchParams). The URL is only
          known in the browser, so Next.js requires a Suspense boundary:
          until the dashboard is ready, the fallback is shown. */}
      <Suspense fallback={<p className="text-sm text-ink-muted">Loading dashboard…</p>}>
        <Dashboard initialSystems={systems} />
      </Suspense>
    </div>
  );
}
