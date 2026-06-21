import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Radio,
  Zap,
  Search,
  Building2,
  Settings2,
  HeartPulse,
  FileBarChart2,
  Settings,
  HelpCircle,
  UserCircle,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { BASE_URL } from "@/lib/api"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/stations", label: "Live Stations", icon: Radio },
  { to: "/detections", label: "Live Detections", icon: Zap },
  { to: "/keywords", label: "Keyword Intelligence", icon: Search },
  { to: "/advertisers", label: "Advertisers", icon: Building2 },
  { to: "/harvest", label: "Harvest Control", icon: Settings2 },
  { to: "/health", label: "Pipeline Health", icon: HeartPulse },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
]

const bottomItems = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/support", label: "Support", icon: HelpCircle },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Brand header */}
      <SidebarHeader className="border-b border-sidebar-border px-5 py-6">
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span className="truncate text-base font-bold leading-none text-sidebar-primary">
            AdSensing AI
          </span>
          <span className="truncate text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
            Pipeline Node v2.4
          </span>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-2 pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className={cn(
                        "gap-3 rounded-sm px-3 py-2 text-sm font-normal text-sidebar-foreground/70",
                        "hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        isActive && "border-l-2 border-sidebar-primary bg-sidebar-accent/30 font-medium text-sidebar-primary"
                      )}
                    >
                      <NavLink to={to} end={to === "/"}>
                        <Icon className="h-4 w-4 shrink-0" />
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

      {/* Bottom nav */}
      <div className="border-t border-sidebar-border px-2 py-2">
        {bottomItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* User footer */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
            <UserCircle className="h-4 w-4 text-sidebar-primary" />
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden">
            <span className="truncate text-xs font-semibold text-sidebar-foreground">
              System Operator
            </span>
            <span className="truncate text-[10px] text-sidebar-foreground/50">
              {BASE_URL ? BASE_URL.replace(/^https?:\/\//, "") : "Admin Level 4"}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
