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
} from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { RefreshTimer } from "@/components/dashboard/RefreshTimer"
import { ApiPendingBadge } from "@/components/dashboard/ApiPendingBadge"
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api, refreshIntervals, type Station } from "@/lib/api"
import { mockStations } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function truncateUrl(url: string, maxLen = 40) {
  if (!url) return ""
  try {
    const u = new URL(url)
    const short = u.hostname + u.pathname
    return short.length > maxLen ? short.slice(0, maxLen) + "…" : short
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen) + "…" : url
  }
}

export function LiveStations() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const stationsQ = useQuery({
    queryKey: ["stations"],
    queryFn: api.getStations,
    refetchInterval: refreshIntervals.stations,
    retry: 1,
  })

  const isUsingMock = stationsQ.isError || (!stationsQ.data && !stationsQ.isLoading)
  const rawStations: Station[] = stationsQ.data ?? (isUsingMock ? mockStations : [])

  const columns = useMemo<ColumnDef<Station>[]>(
    () => [
      { accessorKey: "name", header: "Station", cell: ({ getValue }) => <span className="font-mono font-bold text-primary">{getValue() as string}</span> },
      { accessorKey: "display_name", header: "Display Name", cell: ({ getValue }) => <span className="text-foreground">{(getValue() as string) ?? <ApiPendingBadge />}</span> },
      {
        accessorKey: "enabled",
        header: "Enabled",
        cell: ({ getValue }) => (
          <span className={cn("font-medium", getValue() ? "text-green-400" : "text-muted-foreground")}>
            {getValue() ? "Yes" : "No"}
          </span>
        ),
      },
      {
        accessorKey: "stream_url",
        header: "Stream URL",
        cell: ({ getValue }) => {
          const url = getValue() as string | undefined
          return url ? (
            <span className="font-mono text-[10px] text-muted-foreground" title={url}>
              {truncateUrl(url)}
            </span>
          ) : <ApiPendingBadge />
        },
      },
      { accessorKey: "format", header: "Format", cell: ({ getValue }) => (getValue() as string) ?? <ApiPendingBadge /> },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status ?? (row.original.enabled ? "live" : "disabled")
          return <StatusBadge status={s as "live" | "stale" | "down" | "disabled"} dot />
        },
      },
      {
        accessorKey: "last_checked",
        header: "Last Checked",
        cell: ({ getValue }) => {
          const v = getValue() as string | undefined
          return v ? (
            <span className="tabular-nums text-muted-foreground text-[10px]">
              {formatDistanceToNow(new Date(v), { addSuffix: true })}
            </span>
          ) : <ApiPendingBadge />
        },
      },
      {
        accessorKey: "chunk_age_seconds",
        header: "Chunk Age",
        cell: ({ getValue }) => {
          const v = getValue() as number | undefined
          if (v == null) return <ApiPendingBadge />
          return (
            <span className={cn("tabular-nums font-medium text-[10px]", v > 60 ? "text-amber-400" : "text-green-400")}>
              {v}s
            </span>
          )
        },
      },
      {
        accessorKey: "detections_24h",
        header: "Det. 24h",
        cell: ({ getValue }) => {
          const v = getValue() as number | undefined
          return v != null ? (
            <span className="tabular-nums font-semibold text-foreground">{v}</span>
          ) : <ApiPendingBadge />
        },
      },
      {
        accessorKey: "last_error",
        header: "Last Error",
        cell: ({ getValue }) => {
          const v = getValue() as string | null
          return v ? <span className="text-red-400 text-[10px]">{v}</span> : <span className="text-muted-foreground">—</span>
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" asChild>
            <a href={row.original.stream_url ?? "#"} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Inspect
            </a>
          </Button>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: rawStations,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <DashboardLayout
      title="Live Stations"
      subtitle={`${rawStations.length} stations`}
      headerRight={
        <RefreshTimer lastUpdated={stationsQ.dataUpdatedAt || null} intervalMs={refreshIntervals.stations} isFetching={stationsQ.isFetching} />
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <Input
          placeholder="Filter stations..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-7 max-w-xs text-xs"
        />
        {isUsingMock && <ApiPendingBadge />}
        {isUsingMock && <span className="text-[10px] text-muted-foreground">Showing mock data</span>}
      </div>

      <div className="rounded-md border border-border bg-card">
        {stationsQ.isLoading && !rawStations.length ? (
          <div className="p-3"><LoadingSkeleton rows={8} /></div>
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
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-6 text-center text-muted-foreground">
                      No stations found
                    </td>
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
