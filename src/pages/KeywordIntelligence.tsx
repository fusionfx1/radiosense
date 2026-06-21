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
import { ArrowUpDown, Check, X, Download, Eye } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { ApiPendingBadge } from "@/components/dashboard/ApiPendingBadge"
import { RefreshTimer } from "@/components/dashboard/RefreshTimer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockKeywordCandidates } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type Candidate = typeof mockKeywordCandidates[0]

const sourceLabels: Record<string, string> = {
  live: "Live DB",
  trademark: "Trademark",
  harvest: "Harvest",
  cfpb: "CFPB",
  export: "Export",
}

const riskColors: Record<string, string> = {
  low: "text-green-400",
  medium: "text-amber-400",
  high: "text-red-400",
}

function KeywordTable({ data, globalFilter, onGlobalFilter }: { data: Candidate[]; globalFilter: string; onGlobalFilter: (v: string) => void }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      { accessorKey: "keyword", header: "Keyword", cell: ({ getValue }) => <span className="font-mono font-semibold text-primary">{getValue() as string}</span> },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ getValue }) => {
          const v = getValue() as string
          return <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">{sourceLabels[v] ?? v}</span>
        },
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: ({ getValue }) => {
          const v = getValue() as number
          return <span className={cn("font-semibold tabular-nums", v >= 0.85 ? "text-green-400" : v >= 0.7 ? "text-amber-400" : "text-muted-foreground")}>{(v * 100).toFixed(0)}%</span>
        },
      },
      { accessorKey: "entity", header: "Entity", cell: ({ getValue }) => <span className="text-foreground">{getValue() as string}</span> },
      {
        accessorKey: "trademark_risk",
        header: "TM Risk",
        cell: ({ getValue }) => {
          const v = getValue() as string
          return <span className={cn("font-semibold uppercase text-[10px]", riskColors[v] ?? "text-muted-foreground")}>{v}</span>
        },
      },
      {
        accessorKey: "review_status",
        header: "Review",
        cell: ({ getValue }) => <StatusBadge status={(getValue() as "new" | "reviewed" | "approved" | "rejected")} />,
      },
      {
        accessorKey: "first_seen",
        header: "First Seen",
        cell: ({ getValue }) => {
          const v = getValue() as string
          return <span className="tabular-nums text-[10px] text-muted-foreground">{format(new Date(v), "MM/dd HH:mm")}</span>
        },
      },
      {
        accessorKey: "last_seen",
        header: "Last Seen",
        cell: ({ getValue }) => {
          const v = getValue() as string
          return <span className="tabular-nums text-[10px] text-muted-foreground">{format(new Date(v), "MM/dd HH:mm")}</span>
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-green-400 hover:text-green-300"><Check className="h-3 w-3" /></Button>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-400 hover:text-red-300"><X className="h-3 w-3" /></Button>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground"><Eye className="h-3 w-3" /></Button>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground"><Download className="h-3 w-3" /></Button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: onGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground">No keyword candidates found</td>
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
    </div>
  )
}

export function KeywordIntelligence() {
  const [globalFilter, setGlobalFilter] = useState("")

  const bySource = (source: string) => mockKeywordCandidates.filter((k) => k.source === source)

  return (
    <DashboardLayout
      title="Keyword Intelligence"
      subtitle="Candidates from all sources"
      headerRight={
        <div className="flex items-center gap-2">
          <ApiPendingBadge />
          <span className="text-[10px] text-muted-foreground">Live DB + export data</span>
          <RefreshTimer lastUpdated={null} />
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <Input
          placeholder="Search keywords..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-7 max-w-xs text-xs"
        />
        <ApiPendingBadge />
        <span className="text-[10px] text-muted-foreground">All data is mock — API /api/keyword-candidates pending</span>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="h-7 text-xs">
          <TabsTrigger value="all" className="text-xs px-2 py-1">All ({mockKeywordCandidates.length})</TabsTrigger>
          <TabsTrigger value="live" className="text-xs px-2 py-1">Live DB ({bySource("live").length})</TabsTrigger>
          <TabsTrigger value="trademark" className="text-xs px-2 py-1">Trademark ({bySource("trademark").length})</TabsTrigger>
          <TabsTrigger value="harvest" className="text-xs px-2 py-1">Harvest ({bySource("harvest").length})</TabsTrigger>
          <TabsTrigger value="cfpb" className="text-xs px-2 py-1">CFPB ({bySource("cfpb").length})</TabsTrigger>
          <TabsTrigger value="export" className="text-xs px-2 py-1">Export ({bySource("export").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-3">
          <KeywordTable data={mockKeywordCandidates} globalFilter={globalFilter} onGlobalFilter={setGlobalFilter} />
        </TabsContent>
        {["live", "trademark", "harvest", "cfpb", "export"].map((source) => (
          <TabsContent key={source} value={source} className="mt-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {source === "live" && "Data sourced from live detection DB. May be sparse between harvest runs."}
                {source === "export" && "Data from export files. Richer candidate set than live DB."}
                {source === "trademark" && "Candidates identified via trademark monitoring."}
                {source === "harvest" && "Candidates extracted from harvest run output."}
                {source === "cfpb" && "Candidates flagged by CFPB compliance scan."}
              </span>
              <ApiPendingBadge />
            </div>
            <KeywordTable data={bySource(source)} globalFilter={globalFilter} onGlobalFilter={setGlobalFilter} />
          </TabsContent>
        ))}
      </Tabs>
    </DashboardLayout>
  )
}
