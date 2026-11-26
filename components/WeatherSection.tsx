"use client";

import RemoteSection from "@/components/RemoteSection";
import { loadWeather } from "@/lib/weather";
import type { SortKey } from "@/lib/systemLogic";

// Source 1: OpenWeatherMap (JSON, needs an API key).
// A client component of its own, because functions like loadWeather
// cannot be passed from the server-rendered page into a client component.
type WeatherSectionProps = {
  query: string;
  sortKey: SortKey;
};

export default function WeatherSection({ query, sortKey }: WeatherSectionProps) {
  return <RemoteSection id="weather" title="Weather in Lucerne" load={loadWeather} query={query} sortKey={sortKey} />;
}
