"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

import { DashboardLayoutHeader } from "./dashboard-layout-header/dashboard-layout-header";
import { DashboardLayoutSidebar } from "./dashboard-layout-sidebar/dashboard-layout-sidebar";

import "./dashboard-layout.css";

export type DashboardLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState<Boolean>(false);

  function toggleSidebar() {
    setOpen(!open);
  }

  return (
    <div
      className={cn(
        "dashboard-layout-wrapper",
        className,
        open
          ? "dashboard-layout-sidebar-active"
          : "dashboard-layout-sidebar-inactive",
      )}
    >
      <DashboardLayoutSidebar />
      <div className="dashboard-layout-container">
        <DashboardLayoutHeader
          open={open}
          setOpen={toggleSidebar}
          user={user}
        />
        <main className="dashboard-layout-main">{children}</main>
        <footer className="dashboard-layout-footer">Test content</footer>
      </div>
    </div>
  );
}
