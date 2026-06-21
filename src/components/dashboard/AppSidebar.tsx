import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Radio,
  Zap,
  Search,
  Building2,
  PlayCircle,
  HeartPulse,
  FileBarChart2,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { LiveIndicator } from "@/components/dashboard/LiveIndicator"
import { BASE_URL } from "@/lib/api"

const navItems = [
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/stations", label: "Live Stations", icon: Radio },
  { to: "/detections", label: "Live Detections", icon: Zap },
  { to: "/keywords", label: "Keyword Intelligence", icon: Search },
  { to: "/advertisers", label: "Advertisers", icon: Building2 },
  { to: "/harvest", label: "Harvest Control", icon: PlayCircle },
  { to: "/health", label: "Pipeline Health", icon: HeartPulse },
  { to: "/reports", label: "Reports / Exports", icon: FileBarChart2 },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border px-3 py-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/20">
            <Radio className="h-4 w-4 text-primary" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-bold tracking-wide text-foreground">
              RadioSense
            </span>
            <LiveIndicator active label="Pipeline" className="mt-0.5" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive =
                  to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                      <NavLink to={to} end={to === "/"}>
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border px-3 py-2">
        <span className="text-[10px] text-muted-foreground truncate" title={BASE_URL}>
          Backend: {BASE_URL.replace(/^https?:\/\//, "")}
        </span>
      </SidebarFooter>
    </Sidebar>
  )
}
