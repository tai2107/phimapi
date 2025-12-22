import { Link, useLocation } from "react-router-dom";
import { Home, Search, Tv, Clapperboard, Sparkles } from "lucide-react";

const navItems = [
  { label: "Trang chủ", href: "/", icon: Home },
  { label: "Phim Bộ", href: "/danh-sach/phim-bo", icon: Tv },
  { label: "Tìm kiếm", href: "/tim-kiem", icon: Search },
  { label: "Phim Lẻ", href: "/danh-sach/phim-le", icon: Clapperboard },
  { label: "Hoạt Hình", href: "/danh-sach/hoat-hinh", icon: Sparkles },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden safe-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
