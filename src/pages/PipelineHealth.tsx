import { useQuery } from "@tanstack/react-query"
import { ExternalLink, AlertTriangle, CheckCircle, XCircle, Database, Server, Eye } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { RefreshTimer } from "@/components/dashboard/RefreshTimer"
import { QueueHealthBar } from "@/components/dashboard/QueueHealthBar"
import { ApiPendingBadge } from "@/components/dashboard/ApiPendingBadge"
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton"
import { Button } from "@/components/ui/button"
import { api, refreshIntervals } from "@/lib/api"
import { cn } from "@/lib/utils"

const mockServices = [
  { name: "harvester", status: "running", uptime: "2d 14h", cpu: "12%", mem: "340MB" },
  { name: "transcriber", status: "running", uptime: "2d 14h", cpu: "45%", mem: "1.2GB" },
  { name: "detector", status: "running", uptime: "2d 14h", cpu: "8%", mem: "280MB" },
  { name: "watchdog", status: "running", uptime: "2d 14h", cpu: "1%", mem: "48MB" },
  { name: "queue-worker", status: "running", uptime: "2d 14h", cpu: "22%", mem: "520MB" },
  { name: "api-server", status: "running", uptime: "2d 14h", cpu: "4%", mem: "120MB" },
]

const mockErrors = [
  { ts: "2026-06-21T04:12:33Z", service: "harvester", level: "warn", message: "Station KTXH chunk age > 90s, stream may be stale" },
  { ts: "2026-06-21T03:58:11Z", service: "transcriber", level: "warn", message: "Whisper model slow response (3.2s avg), queue backing up" },
  { ts: "2026-06-21T03:44:07Z", service: "detector", level: "error", message: "KPRC stream connection refused, marking station down" },
  { ts: "2026-06-21T02:15:22Z", service: "queue-worker", level: "warn", message: "Drop ratio exceeded 0.65 threshold" },
  { ts: "2026-06-20T23:01:45Z", service: "harvester", level: "info", message: "KHPT disabled by operator, stopping stream capture" },
]

