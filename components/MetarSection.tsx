"use client";

import RemoteSection from "@/components/RemoteSection";
import { loadMetar } from "@/lib/metar";
import type { SortKey } from "@/lib/systemLogic";

// Source 2: aviation weather report (METAR) as XML, no key needed.
type MetarSectionProps = {
  query: string;
  sortKey: SortKey;
};

export default function MetarSection({ query, sortKey }: MetarSectionProps) {
  return <RemoteSection id="metar" title="Zurich Airport (LSZH)" load={loadMetar} query={query} sortKey={sortKey} />;
}
