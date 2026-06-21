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
import { ArrowUpDown, Download, Eye, Upload, CheckSquare, FileText, FileJson, FileSpreadsheet } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { ApiPendingBadge } from "@/components/dashboard/ApiPendingBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockReportFiles } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type ReportFile = typeof mockReportFiles[0]

const typeIcons: Record<string, React.ElementType> = {
  CSV: FileSpreadsheet,
  JSONL: FileJson,
  MD: FileText,
  JSON: FileJson,
}

const typeColors: Record<string, string> = {
  CSV: "text-green-400",
  JSONL: "text-blue-400",
  MD: "text-amber-400",
  JSON: "text-purple-400",
}

export function ReportsExports() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "last_modified", desc: true }])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = useMemo<ColumnDef<ReportFile>[]>(
    () => [
      {
        accessorKey: "filename",
        header: "Filename",
        cell: ({ getValue }) => {
          const v = getValue() as string
          const ext = v.split(".").pop()?.toUpperCase() ?? ""
          const Icon = typeIcons[ext] ?? FileText
          return (
            <span className="flex items-center gap-1.5">
              <Icon className={cn("h-3.5 w-3.5 shrink-0", typeColors[ext] ?? "text-muted-foreground")} />
              <span className="font-mono text-xs font-medium text-foreground">{v}</span>
            </span>
          )
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => {
          const v = getValue() as string
          return (
            <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", {
              "border-green-500/30 bg-green-500/10 text-green-400": v === "CSV",
              "border-blue-500/30 bg-blue-500/10 text-blue-400": v === "JSONL",
              "border-amber-500/30 bg-amber-500/10 text-amber-400": v === "MD",
              "border-purple-500/30 bg-purple-500/10 text-purple-400": v === "JSON",
            })}>
              {v}
            </span>
          )
        },
      },
      {
        accessorKey: "rows",
        header: "Rows",
        cell: ({ getValue }) => {
          const v = getValue() as number | null
          return v != null ? (
            <span className="tabular-nums text-muted-foreground">{v.toLocaleString()}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        },
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        accessorKey: "last_modified",
        header: "Last Modified",
        cell: ({ getValue }) => {
          const v = getValue() as string
          return (
            <span className="tabular-nums text-[10px] text-muted-foreground">
              {format(new Date(v), "MM/dd HH:mm")}
            </span>
          )
        },
      },
      {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ getValue }) => (
          <span className="text-[10px] text-muted-foreground max-w-[280px] block truncate" title={getValue() as string}>
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[10px] text-muted-foreground"
              onClick={() => toast.info("Preview: API /api/exports pending")}
              title="Preview"
            >
              <Eye className="h-3 w-3" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[10px] text-muted-foreground"
              onClick={() => toast.info("Download: API /api/exports pending")}
              title="Download"
            >
              <Download className="h-3 w-3" />
              DL
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[10px] text-muted-foreground"
              onClick={() => toast.info("Import: API /api/exports pending")}
              title="Import"
            >
              <Upload className="h-3 w-3" />
              Import
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[10px] text-green-400/70 hover:text-green-400"
              onClick={() => toast.success(`Marked ${row.original.filename} as reviewed`)}
              title="Mark reviewed"
            >
              <CheckSquare className="h-3 w-3" />
              Done
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: mockReportFiles,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const csvCount = mockReportFiles.filter((f) => f.type === "CSV").length
  const jsonlCount = mockReportFiles.filter((f) => f.type === "JSONL").length
  const mdCount = mockReportFiles.filter((f) => f.type === "MD").length

  return (
    <DashboardLayout
      title="Reports / Exports"
      subtitle={`${mockReportFiles.length} files`}
      headerRight={
        <div className="flex items-center gap-2">
          <ApiPendingBadge />
          <span className="text-[10px] text-muted-foreground">API /api/exports pending</span>
        </div>
      }
    >
      {/* Summary */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded border border-border bg-card px-2.5 py-1.5">
          <FileSpreadsheet className="h-3.5 w-3.5 text-green-400" />
          <span className="text-xs font-semibold text-foreground">{csvCount}</span>
          <span className="text-[10px] text-muted-foreground">CSV</span>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-border bg-card px-2.5 py-1.5">
          <FileJson className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-foreground">{jsonlCount}</span>
          <span className="text-[10px] text-muted-foreground">JSONL</span>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-border bg-card px-2.5 py-1.5">
          <FileText className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-foreground">{mdCount}</span>
          <span className="text-[10px] text-muted-foreground">Markdown</span>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Input
          placeholder="Search files..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-7 max-w-xs text-xs"
        />
        <ApiPendingBadge />
        <span className="text-[10px] text-muted-foreground">
          Actions disabled until API /api/exports is available
        </span>
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
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
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
                    No files found
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
      </div>
    </DashboardLayout>
  )
}
