import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown, Globe, ChevronRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { ApiPendingBadge } from "@/components/dashboard/ApiPendingBadge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { mockAdvertisers, mockDetections } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type Advertiser = typeof mockAdvertisers[0]

export function Advertisers() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [selected, setSelected] = useState<Advertiser | null>(null)

  const columns = useMemo<ColumnDef<Advertiser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Advertiser",
        cell: ({ getValue, row }) => (
          <button
            className="flex items-center gap-1 font-semibold text-primary hover:underline"
            onClick={() => setSelected(row.original)}
          >
            {getValue() as string}
            <ChevronRight className="h-3 w-3 opacity-50" />
          </button>
        ),
      },
      {
        accessorKey: "domain",
        header: "Domain",
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <Globe className="h-3 w-3" />
            {getValue() as string}
          </span>
        ),
      },
      { accessorKey: "vertical", header: "Vertical", cell: ({ getValue }) => <span className="text-foreground">{getValue() as string}</span> },
      {
        accessorKey: "stations",
        header: "Stations",
        cell: ({ getValue }) => {
          const v = getValue() as string[]
          return (
            <div className="flex flex-wrap gap-0.5">
              {v.map((s) => (
                <span key={s} className="rounded bg-primary/10 px-1 py-0.5 text-[10px] font-mono font-semibold text-primary">{s}</span>
              ))}
            </div>
          )
        },
      },
      {
        accessorKey: "detection_count",
        header: "Det. Count",
        cell: ({ getValue }) => <span className="font-semibold tabular-nums text-foreground">{(getValue() as number).toLocaleString()}</span>,
      },
      {
        accessorKey: "first_seen",
        header: "First Seen",
        cell: ({ getValue }) => <span className="tabular-nums text-[10px] text-muted-foreground">{format(new Date(getValue() as string), "MM/dd/yy")}</span>,
      },
      {
        accessorKey: "last_seen",
        header: "Last Seen",
        cell: ({ getValue }) => <span className="tabular-nums text-[10px] text-muted-foreground">{format(new Date(getValue() as string), "MM/dd HH:mm")}</span>,
      },
      {
        accessorKey: "confidence",
        header: "Confidence",
        cell: ({ getValue }) => {
          const v = getValue() as string
          return (
            <span className={cn("font-semibold uppercase text-[10px]", v === "high" ? "text-green-400" : v === "medium" ? "text-amber-400" : "text-red-400")}>
              {v}
            </span>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const v = getValue() as string
          const mapped: Record<string, "approved" | "new" | "reviewed"> = { approved: "approved", new: "new", needs_review: "reviewed" }
          return <StatusBadge status={mapped[v] ?? "new"} label={v === "needs_review" ? "review" : v} />
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: mockAdvertisers,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const advertiserDetections = useMemo(
    () => selected ? mockDetections.filter((d) => d.company_name === selected.name) : [],
    [selected]
  )

  return (
    <DashboardLayout
      title="Advertisers"
      subtitle={`${mockAdvertisers.length} advertisers`}
      headerRight={
        <div className="flex items-center gap-2">
          <ApiPendingBadge />
          <span className="text-[10px] text-muted-foreground">API /api/advertisers pending</span>
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <Input
          placeholder="Search advertisers..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-7 max-w-xs text-xs"
        />
        <ApiPendingBadge />
      </div>

      <div className="rounded-md border border-border bg-card">
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
                        {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3 opacity-30" />}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => setSelected(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-1.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-[480px] overflow-y-auto bg-card p-0">
          {selected && (
            <>
              <SheetHeader className="border-b border-border px-4 py-3">
                <SheetTitle className="text-sm font-bold text-foreground">{selected.name}</SheetTitle>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="font-mono text-[10px] text-muted-foreground">{selected.domain}</span>
                  <span className="text-[10px] text-muted-foreground">{selected.vertical}</span>
                  <StatusBadge status={selected.status === "approved" ? "approved" : selected.status === "new" ? "new" : "reviewed"} label={selected.status === "needs_review" ? "review" : selected.status} />
                </div>
              </SheetHeader>
              <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded border border-border bg-background p-2">
                    <div className="text-[10px] text-muted-foreground">Detections</div>
                    <div className="text-lg font-bold text-foreground">{selected.detection_count}</div>
                  </div>
                  <div className="rounded border border-border bg-background p-2">
                    <div className="text-[10px] text-muted-foreground">Stations</div>
                    <div className="text-lg font-bold text-foreground">{selected.stations.length}</div>
                  </div>
                  <div className="rounded border border-border bg-background p-2">
                    <div className="text-[10px] text-muted-foreground">Confidence</div>
                    <div className={cn("text-lg font-bold", selected.confidence === "high" ? "text-green-400" : selected.confidence === "medium" ? "text-amber-400" : "text-red-400")}>{selected.confidence}</div>
                  </div>
                </div>

                {/* Station spread */}
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Station Spread</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.stations.map((s) => (
                      <span key={s} className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Detection history */}
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">
                    Recent Detections ({advertiserDetections.length})
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {advertiserDetections.slice(0, 10).map((d) => (
                      <div key={d.id} className="rounded border border-border/50 bg-background px-2 py-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-semibold text-primary">{d.station}</span>
                          <span className="tabular-nums text-[10px] text-muted-foreground">
                            {d.detected_at ? format(new Date(d.detected_at), "MM/dd HH:mm") : "—"}
                          </span>
                        </div>
                        {d.transcript_snippet && (
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground line-clamp-2">{d.transcript_snippet}</p>
                        )}
                      </div>
                    ))}
                    {advertiserDetections.length === 0 && (
                      <p className="text-[10px] text-muted-foreground">No detection history available</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
