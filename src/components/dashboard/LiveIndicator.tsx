import { cn } from "@/lib/utils"

interface LiveIndicatorProps {
  active?: boolean
  label?: string
  className?: string
}

export function LiveIndicator({ active = true, label, className }: LiveIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative flex h-2 w-2">
        {active && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            active ? "bg-green-400" : "bg-muted-foreground"
          )}
        />
      </span>
      {label && (
        <span className={cn("text-xs font-medium", active ? "text-green-400" : "text-muted-foreground")}>
          {label}
        </span>
      )}
    </span>
  )
}
