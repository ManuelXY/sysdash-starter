"use client";

import RemoteSection from "@/components/RemoteSection";
import { loadIss } from "@/lib/iss";
import type { SortKey } from "@/lib/systemLogic";

// Source 3: live telemetry of the International Space Station (JSON, no key).
type IssSectionProps = {
  query: string;
  sortKey: SortKey;
};

export default function IssSection({ query, sortKey }: IssSectionProps) {
  return <RemoteSection id="iss" title="International Space Station" load={loadIss} query={query} sortKey={sortKey} />;
}
