"use client";

import { cn } from "@/lib/utils";

import { Logo, LogoText } from "@/components/layout/logo/logo";

import "./dashboard-sidebar.css";
import { ReactNode } from "react";
import { AuthContextType, useAuth } from "@/context/auth-context";

import type { TUserRoles } from "@/types/user.types";

type TDashboardRoute = {
  icon: ReactNode;
  href: string;
  label: string;
  description?: string;
  roles: TUserRoles[];
  section?: string;
};

type TDashboardSidebarProps = {
  user?: AuthContextType["user"];
};

export function DashboardSidebar({ user }: TDashboardSidebarProps) {
  const DASHBOARD_ROUTES: TDashboardRoute[] = [];

  function Sidebar({ className }: { className?: string }) {
    return (
      <div className={cn("dashboard-sidebar", className)}>
        <div className="logo">
          <Logo />
          <LogoText />
        </div>
        <nav className="menu">
          <ul role="list" className="menu-list">
            {/* {adminMenu.map((item, index) => (
              <li key={index}>
                <Link href={item?.href} className="menu-item">
                  {item?.icon}
                  <span>{item?.label}</span>
                </Link>
              </li>
            ))} */}
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <>
      <Sidebar className={cn("dashboard-layout-sidebar")} />
    </>
  );
}
