import { cn } from "@/lib/utils"

type StatusVariant = "live" | "stale" | "down" | "disabled" | "new" | "reviewed" | "approved" | "rejected" | "running" | "stopped" | "warning" | "ok" | "error" | "pending"

const variantClasses: Record<StatusVariant, string> = {
  live: "bg-green-500/15 text-green-400 border-green-500/30",
  stale: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  down: "bg-red-500/15 text-red-400 border-red-500/30",
  disabled: "bg-muted/50 text-muted-foreground border-border",
  new: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  reviewed: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  running: "bg-green-500/15 text-green-400 border-green-500/30",
  stopped: "bg-muted/50 text-muted-foreground border-border",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ok: "bg-green-500/15 text-green-400 border-green-500/30",
  error: "bg-red-500/15 text-red-400 border-red-500/30",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
}

interface StatusBadgeProps {
  status: StatusVariant
  label?: string
  className?: string
  dot?: boolean
}

export function StatusBadge({ status, label, className, dot = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variantClasses[status],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-green-400": ["live", "approved", "running", "ok"].includes(status),
          "bg-amber-400": ["stale", "warning", "pending"].includes(status),
          "bg-red-400": ["down", "rejected", "error"].includes(status),
          "bg-blue-400": status === "new",
          "bg-purple-400": status === "reviewed",
          "bg-muted-foreground": ["disabled", "stopped"].includes(status),
        })} />
      )}
      {label ?? status}
    </span>
  )
}
