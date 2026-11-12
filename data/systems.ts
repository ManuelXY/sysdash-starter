import type { Limits } from "@/lib/status";

// Mock system data for the dashboard.
// The status is not part of the data: it is derived from value + limits.
export type System = {
  id: string;
  title: string;
  value: number;
  unit: string;
  limits?: Limits;
};

export const systems: System[] = [
  { id: "cpu", title: "CPU Load", value: 42, unit: "%", limits: { warnHigh: 75, critHigh: 90 } },
  { id: "ram", title: "Memory", value: 71, unit: "%", limits: { warnHigh: 80, critHigh: 95 } },
  { id: "disk", title: "Disk", value: 88, unit: "%", limits: { warnHigh: 80, critHigh: 95 } },
  {
    id: "temp",
    title: "Temperature",
    value: 56,
    unit: "°C",
    limits: { critLow: 5, warnLow: 10, warnHigh: 65, critHigh: 80 },
  },
  { id: "net", title: "Network", value: 12, unit: "MB/s", limits: { warnHigh: 90, critHigh: 100 } },
  { id: "uptime", title: "Uptime", value: 99.9, unit: "%", limits: { warnLow: 99.5, critLow: 99.0 } },
];
