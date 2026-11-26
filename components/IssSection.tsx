"use client";

import RemoteSection from "@/components/RemoteSection";
import { loadIss } from "@/lib/iss";

// Source 3: live telemetry of the International Space Station (JSON, no key).
export default function IssSection({ query }: { query: string }) {
  return <RemoteSection id="iss" title="International Space Station" load={loadIss} query={query} />;
}
