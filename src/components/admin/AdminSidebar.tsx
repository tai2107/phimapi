import { 
  LayoutDashboard, 
  Film, 
  FolderOpen,
  Globe,
  Users,
  Settings,
  BarChart3,
  Database,
  Bell,
  LogOut,
  ChevronDown
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mainNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Quản lý phim", url: "/admin/movies", icon: Film },
  { title: "Thể loại", url: "/admin/categories", icon: FolderOpen },
  { title: "Quốc gia", url: "/admin/countries", icon: Globe },
];

const systemNavItems = [
  { title: "Thống kê", url: "/admin/analytics", icon: BarChart3 },
  { title: "Người dùng", url: "/admin/users", icon: Users },
  { title: "API & Crawl", url: "/admin/api", icon: Database },
  { title: "Thông báo", url: "/admin/notifications", icon: Bell },
  { title: "Cài đặt", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-border/50" collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Film className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg">PhimAdmin</h2>
              <p className="text-xs text-muted-foreground">Quản lý nội dung</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
            Menu chính
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
            Hệ thống
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@phim.app</p>
            </div>
          )}
          {!isCollapsed && (
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
