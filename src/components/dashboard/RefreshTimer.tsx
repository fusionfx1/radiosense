import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface RefreshTimerProps {
  /** Epoch milliseconds (query.dataUpdatedAt) or a Date object */
  lastUpdated: Date | number | null
  intervalMs?: number
  isFetching?: boolean
  className?: string
}

export function RefreshTimer({ lastUpdated, intervalMs, isFetching, className }: RefreshTimerProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000)
    return () => clearInterval(id)
  }, [])

  const date =
    lastUpdated === null
      ? null
      : lastUpdated instanceof Date
      ? lastUpdated
      : lastUpdated > 0
      ? new Date(lastUpdated)
      : null

  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] text-muted-foreground", className)}>
      <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
      {date ? (
        <span>Updated {formatDistanceToNow(date, { addSuffix: true })}</span>
      ) : (
        <span>Waiting for data</span>
      )}
      {intervalMs && <span>· every {intervalMs / 1000}s</span>}
    </span>
  )
}
