import { cn } from "@/lib/utils"

export function ApiPendingBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400",
        className
      )}
    >
      API pending
    </span>
  )
}
