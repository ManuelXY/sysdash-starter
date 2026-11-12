# SysDash — Starter

Das Startprojekt für unser Kursprojekt **SysDash**: ein Dashboard, das Systemzustände anzeigt. Es wächst über die 8 Kurstage mit — von statischen Kacheln bis zu echten Daten aus einer API.

Gebaut mit **Next.js (App Router)** + **Tailwind CSS** + **TypeScript** — mit Typsicherheit von Anfang an.

## Loslegen

Dieses Projekt ist ein GitHub-**Template**. Hol es dir nicht per Clone dieses Repos, sondern:
**„Use this template" → „Create a new repository"** unter deinem eigenen Account. Dann **dein neues Repo** klonen.

Voraussetzung: **Node.js** (LTS) ist installiert (`node -v`).

```bash
git clone https://github.com/DEIN-NAME/sysdash.git
cd sysdash
npm install     # einmalig: Abhängigkeiten laden
npm run dev     # Entwicklungsserver starten
```

Dann im Browser öffnen: **http://localhost:3000**

Ändere eine Datei, speichere — der Browser aktualisiert sich **sofort** (Hot Reload). Das ist deine Arbeitsschleife.

## API-Key einrichten (Wetterdaten)

Die Wetter-Kacheln brauchen einen kostenlosen Key von OpenWeatherMap
(openweathermap.org → Sign up → „API keys"). Ein neuer Key ist nicht sofort aktiv,
das kann bis zu zwei Stunden dauern.

1. `.env.example` nach `.env.local` kopieren.
2. Den Key hinter `OPENWEATHER_API_KEY=` eintragen.
3. Entwicklungsserver neu starten (`npm run dev`).

`.env.local` steht in `.gitignore` — der Key landet nie im Repo. Er bleibt ausserdem
auf dem Server: Der Browser ruft nur `/api/weather` auf, erst diese Route hängt den Key an.

## Datenquellen

| Bereich | Quelle | Format | Weg |
|---|---|---|---|
| Server metrics | `data/systems.ts` | Mock | Status wird aus Wert + Grenzwerten berechnet |
| Weather in Lucerne | OpenWeatherMap | JSON, mit Key | Browser → `/api/weather` → OpenWeatherMap |
| Zurich Airport (LSZH) | aviationweather.gov (METAR) | XML, ohne Key | Browser → `/api/metar` → aviationweather.gov, im Browser mit `DOMParser` geparst |

Jede Live-Quelle hat ihren eigenen Lade-, Leer- und Fehlerzustand (Timeout, 429,
abgelehnter Key, kein Netz, unlesbare Antwort) und einen Refresh-Button.

## Was liegt wo

| Datei | Wofür |
|---|---|
| `app/page.tsx` | Die Startseite: Kopfzeile mit Gesamtstatus, sortierte Kacheln, Live-Bereiche |
| `app/layout.tsx` | Das Grundgerüst der Seite, bindet die Schrift ein |
| `app/globals.css` | Design-Tokens (Farben, Schrift) für Tailwind + Fokus-Stil |
| `app/api/weather/route.ts` | Server-Route zu OpenWeatherMap (hält den Key geheim) |
| `app/api/metar/route.ts` | Server-Route zu aviationweather.gov (reicht das XML durch) |
| `components/Tile.tsx` | Eine Kachel: Titel, Wert, Einheit, optional Status |
| `components/TileGrid.tsx` | Responsives Raster: 1 / 2 / 3 Spalten |
| `components/StatusBadge.tsx`, `StatusIcon.tsx` | Status als Icon + Wort (nie nur Farbe) |
| `components/StatusSummary.tsx` | Gesamtbild in der Kopfzeile (`reduce`) |
| `components/RemoteSection.tsx` | Bereich für eine Live-Quelle mit Lade-, Leer- und Fehlerzustand |
| `components/WeatherSection.tsx`, `MetarSection.tsx` | Die beiden Live-Bereiche |
| `hooks/useRemoteData.ts` | Lädt Daten, verwaltet den Zustand, bietet `refresh()` |
| `lib/status.ts` | Domänenlogik: `getStatus`, Zählen, Sortieren (reine Funktionen) |
| `lib/http.ts` | `fetch` mit Timeout und typisierten Fehlern |
| `lib/weather.ts`, `lib/metar.ts` | Antworten defensiv in Kacheln umwandeln (JSON bzw. XML) |
| `lib/readings.ts` | Typ `Reading` + `toNumber` |
| `data/systems.ts` | Mock-Systemdaten + Typ `System` mit Grenzwerten |

## Deine ersten Aufgaben

Die ausführliche Anleitung bekommst du im Unterricht. Kurz:

1. Eigenes Repo aus diesem Template anlegen, klonen, starten (oben).
2. In `app/page.tsx` die Kachel ändern (Titel + Wert) und live beobachten.
3. Statt einzelner Kacheln alle aus `data/systems.ts` erzeugen (`.map(...)`).
4. Nach jeder Änderung committen & pushen — dein Repo ist dein Netz.

> Trau dich, Dinge auszuprobieren und kaputtzumachen. Jeder Commit ist zurückrollbar (Git-Grundlagen folgen später im Kurs).
