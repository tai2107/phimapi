import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { Advertisement, SocialBar, usePopupAds } from "./Advertisement";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  page?: string;
}

// Map route to page type
const getPageType = (pathname: string): string => {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/phim/") || pathname.startsWith("/movie/")) return "movie";
  if (pathname.startsWith("/tv") || pathname.startsWith("/kenh-tv")) return "tv";
  if (pathname.startsWith("/tim-kiem") || pathname.startsWith("/search")) return "search";
  return "all";
};

export function Layout({ children, hideHeader, hideFooter, page }: LayoutProps) {
  const location = useLocation();
  const currentPage = page || getPageType(location.pathname);
  
  // Initialize popup ads for current page
  usePopupAds(currentPage);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideHeader && <Header />}
      
      {/* Header Banner Ad - with higher z-index to appear above hero */}
      <div className="relative z-[60] bg-background">
        <Advertisement position="header" page={currentPage} className="py-2" />
      </div>
      
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      
      {/* Footer Banner Ad */}
      <div className="relative z-10 bg-background">
        <Advertisement position="footer" page={currentPage} className="py-2" />
      </div>
      
      {!hideFooter && <Footer />}
      <BottomNav />
      
      {/* Social Bar - fixed at bottom */}
      <SocialBar page={currentPage} />
    </div>
  );
}
