import { cn } from "@/lib/utils"

interface QueueHealthBarProps {
  pending: number
  processing: number
  done: number
  dropped: number
  className?: string
}

export function QueueHealthBar({ pending, processing, done, dropped, className }: QueueHealthBarProps) {
  const total = pending + processing + done + dropped
  if (total === 0) return null

  const pPending = (pending / total) * 100
  const pProcessing = (processing / total) * 100
  const pDone = (done / total) * 100
  const pDropped = (dropped / total) * 100

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full bg-amber-500 transition-all"
          style={{ width: `${pPending}%` }}
          title={`Pending: ${pending}`}
        />
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${pProcessing}%` }}
          title={`Processing: ${processing}`}
        />
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${pDone}%` }}
          title={`Done: ${done}`}
        />
        <div
          className="h-full bg-red-500/70 transition-all"
          style={{ width: `${pDropped}%` }}
          title={`Dropped: ${dropped}`}
        />
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Pending {pending.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Processing {processing.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Done {done.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500/70" />
          Dropped {dropped.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
