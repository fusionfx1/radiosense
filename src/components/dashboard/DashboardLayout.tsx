import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"

interface DashboardLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  headerRight?: React.ReactNode
}

export function DashboardLayout({ title, subtitle, children, headerRight }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
          <SidebarTrigger className="h-6 w-6 text-muted-foreground" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
          {headerRight && (
            <div className="flex shrink-0 items-center gap-2">{headerRight}</div>
          )}
        </header>
        <main className="flex-1 overflow-auto p-3">
          {children}
        </main>
      </SidebarInset>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}
