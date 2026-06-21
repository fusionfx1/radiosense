import { AlertTriangle, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  message?: string
  className?: string
}

export function EmptyState({ message = "No data available", className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground", className)}>
      <WifiOff className="h-6 w-6 opacity-40" />
      <span className="text-xs">{message}</span>
    </div>
  )
}

interface ErrorStateProps {
  error?: string
  className?: string
}

export function ErrorState({ error, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-8 text-red-400", className)}>
      <AlertTriangle className="h-6 w-6" />
      <span className="text-xs">{error ?? "Failed to load data"}</span>
    </div>
  )
}
