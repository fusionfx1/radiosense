// Empty string → relative paths → Vite dev proxy forwards to 127.0.0.1:8081.
// Set VITE_RADIO_API_BASE_URL to a full URL to override (e.g. in production).
export const BASE_URL = import.meta.env.VITE_RADIO_API_BASE_URL ?? ""

export const refreshIntervals = {
  health: 10_000,
  queueHealth: 5_000,
  harvestStatus: 10_000,
  harvestDetections: 10_000,
  stations: 30_000,
}

// --- Types ---

export interface HealthResponse {
  status: string
  db?: string
  db_reachable?: boolean
  version?: string
  uptime?: number
  pending_count?: number
  timestamp?: string
}

export interface QueueHealthResponse {
  pending: number
  processing: number
  done: number
  dropped: number
  drop_ratio: number
  drop_warning?: boolean
  timestamp?: string
}

export interface HarvestStatusResponse {
  status: string
  active_profile?: string
  start_time?: string
  stop_time?: string
  station_count?: number
  enabled_stations?: number
}

export interface Station {
  id: number
  name: string
  display_name?: string
  enabled: boolean
  stream_url?: string
  format?: string
  status?: "live" | "stale" | "down" | "disabled"
  last_checked?: string
  chunk_age_seconds?: number
  detections_24h?: number
  last_error?: string | null
}

export interface Detection {
  id: number
  station?: string
  station_id?: number
  company_name?: string
  keyword?: string
  confidence?: number
  is_ad?: boolean
  offer_summary?: string
  transcript_snippet?: string
  review_status?: "new" | "reviewed" | "approved" | "rejected"
  detected_at?: string
  created_at?: string
}

// --- API helpers ---

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// Normalize any envelope shape the backend may return into a flat array
function toArray<T>(data: T | T[] | { rows?: T[]; stations?: T[]; items?: T[] }): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.rows)) return obj.rows as T[]
    if (Array.isArray(obj.stations)) return obj.stations as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
  }
  return []
}

export const api = {
  getHealth: () => apiFetch<HealthResponse>("/health"),

  getQueueHealth: () => apiFetch<QueueHealthResponse>("/api/harvest/queue-health"),

  getHarvestStatus: () => apiFetch<HarvestStatusResponse>("/api/harvest/status"),

  getDetections: async (limit = 50): Promise<Detection[]> => {
    const data = await apiFetch<unknown>(`/api/harvest/detections?limit=${limit}`)
    return toArray<Detection>(data as Detection | Detection[] | { rows?: Detection[] })
  },

  getStations: async (): Promise<Station[]> => {
    const data = await apiFetch<unknown>("/api/harvest/stations")
    return toArray<Station>(data as Station | Station[] | { stations?: Station[] })
  },

  probeStations: () =>
    apiFetch<{ message: string }>("/api/harvest/probe", { method: "POST" }),

  startHarvest: () =>
    apiFetch<{ message: string }>("/api/harvest/start", { method: "POST" }),

  stopHarvest: () =>
    apiFetch<{ message: string }>("/api/harvest/stop", { method: "POST" }),
}
