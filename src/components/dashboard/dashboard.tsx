"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

import { DashboardHeader } from "./dashboard-header/dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar/dashboard-sidebar";

import "./dashboard.css";
import { DashboardFooter } from "./dashboard-footer/dashboard-footer";

export type DashboardLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);

  function toggleSidebar() {
    setOpen(!open);
  }

  return (
    <div
      className={cn(
        "dashboard-layout",
        className,
        open ? "dashboard-sidebar-active" : "dashboard-sidebar-inactive",
      )}
    >
      <DashboardSidebar />

      <div className="container">
        <DashboardHeader open={open} setOpen={toggleSidebar} user={user} />

        <main className="main">{children}</main>

        <DashboardFooter />
      </div>
    </div>
  );
}
