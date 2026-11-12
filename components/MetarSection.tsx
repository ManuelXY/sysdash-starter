"use client";

import RemoteSection from "@/components/RemoteSection";
import { loadMetar } from "@/lib/metar";

// Source 2: aviation weather report (METAR) as XML, no key needed.
export default function MetarSection() {
  return <RemoteSection id="metar" title="Zurich Airport (LSZH)" load={loadMetar} />;
}
