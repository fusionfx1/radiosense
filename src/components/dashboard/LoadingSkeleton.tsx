import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function LoadingSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full rounded" />
      ))}
    </div>
  )
}

export function KpiSkeletons({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-md" />
      ))}
    </>
  )
}
