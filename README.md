# RadioSense Dashboard

A real-time operational dashboard for the **Radio Ad Pipeline** — a system that monitors live radio streams, detects financial-services advertisements, and surfaces keyword intelligence for analysis.

Built with Vite + React + TypeScript + Tailwind CSS v4 + shadcn-style components.

---

## Overview

RadioSense provides analysts and engineers with a single-pane view of the entire Radio Ad Pipeline:

- Live health and queue metrics from the FastAPI harvest backend
- Real-time station stream status with chunk-age monitoring
- Detection feed showing captured radio ad transcripts
- Keyword candidate review and scoring
- Advertiser tracking and identification
- Harvest pipeline controls (start / stop / probe)
- Reports and export file browser

---

## Pages

| Route | Page | Data Source |
|---|---|---|
| `/` | Command Center | Live API + sample fallback |
| `/stations` | Live Stations | Live API + sample fallback |
| `/detections` | Live Detections | Live API + sample fallback |
| `/keywords` | Keyword Intelligence | Sample / API pending |
| `/advertisers` | Advertisers | Sample / API pending |
| `/harvest` | Harvest Control | Live API + sample fallback |
| `/health` | Pipeline Health | Live API + partial sample |
| `/reports` | Reports & Exports | Sample / API pending |

Pages marked **"Sample / API pending"** display clearly labeled placeholder data and will switch to live data once the corresponding backend endpoints are wired up.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build tool | Vite 7 |
| UI framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | react-router-dom v7 |
| Data fetching | TanStack Query v5 (polling) |
| Tables | TanStack Table v8 |
| Charts | Recharts v3 |
| Toasts | Sonner |
| Form validation | react-hook-form + Zod |
| Icons | lucide-react |

---

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- The **Radio Ad Pipeline FastAPI backend** running on `http://127.0.0.1:8081` (or a host of your choice)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/radiosense.git
cd radiosense
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

`.env.example` contents:

```
# Leave blank to use the Vite dev proxy (recommended for local dev).
# Set to a full URL to bypass the proxy (e.g. for a remote backend).
VITE_RADIO_API_BASE_URL=
```

The default (blank value) routes all API calls through the Vite dev proxy, which forwards `/api/*` and `/health` to `http://127.0.0.1:8081`. No CORS configuration is needed in this mode.

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## Connecting to the Backend

### Local dev (recommended)

Leave `VITE_RADIO_API_BASE_URL` blank in `.env`. The Vite proxy defined in `vite.config.ts` handles forwarding:

```ts
server: {
  proxy: {
    "/api": { target: "http://127.0.0.1:8081", changeOrigin: true },
    "/health": { target: "http://127.0.0.1:8081", changeOrigin: true },
  },
}
```

### Remote backend or production

Set the full backend URL in `.env`:

```
VITE_RADIO_API_BASE_URL=http://192.168.1.50:8081
```

Make sure the backend has CORS enabled for the frontend origin, or use a reverse proxy.

---

## Backend API Endpoints

The following endpoints are consumed by the frontend. All are expected on the backend at the base URL.

### Phase 1 — Live now

| Method | Path | Used by |
|---|---|---|
| `GET` | `/health` | Command Center, Pipeline Health |
| `GET` | `/api/harvest/status` | Command Center, Harvest Control |
| `GET` | `/api/harvest/queue-health` | Command Center, Pipeline Health, Harvest Control |
| `GET` | `/api/harvest/detections?limit=N` | Command Center, Live Detections, Harvest Control |
| `GET` | `/api/harvest/stations` | Command Center, Live Stations, Harvest Control |
| `POST` | `/api/harvest/probe` | Harvest Control |
| `POST` | `/api/harvest/start` | Harvest Control |
| `POST` | `/api/harvest/stop` | Harvest Control |

### Phase 2 — Planned

| Method | Path | Will power |
|---|---|---|
| `GET` | `/api/keyword-candidates` | Keyword Intelligence |
| `GET` | `/api/advertisers` | Advertisers |
| `GET` | `/api/exports` | Reports & Exports |
| `GET` | `/api/live/events` | SSE stream for true real-time updates |

