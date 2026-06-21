import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown, Pause, Play } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { LiveIndicator } from "@/components/dashboard/LiveIndicator"
import { RefreshTimer } from "@/components/dashboard/RefreshTimer"
import { ApiPendingBadge } from "@/components/dashboard/ApiPendingBadge"
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, refreshIntervals, type Detection } from "@/lib/api"
import { mockDetections } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function LiveDetections() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "detected_at", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [paused, setPaused] = useState(false)
  const [transcriptSearch, setTranscriptSearch] = useState("")
  const [stationFilter, setStationFilter] = useState("all")
  const [confFilter, setConfFilter] = useState("all")

  const detectionsQ = useQuery({
    queryKey: ["detections", 50],
    queryFn: () => api.getDetections(50),
    refetchInterval: paused ? false : refreshIntervals.harvestDetections,
    retry: 1,
  })

  const isUsingMock = detectionsQ.isError
  const rawData: Detection[] = detectionsQ.data ?? (isUsingMock ? mockDetections : [])

  const stations = useMemo(() => [...new Set(rawData.map((d) => d.station).filter(Boolean))], [rawData])

  const filteredData = useMemo(() => {
    let data = rawData
    if (stationFilter !== "all") data = data.filter((d) => d.station === stationFilter)
    if (confFilter === "high") data = data.filter((d) => (d.confidence ?? 0) >= 0.8)
    if (confFilter === "medium") data = data.filter((d) => (d.confidence ?? 0) >= 0.6 && (d.confidence ?? 0) < 0.8)
    if (confFilter === "low") data = data.filter((d) => (d.confidence ?? 0) < 0.6)
    if (transcriptSearch) {
      const q = transcriptSearch.toLowerCase()
      data = data.filter(
        (d) =>
          d.transcript_snippet?.toLowerCase().includes(q) ||
          d.company_name?.toLowerCase().includes(q) ||
          d.keyword?.toLowerCase().includes(q)
      )
    }
    return data
  }, [rawData, stationFilter, confFilter, transcriptSearch])

  const columns = useMemo<ColumnDef<Detection>[]>(
    () => [
      {
        accessorKey: "detected_at",
        header: "Time",
        cell: ({ getValue }) => {
          const v = getValue() as string | undefined
          return v ? <span className="tabular-nums text-muted-foreground text-[10px]">{format(new Date(v), "HH:mm:ss")}</span> : "—"
        },
      },
      {
        accessorKey: "station",
        header: "Station",
        cell: ({ getValue }) => <span className="font-mono font-bold text-primary">{(getValue() as string) ?? "—"}</span>,
      },
      {
        accessorKey: "company_name",
        header: "Advertiser",
        cell: ({ getValue }) => <span className="font-medium text-foreground">{(getValue() as string) ?? "—"}</span>,
      },
      {
        accessorKey: "keyword",
        header: "Keyword",
        cell: ({ getValue }) => {
          const v = getValue() as string | undefined
          return v ? (
            <span className="rounded bg-primary/10 px-1 py-0.5 text-[10px] text-primary">{v}</span>
          ) : <span className="text-muted-foreground">—</span>
        },
      },
      {
        accessorKey: "confidence",
        header: "Confidence",
        cell: ({ getValue }) => {
          const v = getValue() as number | undefined
          if (v == null) return "—"
          return (
            <span className={cn("font-semibold tabular-nums", v >= 0.8 ? "text-green-400" : v >= 0.6 ? "text-amber-400" : "text-red-400")}>
              {(v * 100).toFixed(0)}%
            </span>
          )
        },
      },
      {
        accessorKey: "is_ad",
        header: "Is Ad",
        cell: ({ getValue }) => {
          const v = getValue() as boolean | undefined
          return v == null ? "—" : v ? (
            <span className="font-semibold text-green-400">Yes</span>
          ) : (
            <span className="text-muted-foreground">No</span>
          )
        },
      },
      {
        accessorKey: "offer_summary",
        header: "Offer",
        cell: ({ getValue }) => {
          const v = getValue() as string | undefined
          return v ? <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">{v}</span> : <span className="text-muted-foreground">—</span>
        },
      },
      {
        accessorKey: "transcript_snippet",
        header: "Transcript",
        cell: ({ getValue }) => {
          const v = getValue() as string | undefined
          return v ? (
            <span className="font-mono text-[10px] text-muted-foreground" title={v}>
              {v.length > 60 ? v.slice(0, 60) + "…" : v}
            </span>
          ) : "—"
        },
      },
      {
        accessorKey: "review_status",
        header: "Review",
        cell: ({ getValue }) => {
          const v = (getValue() as string | undefined) ?? "new"
          return <StatusBadge status={v as "new" | "reviewed" | "approved" | "rejected"} />
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <DashboardLayout
      title="Live Detections"
      subtitle={`${filteredData.length} of ${rawData.length} detections`}
      headerRight={
        <div className="flex items-center gap-2">
          <LiveIndicator active={!paused} label={paused ? "Paused" : "Live"} />
          <RefreshTimer lastUpdated={detectionsQ.dataUpdatedAt || null} intervalMs={refreshIntervals.harvestDetections} isFetching={detectionsQ.isFetching} />
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search transcript..."
          value={transcriptSearch}
          onChange={(e) => setTranscriptSearch(e.target.value)}
          className="h-7 max-w-[200px] text-xs"
        />
        <Select value={stationFilter} onValueChange={setStationFilter}>
          <SelectTrigger className="h-7 w-[130px] text-xs">
            <SelectValue placeholder="Station" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stations</SelectItem>
            {stations.map((s) => (
              <SelectItem key={s} value={s!}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={confFilter} onValueChange={setConfFilter}>
          <SelectTrigger className="h-7 w-[130px] text-xs">
            <SelectValue placeholder="Confidence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confidence</SelectItem>
            <SelectItem value="high">High (80%+)</SelectItem>
            <SelectItem value="medium">Medium (60-80%)</SelectItem>
            <SelectItem value="low">Low (&lt;60%)</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
          {paused ? "Resume" : "Pause"}
        </Button>
        {isUsingMock && <ApiPendingBadge />}
      </div>

      <div className="rounded-md border border-border bg-card">
        {detectionsQ.isLoading && !rawData.length ? (
          <div className="p-3"><LoadingSkeleton rows={10} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border text-[10px] text-muted-foreground">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="cursor-pointer select-none px-3 py-2 text-left font-medium hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-6 text-center text-muted-foreground">No detections found</td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-1.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
