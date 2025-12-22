import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X, Film, Home, Tv, Clapperboard, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const navItems = [
  { label: "Trang chủ", href: "/", icon: Home },
  { label: "Phim Bộ", href: "/danh-sach/phim-bo", icon: Tv },
  { label: "Phim Lẻ", href: "/danh-sach/phim-le", icon: Clapperboard },
  { label: "Hoạt Hình", href: "/danh-sach/hoat-hinh", icon: Sparkles },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 safe-top ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/95 backdrop-blur-md shadow-md"
            : "bg-gradient-to-b from-background/80 to-transparent"
        }`}
      >
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Film className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              <span className="text-gradient-primary">KK</span>Phim
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-muted/50 pl-9 text-sm placeholder:text-muted-foreground focus:bg-muted"
              />
            </div>
          </form>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="border-t border-border bg-background p-4 md:hidden animate-fade-in">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm phim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/50 pl-9 text-sm placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="border-t border-border bg-background p-4 md:hidden animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14 sm:h-16" />
    </>
  );
}
