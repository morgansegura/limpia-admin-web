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
          <DashboardHeader user={user} />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>

            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
          </div>
          <DashboardFooter />
          {/* <div className="container">
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </main>
          </div> */}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
