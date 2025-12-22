import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
}

export function Layout({ children, hideHeader }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && <Header />}
      <main className="pb-16 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