---

## API Response Normalization

The frontend tolerates multiple response shapes from the backend without breaking:

```ts
// Detections — any of these shapes work:
Detection[]
{ rows: Detection[], count: number }

// Stations — any of these shapes work:
Station[]
{ stations: Station[] }
```

This normalization lives in `src/lib/api.ts` inside the `toArray()` helper.

---

## Polling Intervals

| Data | Interval |
|---|---|
| Health | 10 s |
| Queue health | 5 s |
| Harvest status | 10 s |
| Detections | 10 s |
| Stations | 30 s |

Intervals are defined in `src/lib/api.ts` under `refreshIntervals` and can be adjusted there.

---

## Project Structure

```
src/
  App.tsx                     # Route definitions
  main.tsx                    # Bootstrap: QueryClient + BrowserRouter
  index.css                   # Dark operational theme
  lib/
    api.ts                    # API client, types, polling intervals
    mock-data.ts              # Sample data (clearly labeled, not live)
    utils.ts                  # Tailwind class utilities
  pages/
    CommandCenter.tsx         # / — overview with KPIs and alerts
    LiveStations.tsx          # /stations — station stream health table
    LiveDetections.tsx        # /detections — detection feed with filters
    KeywordIntelligence.tsx   # /keywords — keyword candidate review
    Advertisers.tsx           # /advertisers — advertiser tracking
    HarvestControl.tsx        # /harvest — pipeline start/stop/probe
    PipelineHealth.tsx        # /health — service and queue diagnostics
    ReportsExports.tsx        # /reports — export file browser
  components/
    dashboard/
      AppSidebar.tsx          # Navigation sidebar
      DashboardLayout.tsx     # Page shell with header slot
      KpiCard.tsx             # Metric card with trend indicator
      StatusBadge.tsx         # Colored status label
      LiveIndicator.tsx       # Animated live dot
      RefreshTimer.tsx        # "Updated X ago" with spinner
      QueueHealthBar.tsx      # Segmented queue progress bar
      ApiPendingBadge.tsx     # "API pending" inline badge
      LoadingSkeleton.tsx     # Skeleton placeholders
      EmptyState.tsx          # Empty / error state
    ui/                       # shadcn-style UI primitives
```

---

## Mock Data Policy

`src/lib/mock-data.ts` contains sample data used as a fallback when the backend is unreachable or when an endpoint is not yet implemented.

- Every mock file has a top comment: `// All data in this file is SAMPLE / API PENDING.`
- Pages that fall back to mock data display a visible **"sample data · live when API available"** label.
- Pages that are fully mock-only display an **API pending** badge.
- Mock station names match the real Radio Ad Pipeline station set: KTRH, KLIF, WSB, WBAP, WOAI, WHBO, WTAM, WIBC, WWTN.
- The only confirmed advertiser in mock data is **Billshappen.com**. All others are clearly labeled as `(Sample Advertiser A/B/C)`.

Do not treat any mock row as a live detection or a confirmed advertiser relationship.

---

## Build

```bash
npm run build
```

Output is written to `dist/`. The `dist/_redirects` file configures fallback routing for Netlify-style static deployments (all paths fall back to `index.html`).

For other static hosts (nginx, Caddy, etc.), configure a catch-all fallback to `index.html` so that direct navigation to `/stations`, `/detections`, etc. does not return 404.

---

## Type Check

```bash
npm run typecheck
```

---

## Roadmap

- [ ] Connect Keyword Intelligence to `/api/keyword-candidates`
- [ ] Connect Advertisers page to `/api/advertisers`
- [ ] Connect Reports page to `/api/exports`
- [ ] Add SSE support via `/api/live/events` for true real-time (replaces polling)
- [ ] Add watchdog / alert notification panel
- [ ] Add detection detail modal with full transcript view
- [ ] Add keyword approval / rejection workflow
