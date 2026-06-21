import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface KpiCardProps {
  label: string
  value: string | number | null | undefined
  icon?: LucideIcon
  variant?: "default" | "success" | "warning" | "danger" | "muted"
  suffix?: string
  subtext?: string
  pending?: boolean
  className?: string
}

const variantText: Record<string, string> = {
  default: "text-foreground",
  success: "text-green-400",
  warning: "text-amber-400",
  danger: "text-red-400",
  muted: "text-muted-foreground",
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  suffix,
  subtext,
  pending = false,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-md border border-border bg-card px-3 py-2.5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-1">
        {pending || value === null || value === undefined ? (
          <span className="text-xs font-medium text-muted-foreground italic">API pending</span>
        ) : (
          <>
            <span className={cn("text-xl font-bold tabular-nums", variantText[variant])}>
              {value}
            </span>
            {suffix && (
              <span className="text-xs text-muted-foreground">{suffix}</span>
            )}
          </>
        )}
      </div>
      {subtext && (
        <span className="text-[10px] text-muted-foreground">{subtext}</span>
      )}
    </div>
  )
}
