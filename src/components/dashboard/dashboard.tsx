"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { DashboardFooter } from "./dashboard-footer/dashboard-footer";
import { DashboardHeader } from "./dashboard-header/dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar/dashboard-sidebar";

import "./dashboard.css";

export type DashboardLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className={cn("dashboard-layout", className)}>
        <DashboardSidebar user={user} />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <main className="min-h-screen flex-1 rounded-xl md:min-h-min">
              {children}
            </main>
          </div>
          <DashboardFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
