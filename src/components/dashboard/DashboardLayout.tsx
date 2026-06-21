import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Search, Bell, RefreshCw, UserCircle } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  title: string
  subtitle?: string | null
  children: React.ReactNode
  headerRight?: React.ReactNode | null
}

function UtcClock() {
  const [time, setTime] = useState(() => format(new Date(), "HH:mm:ss") + " UTC")
  useEffect(() => {
    const id = setInterval(() => setTime(format(new Date(), "HH:mm:ss") + " UTC"), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono text-xs text-foreground">{time}</span>
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-6 w-6 text-muted-foreground" />
            <Separator orientation="vertical" className="h-4" />
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <div className="hidden h-4 w-px bg-border md:block" />
            {/* Pipeline badge */}
            <div className="hidden items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Pipeline: ACTIVE
              </span>
            </div>
            <span className="hidden text-xs text-muted-foreground md:inline">
              Last Update: <UtcClock />
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 lg:flex">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search node..."
                className={cn(
                  "w-40 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50",
                  "border-none outline-none focus:ring-0"
                )}
              />
            </div>
            <button className="rounded p-1.5 text-muted-foreground transition-colors hover:text-primary">
              <Bell className="h-4 w-4" />
            </button>
            <button
              className="rounded p-1.5 text-muted-foreground transition-colors hover:text-primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button className="rounded p-1.5 text-muted-foreground transition-colors hover:text-primary">
              <UserCircle className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content canvas */}
        <main className="grid-dots flex-1 overflow-auto p-5">
          {children}
        </main>
      </SidebarInset>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}
