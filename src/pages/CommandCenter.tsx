import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow, format } from "date-fns"
import {
  Activity,
  Radio,
  CheckCircle,
  Clock,
  Cpu,
  XCircle,
  AlertTriangle,
  Zap,
  ToggleRight,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { LiveIndicator } from "@/components/dashboard/LiveIndicator"
import { RefreshTimer } from "@/components/dashboard/RefreshTimer"
import { QueueHealthBar } from "@/components/dashboard/QueueHealthBar"
import { ApiPendingBadge } from "@/components/dashboard/ApiPendingBadge"
import { LoadingSkeleton, KpiSkeletons } from "@/components/dashboard/LoadingSkeleton"
import { ErrorState } from "@/components/dashboard/EmptyState"
import { api, refreshIntervals } from "@/lib/api"
import { mockStations, mockDetections } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function CommandCenter() {
  const healthQ = useQuery({
    queryKey: ["health"],
    queryFn: api.getHealth,
    refetchInterval: refreshIntervals.health,
    retry: 1,
  })

  const queueQ = useQuery({
    queryKey: ["queueHealth"],
    queryFn: api.getQueueHealth,
    refetchInterval: refreshIntervals.queueHealth,
    retry: 1,
  })

  const harvestQ = useQuery({
    queryKey: ["harvestStatus"],
    queryFn: api.getHarvestStatus,
    refetchInterval: refreshIntervals.harvestStatus,
    retry: 1,
  })

  const stationsQ = useQuery({
    queryKey: ["stations"],
    queryFn: api.getStations,
    refetchInterval: refreshIntervals.stations,
    retry: 1,
  })

  const detectionsQ = useQuery({
    queryKey: ["detections", 10],
    queryFn: () => api.getDetections(10),
    refetchInterval: refreshIntervals.harvestDetections,
    retry: 1,
  })

  const stations = stationsQ.data ?? mockStations
  const detections = detectionsQ.data ?? mockDetections.slice(0, 10)
  const queue = queueQ.data
  const health = healthQ.data
  const harvest = harvestQ.data

  const liveStations = stations.filter((s) => s.status === "live").length
  const enabledStations = stations.filter((s) => s.enabled).length
  const latestDetection = detections[0]

  const isAnyFetching = [healthQ, queueQ, harvestQ, stationsQ, detectionsQ].some((q) => q.isFetching)
  const lastUpdated = Math.max(
    healthQ.dataUpdatedAt,
    queueQ.dataUpdatedAt,
    harvestQ.dataUpdatedAt,
    stationsQ.dataUpdatedAt,
    detectionsQ.dataUpdatedAt,
  ) || null

  const dropRatioPct = queue ? (queue.drop_ratio * 100).toFixed(1) + "%" : null

  const alerts: Array<{ level: "warn" | "error"; message: string }> = []
  if (queue?.drop_warning) alerts.push({ level: "warn", message: "Queue drop ratio is high" })
  if (stations.some((s) => s.status === "down")) alerts.push({ level: "error", message: `${stations.filter((s) => s.status === "down").length} station(s) down` })
  if (stations.some((s) => s.status === "stale")) alerts.push({ level: "warn", message: `${stations.filter((s) => s.status === "stale").length} station(s) stale` })

  return (
    <DashboardLayout
      title="Command Center"
      subtitle="Realtime pipeline overview"
      headerRight={
        <RefreshTimer lastUpdated={lastUpdated} intervalMs={5000} isFetching={isAnyFetching} />
      }
    >
      {/* Status bar */}
      <div className="mb-3 flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
        <LiveIndicator active={health?.status === "ok" || !healthQ.isError} label="Pipeline" />
        <span className="text-xs text-muted-foreground">|</span>
        <span className="text-xs text-muted-foreground">
          Health:{" "}
          <span className={cn("font-medium", healthQ.isError ? "text-red-400" : "text-green-400")}>
            {healthQ.isError ? "Unreachable" : health?.status ?? "checking..."}
          </span>
        </span>
        <span className="text-xs text-muted-foreground">|</span>
        <span className="text-xs text-muted-foreground">
          Harvest:{" "}
          <span className={cn("font-medium", harvest?.status === "running" ? "text-green-400" : "text-amber-400")}>
            {harvestQ.isError ? "unknown" : harvest?.status ?? "checking..."}
          </span>
        </span>
        {harvestQ.isError && <ApiPendingBadge />}
        <div className="ml-auto flex items-center gap-2">
          {alerts.map((a, i) => (
            <span
              key={i}
              className={cn(
                "flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]",
                a.level === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              {a.message}
            </span>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
        {(healthQ.isLoading || queueQ.isLoading || harvestQ.isLoading || stationsQ.isLoading) && !queue && !stations.length ? (
          <KpiSkeletons count={10} />
        ) : (
          <>
            <KpiCard label="Pipeline" value={health?.status ?? (healthQ.isError ? "error" : null)} icon={Activity} variant={health?.status === "ok" ? "success" : healthQ.isError ? "danger" : "muted"} />
            <KpiCard label="Live Stations" value={liveStations} icon={Radio} variant="success" />
            <KpiCard label="Enabled" value={enabledStations} icon={ToggleRight} />
            <KpiCard label="Pending" value={queue?.pending} icon={Clock} variant="warning" pending={!queue} />
            <KpiCard label="Processing" value={queue?.processing} icon={Cpu} variant="default" pending={!queue} />
            <KpiCard label="Done" value={queue?.done?.toLocaleString()} icon={CheckCircle} variant="success" pending={!queue} />
            <KpiCard label="Dropped" value={queue?.dropped?.toLocaleString()} icon={XCircle} variant="danger" pending={!queue} />
            <KpiCard label="Drop Ratio" value={dropRatioPct} icon={AlertTriangle} variant={queue?.drop_ratio && queue.drop_ratio > 0.5 ? "danger" : "warning"} pending={!queue} />
            <KpiCard label="Harvest" value={harvest?.status} icon={Zap} variant={harvest?.status === "running" ? "success" : "muted"} pending={harvestQ.isError} />
            <KpiCard label="Latest Detection" value={latestDetection?.detected_at ? formatDistanceToNow(new Date(latestDetection.detected_at), { addSuffix: true }) : null} icon={Radio} subtext={latestDetection?.company_name} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Station grid */}
        <div className="rounded-md border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-semibold text-foreground">Station Status</span>
            {stationsQ.isError && <ApiPendingBadge />}
            {!stationsQ.isError && !stationsQ.data && <span className="text-[10px] text-muted-foreground">sample data · live when API available</span>}
          </div>
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 xl:grid-cols-4">
            {stations.map((station) => (
              <div key={station.id} className="flex flex-col gap-1 bg-card px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{station.name}</span>
                  <StatusBadge status={(station.status as "live" | "stale" | "down" | "disabled") ?? "disabled"} dot />
                </div>
                <span className="truncate text-[10px] text-muted-foreground">
                  {station.display_name}
                </span>
                {station.last_error && (
                  <span className="truncate text-[10px] text-red-400">{station.last_error}</span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {station.detections_24h ?? 0} det. 24h
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Queue health */}
          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-semibold text-foreground">Queue Health</span>
              {!queue && <ApiPendingBadge />}
            </div>
            <div className="px-3 py-2.5">
              {queue ? (
                <QueueHealthBar
                  pending={queue.pending}
                  processing={queue.processing}
                  done={queue.done}
                  dropped={queue.dropped}
                />
              ) : (
                <LoadingSkeleton rows={2} />
              )}
              {queue && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Drop ratio</span>
                    <span className={cn("font-semibold tabular-nums", queue.drop_ratio > 0.5 ? "text-red-400" : "text-amber-400")}>
                      {(queue.drop_ratio * 100).toFixed(1)}%
                    </span>
                  </div>
                  {queue.drop_warning && (
                    <div className="mt-1.5 flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      Drop ratio warning active
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-md border border-border bg-card">
            <div className="border-b border-border px-3 py-2">
              <span className="text-xs font-semibold text-foreground">Alerts</span>
            </div>
            <div className="px-3 py-2">
              {alerts.length === 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  All systems nominal
                </div>
              ) : (
                <div className="space-y-1.5">
                  {alerts.map((a, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-1.5 rounded px-2 py-1 text-xs",
                        a.level === "error"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                      )}
                    >
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {a.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Latest detections feed */}
      <div className="mt-3 rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-semibold text-foreground">Latest Detections</span>
          {detectionsQ.isError
            ? <ApiPendingBadge />
            : !detectionsQ.data && <span className="text-[10px] text-muted-foreground">sample data · live when API available</span>
          }
        </div>
        {detectionsQ.isLoading && !detections.length ? (
          <div className="p-3"><LoadingSkeleton rows={4} /></div>
        ) : detectionsQ.isError && !detections.length ? (
          <ErrorState error="Cannot reach /api/harvest/detections" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-[10px] text-muted-foreground">
                  <th className="px-3 py-1.5 font-medium">Time</th>
                  <th className="px-3 py-1.5 font-medium">Station</th>
                  <th className="px-3 py-1.5 font-medium">Advertiser</th>
                  <th className="px-3 py-1.5 font-medium">Confidence</th>
                  <th className="px-3 py-1.5 font-medium">Ad</th>
                  <th className="px-3 py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {detections.map((d) => (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="whitespace-nowrap px-3 py-1.5 tabular-nums text-muted-foreground">
                      {d.detected_at ? format(new Date(d.detected_at), "HH:mm:ss") : "—"}
                    </td>
                    <td className="px-3 py-1.5 font-mono font-semibold text-primary">{d.station ?? "—"}</td>
                    <td className="px-3 py-1.5 font-medium text-foreground">{d.company_name ?? "—"}</td>
                    <td className="px-3 py-1.5 tabular-nums">
                      <span className={cn("font-semibold", (d.confidence ?? 0) >= 0.8 ? "text-green-400" : (d.confidence ?? 0) >= 0.6 ? "text-amber-400" : "text-red-400")}>
                        {d.confidence != null ? (d.confidence * 100).toFixed(0) + "%" : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      {d.is_ad ? (
                        <span className="text-green-400">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <StatusBadge status={(d.review_status as "new" | "reviewed" | "approved" | "rejected") ?? "new"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
