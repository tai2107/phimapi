import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { Advertisement } from "./Advertisement";

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  page?: string;
}

export function Layout({ children, hideHeader, hideFooter, page = "all" }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideHeader && <Header />}
      
      {/* Header Banner Ad */}
      <Advertisement position="header" page={page} />
      
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      
      {/* Footer Banner Ad */}
      <Advertisement position="footer" page={page} />
      
      {!hideFooter && <Footer />}
      <BottomNav />
    </div>
  );
}
