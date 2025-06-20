import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { Topbar } from "@/components/layout/topbar/topbar";
import { cn } from "@/lib/utils";

import "./dashboard-layout.css";

export type DahboardLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardLayout({ children, className }: DahboardLayoutProps) {
  return (
    <div className={cn("dashboard-container", className)}>
      <Sidebar />
      <div className="dashboard-content">
        <Topbar />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
