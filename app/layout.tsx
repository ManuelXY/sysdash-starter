import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

// IBM Plex Sans is served from our own project (app/fonts), not from a
// third-party server. next/font exposes it as the CSS variable --font-plex.
const plex = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-400.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-sans-500.woff2", weight: "500" },
    { path: "./fonts/ibm-plex-sans-600.woff2", weight: "600" },
  ],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SysDash",
  description: "System status at a glance: server metrics and live weather data.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The interface text is English, so the page language is "en".
    <html lang="en" className={plex.variable}>
      <body>{children}</body>
    </html>
  );
}