export function PipelineHealth() {
  const healthQ = useQuery({ queryKey: ["health"], queryFn: api.getHealth, refetchInterval: refreshIntervals.health, retry: 1 })
  const queueQ = useQuery({ queryKey: ["queueHealth"], queryFn: api.getQueueHealth, refetchInterval: refreshIntervals.queueHealth, retry: 1 })

  const health = healthQ.data
  const queue = queueQ.data

  const isDbHealthy = health?.db === "ok" || (health?.status === "ok" && !healthQ.isError)

  return (
    <DashboardLayout
      title="Pipeline Health"
      subtitle="Infrastructure and service status"
      headerRight={
        <RefreshTimer lastUpdated={Math.max(healthQ.dataUpdatedAt, queueQ.dataUpdatedAt) || null} intervalMs={refreshIntervals.queueHealth} isFetching={healthQ.isFetching || queueQ.isFetching} />
      }
    >
      {/* External links */}
      <div className="mb-3 flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" asChild>
          <a href="http://127.0.0.1:3000" target="_blank" rel="noreferrer">
            <ExternalLink className="h-3 w-3" />
            Grafana
          </a>
        </Button>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" asChild>
          <a href="http://127.0.0.1:9090" target="_blank" rel="noreferrer">
            <ExternalLink className="h-3 w-3" />
            Prometheus
          </a>
        </Button>
        <span className="text-[10px] text-muted-foreground">External monitoring links</span>
      </div>

      {/* KPIs */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="API Health"
          value={healthQ.isError ? "error" : health?.status ?? "checking"}
          icon={healthQ.isError ? XCircle : CheckCircle}
          variant={healthQ.isError ? "danger" : health?.status === "ok" ? "success" : "warning"}
        />
        <KpiCard label="DB" value={isDbHealthy ? "ok" : "error"} icon={Database} variant={isDbHealthy ? "success" : "danger"} pending={healthQ.isError} />
        <KpiCard label="Pending" value={queue?.pending} variant="warning" pending={!queue} />
        <KpiCard label="Processing" value={queue?.processing} pending={!queue} />
        <KpiCard label="Dropped" value={queue?.dropped?.toLocaleString()} variant="danger" pending={!queue} />
        <KpiCard label="Drop Ratio" value={queue ? (queue.drop_ratio * 100).toFixed(1) + "%" : null} variant={queue?.drop_ratio && queue.drop_ratio > 0.5 ? "danger" : "warning"} pending={!queue} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Queue health detail */}
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-semibold text-foreground">Queue Health</span>
            {!queue && <ApiPendingBadge />}
          </div>
          <div className="px-3 py-2.5">
            {queue ? (
              <div className="space-y-3">
                <QueueHealthBar pending={queue.pending} processing={queue.processing} done={queue.done} dropped={queue.dropped} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded border border-border bg-background px-2 py-1.5">
                    <div className="text-[10px] text-muted-foreground">Done Total</div>
                    <div className="text-base font-bold tabular-nums text-green-400">{queue.done.toLocaleString()}</div>
                  </div>
                  <div className="rounded border border-border bg-background px-2 py-1.5">
                    <div className="text-[10px] text-muted-foreground">Drop Ratio</div>
                    <div className={cn("text-base font-bold tabular-nums", queue.drop_ratio > 0.5 ? "text-red-400" : "text-amber-400")}>
                      {(queue.drop_ratio * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                {queue.drop_warning && (
                  <div className="flex items-center gap-1.5 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Queue drop ratio exceeds warning threshold. Check transcriber throughput.
                  </div>
                )}
              </div>
            ) : (
              <LoadingSkeleton rows={3} />
            )}
          </div>
        </div>

        {/* DB / service health */}
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-semibold text-foreground">Health Endpoint</span>
            {healthQ.isError && <StatusBadge status="error" label="unreachable" />}
          </div>
          <div className="px-3 py-2.5 space-y-2">
            {healthQ.isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border/50 py-1">
                  <span className="text-[10px] text-muted-foreground">Status</span>
                  <span className={cn("text-xs font-semibold", healthQ.isError ? "text-red-400" : "text-green-400")}>
                    {healthQ.isError ? "unreachable" : health?.status ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 py-1">
                  <span className="text-[10px] text-muted-foreground">Database</span>
                  <span className={cn("text-xs font-semibold", isDbHealthy ? "text-green-400" : "text-red-400")}>
                    {healthQ.isError ? "unknown" : isDbHealthy ? "ok" : "degraded"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 py-1">
                  <span className="text-[10px] text-muted-foreground">Version</span>
                  <span className="text-xs text-foreground">{health?.version ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] text-muted-foreground">Uptime</span>
                  <span className="text-xs text-foreground">{health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : "—"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Service status (mock) */}
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-semibold text-foreground">Service Status</span>
            <ApiPendingBadge />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground">
                  <th className="px-3 py-1.5 text-left font-medium">Service</th>
                  <th className="px-3 py-1.5 text-left font-medium">Status</th>
                  <th className="px-3 py-1.5 text-left font-medium">Uptime</th>
                  <th className="px-3 py-1.5 text-left font-medium">CPU</th>
                  <th className="px-3 py-1.5 text-left font-medium">Mem</th>
                </tr>
              </thead>
              <tbody>
                {mockServices.map((svc) => (
                  <tr key={svc.name} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="px-3 py-1.5 font-mono font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Server className="h-3 w-3 text-muted-foreground" />
                        {svc.name}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <StatusBadge status={svc.status === "running" ? "running" : "stopped"} dot />
                    </td>
                    <td className="px-3 py-1.5 tabular-nums text-muted-foreground">{svc.uptime}</td>
                    <td className="px-3 py-1.5 tabular-nums text-muted-foreground">{svc.cpu}</td>
                    <td className="px-3 py-1.5 tabular-nums text-muted-foreground">{svc.mem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent errors */}
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-semibold text-foreground">Recent Errors & Events</span>
            <ApiPendingBadge />
          </div>
          <div className="divide-y divide-border/50">
            {mockErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 hover:bg-accent/30">
                <div className="mt-0.5 shrink-0">
                  {err.level === "error" ? (
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                  ) : err.level === "warn" ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-semibold text-primary">{err.service}</span>
                    <span className={cn("rounded px-1 text-[9px] font-semibold uppercase",
                      err.level === "error" ? "bg-red-500/10 text-red-400" :
                      err.level === "warn" ? "bg-amber-500/10 text-amber-400" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {err.level}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {new Date(err.ts).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{err.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
