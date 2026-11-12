"use client";

import RemoteSection from "@/components/RemoteSection";
import { loadWeather } from "@/lib/weather";

// Source 1: OpenWeatherMap (JSON, needs an API key).
// A client component of its own, because functions like loadWeather
// cannot be passed from the server-rendered page into a client component.
export default function WeatherSection() {
  return <RemoteSection id="weather" title="Weather in Lucerne" load={loadWeather} />;
}
