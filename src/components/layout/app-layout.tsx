"use client";

import { usePathname } from "next/navigation";
import { EnhancedSidebar } from "@/components/layout/enhanced-sidebar";
import { Header } from "@/components/layout/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  // Check if current route is an auth route
  const isAuthRoute = pathname?.startsWith("/auth");

  // If it's an auth route, don't show sidebar/header
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Show full dashboard layout for protected routes
  return (
    <div className="flex h-screen bg-background">
      <EnhancedSidebar />
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          collapsed ? "ml-16" : "ml-64",
        )}
      >
        <Header />
        <main className="flex-1 overflow-auto p-6 ">{children}</main>
      </div>
    </div>
  );
}
