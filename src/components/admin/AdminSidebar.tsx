import { useState } from "react";
import { 
  LayoutDashboard, 
  Film, 
  FolderOpen,
  Globe,
  Tv,
  Users,
  Settings,
  BarChart3,
  Database,
  Bell,
  LogOut,
  ChevronDown,
  Calendar,
  Tag,
  Clapperboard,
  UserCircle,
  List,
  FileText,
  Trash2,
  Image,
  Search
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  { title: "Bài viết", url: "/admin/posts", icon: FileText },
  { title: "Danh mục BV", url: "/admin/post-categories", icon: FolderOpen },
  { title: "Media", url: "/admin/media", icon: Image },
  { title: "Widgets", url: "/admin/widgets", icon: LayoutDashboard },
];

const movieManagementItems = [
  { title: "Danh sách phim", url: "/admin/movies", icon: List },
  { title: "Danh mục phim", url: "/admin/movie-categories", icon: FolderOpen },
  { title: "Thể loại", url: "/admin/genres", icon: FolderOpen },
  { title: "Quốc gia", url: "/admin/countries", icon: Globe },
  { title: "Năm", url: "/admin/years", icon: Calendar },
];

const tvManagementItems = [
  { title: "Danh sách kênh", url: "/admin/tv-channels", icon: List },
  { title: "Danh mục kênh", url: "/admin/tv-channel-categories", icon: FolderOpen },
];

import { Sparkles } from "lucide-react";

const systemNavItems = [
  { title: "Thống kê", url: "/admin/analytics", icon: BarChart3 },
  { title: "Người dùng", url: "/admin/users", icon: Users },
  { title: "Crawl Phim", url: "/admin/api", icon: Database },
  { title: "Content AI", url: "/admin/content-ai", icon: Sparkles },
  { title: "Thông báo", url: "/admin/notifications", icon: Bell },
  { title: "Thùng rác", url: "/admin/trash", icon: Trash2 },
  { title: "SEO", url: "/admin/seo", icon: Search },
  { title: "Cài đặt Site", url: "/admin/site-settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const isCollapsed = state === "collapsed";
  
  const [movieManagementOpen, setMovieManagementOpen] = useState(
    movieManagementItems.some(item => location.pathname === item.url)
  );
  const [tvManagementOpen, setTvManagementOpen] = useState(
    tvManagementItems.some(item => location.pathname === item.url)
  );

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

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
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 ${isActive ? "bg-primary/10 text-primary" : ""}`
                      }
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

        {/* Movie Management Collapsible */}
        <SidebarGroup className="mt-2">
          <Collapsible open={movieManagementOpen} onOpenChange={setMovieManagementOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Film className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm font-medium">Quản lý phim</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${movieManagementOpen ? "rotate-180" : ""}`} />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent className="pl-4 mt-1">
                <SidebarMenu>
                  {movieManagementItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                      >
                        <NavLink 
                          to={item.url} 
                          end 
                          className={({ isActive }) => 
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 text-sm ${isActive ? "bg-primary/10 text-primary" : ""}`
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* TV Management Collapsible */}
        <SidebarGroup className="mt-2">
          <Collapsible open={tvManagementOpen} onOpenChange={setTvManagementOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Tv className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm font-medium">Quản lý TV</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${tvManagementOpen ? "rotate-180" : ""}`} />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent className="pl-4 mt-1">
                <SidebarMenu>
                  {tvManagementItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                      >
                        <NavLink 
                          to={item.url} 
                          end 
                          className={({ isActive }) => 
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 text-sm ${isActive ? "bg-primary/10 text-primary" : ""}`
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
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
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 ${isActive ? "bg-primary/10 text-primary" : ""}`
                      }
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
              <p className="text-sm font-medium truncate">{user?.email?.split("@")[0] || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={handleSignOut}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
