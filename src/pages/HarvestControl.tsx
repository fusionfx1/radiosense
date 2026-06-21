import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Play, Square, Radio, Zap, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { RefreshTimer } from "@/components/dashboard/RefreshTimer"
import { QueueHealthBar } from "@/components/dashboard/QueueHealthBar"
import { ApiPendingBadge } from "@/components/dashboard/ApiPendingBadge"
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton"
import { Button } from "@/components/ui/button"
import { api, refreshIntervals } from "@/lib/api"
import { mockStations, mockDetections } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function HarvestControl() {
  const queryClient = useQueryClient()

  const statusQ = useQuery({ queryKey: ["harvestStatus"], queryFn: api.getHarvestStatus, refetchInterval: refreshIntervals.harvestStatus, retry: 1 })
  const queueQ = useQuery({ queryKey: ["queueHealth"], queryFn: api.getQueueHealth, refetchInterval: refreshIntervals.queueHealth, retry: 1 })
  const stationsQ = useQuery({ queryKey: ["stations"], queryFn: api.getStations, refetchInterval: refreshIntervals.stations, retry: 1 })
  const detectionsQ = useQuery({ queryKey: ["detections", 50], queryFn: () => api.getDetections(50), refetchInterval: refreshIntervals.harvestDetections, retry: 1 })

  const probeMut = useMutation({
    mutationFn: api.probeStations,
    onSuccess: (data) => {
      toast.success(data.message ?? "Probe complete")
      queryClient.invalidateQueries({ queryKey: ["stations"] })
    },
    onError: (err) => toast.error(`Probe failed: ${err.message}`),
  })

  const startMut = useMutation({
    mutationFn: api.startHarvest,
    onSuccess: (data) => {
      toast.success(data.message ?? "Harvest started")
      queryClient.invalidateQueries({ queryKey: ["harvestStatus"] })
    },
    onError: (err) => toast.error(`Start failed: ${err.message}`),
  })

  const stopMut = useMutation({
    mutationFn: api.stopHarvest,
    onSuccess: (data) => {
      toast.success(data.message ?? "Harvest stopped")
      queryClient.invalidateQueries({ queryKey: ["harvestStatus"] })
    },
    onError: (err) => toast.error(`Stop failed: ${err.message}`),
  })

  const harvest = statusQ.data
  const queue = queueQ.data
  const stations = stationsQ.data ?? mockStations
  const detections = detectionsQ.data ?? mockDetections.slice(0, 20)

  const isRunning = harvest?.status === "running"
  const isBusy = probeMut.isPending || startMut.isPending || stopMut.isPending

  return (
    <DashboardLayout
      title="Harvest Control"
      subtitle="Manage harvest pipeline"
      headerRight={
        <RefreshTimer lastUpdated={Math.max(statusQ.dataUpdatedAt, queueQ.dataUpdatedAt) || null} intervalMs={refreshIntervals.harvestStatus} isFetching={statusQ.isFetching || queueQ.isFetching} />
      }
    >
      {/* Controls */}
      <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5">
        <span className="text-xs font-semibold text-foreground">Controls</span>
        <div className="ml-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => probeMut.mutate()}
            disabled={isBusy}
          >
            <Radio className="h-3.5 w-3.5" />
            Probe Stations
          </Button>
          <Button
            size="sm"
            className="h-7 gap-1.5 bg-green-600 text-xs hover:bg-green-500"
            onClick={() => startMut.mutate()}
            disabled={isBusy || isRunning}
          >
            <Play className="h-3.5 w-3.5" />
            Start Harvest
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => stopMut.mutate()}
            disabled={isBusy || !isRunning}
          >
            <Square className="h-3.5 w-3.5" />
            Stop Harvest
          </Button>
        </div>
        {statusQ.isError && <ApiPendingBadge />}
        {harvest && (
          <div className="ml-auto flex items-center gap-3">
            <StatusBadge status={isRunning ? "running" : "stopped"} dot />
            {harvest.active_profile && (
              <span className="text-[10px] text-muted-foreground">Profile: <span className="font-mono text-foreground">{harvest.active_profile}</span></span>
            )}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Status" value={harvest?.status} variant={isRunning ? "success" : "muted"} icon={Zap} pending={statusQ.isError} />
        <KpiCard label="Profile" value={harvest?.active_profile} pending={!harvest?.active_profile} />
        <KpiCard label="Start Time" value={harvest?.start_time ? format(new Date(harvest.start_time), "HH:mm:ss") : null} pending={!harvest?.start_time} />
        <KpiCard label="Pending" value={queue?.pending} icon={AlertTriangle} variant="warning" pending={!queue} />
        <KpiCard label="Processing" value={queue?.processing} pending={!queue} />
        <KpiCard label="Drop Ratio" value={queue ? (queue.drop_ratio * 100).toFixed(1) + "%" : null} variant={queue?.drop_ratio && queue.drop_ratio > 0.5 ? "danger" : "warning"} pending={!queue} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Queue health */}
        <div className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-3 py-2">
            <span className="text-xs font-semibold text-foreground">Queue Health</span>
          </div>
          <div className="px-3 py-2.5">
            {queue ? (
              <>
                <QueueHealthBar pending={queue.pending} processing={queue.processing} done={queue.done} dropped={queue.dropped} />
                {queue.drop_warning && (
                  <div className="mt-2 flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Drop ratio warning
                  </div>
                )}
              </>
            ) : (
              <LoadingSkeleton rows={3} />
            )}
          </div>
        </div>

        {/* Station list */}
        <div className="rounded-md border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-semibold text-foreground">
              Stations ({stations.length})
            </span>
            {stationsQ.isError && <ApiPendingBadge />}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground">
                  <th className="px-3 py-1.5 text-left font-medium">Station</th>
                  <th className="px-3 py-1.5 text-left font-medium">Status</th>
                  <th className="px-3 py-1.5 text-left font-medium">Enabled</th>
                  <th className="px-3 py-1.5 text-left font-medium">Chunk Age</th>
                  <th className="px-3 py-1.5 text-left font-medium">Det. 24h</th>
                  <th className="px-3 py-1.5 text-left font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="px-3 py-1 font-mono font-bold text-primary">{s.name}</td>
                    <td className="px-3 py-1">
                      <StatusBadge status={(s.status ?? "disabled") as "live" | "stale" | "down" | "disabled"} dot />
                    </td>
                    <td className="px-3 py-1">
                      <span className={cn("font-medium", s.enabled ? "text-green-400" : "text-muted-foreground")}>
                        {s.enabled ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-1 tabular-nums text-muted-foreground">
                      {s.chunk_age_seconds != null ? `${s.chunk_age_seconds}s` : "—"}
                    </td>
                    <td className="px-3 py-1 tabular-nums font-semibold">{s.detections_24h ?? "—"}</td>
                    <td className="px-3 py-1 text-red-400 text-[10px]">{s.last_error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Latest detections */}
      <div className="mt-3 rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-semibold text-foreground">Latest Harvest Detections</span>
          {detectionsQ.isError && <ApiPendingBadge />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground">
                <th className="px-3 py-1.5 text-left font-medium">Time</th>
                <th className="px-3 py-1.5 text-left font-medium">Station</th>
                <th className="px-3 py-1.5 text-left font-medium">Advertiser</th>
                <th className="px-3 py-1.5 text-left font-medium">Confidence</th>
                <th className="px-3 py-1.5 text-left font-medium">Transcript</th>
              </tr>
            </thead>
            <tbody>
              {detections.map((d) => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="whitespace-nowrap px-3 py-1 tabular-nums text-muted-foreground text-[10px]">
                    {d.detected_at ? format(new Date(d.detected_at), "HH:mm:ss") : "—"}
                  </td>
                  <td className="px-3 py-1 font-mono font-bold text-primary">{d.station ?? "—"}</td>
                  <td className="px-3 py-1 font-medium text-foreground">{d.company_name ?? "—"}</td>
                  <td className="px-3 py-1 tabular-nums">
                    <span className={cn("font-semibold", (d.confidence ?? 0) >= 0.8 ? "text-green-400" : "text-amber-400")}>
                      {d.confidence != null ? (d.confidence * 100).toFixed(0) + "%" : "—"}
                    </span>
                  </td>
                  <td className="max-w-[300px] px-3 py-1 font-mono text-[10px] text-muted-foreground">
                    {d.transcript_snippet ? (d.transcript_snippet.length > 80 ? d.transcript_snippet.slice(0, 80) + "…" : d.transcript_snippet) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
