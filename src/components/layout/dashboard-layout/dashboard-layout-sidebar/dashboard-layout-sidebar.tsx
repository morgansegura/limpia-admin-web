import {
  BriefcaseBusinessIcon,
  HomeIcon,
  NotebookTabsIcon,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Logo } from "@/components/layout/logo/logo";

export function DashboardLayoutSidebar() {
  const menu = [
    {
      icon: <HomeIcon />,
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      icon: <NotebookTabsIcon />,
      href: "/customers",
      label: "Customers",
    },
    {
      icon: <BriefcaseBusinessIcon />,
      href: "/jobs",
      label: "Jobs",
    },
    {
      icon: <BriefcaseBusinessIcon />,
      href: "/toolts",
      label: "Jobs",
    },
  ];

  function Sidebar({ className }: { className?: string }) {
    return (
      <div className={cn("dashboard-layout-sidebar", className)}>
        <div className="dashboard-layout-sidebar-logo">
          <Logo />
        </div>
        <nav className="dashboard-layout-sidebar-nav">
          <ul role="list" className="dashboard-layout-sidebar-list">
            {menu.map((item, index) => (
              <li key={index}>
                <div className="-mx-2 space-y-1">
                  <Link
                    href={item?.href}
                    className="dashboard-layout-sidebar-list-item"
                  >
                    {item?.icon}
                    <span>{item?.label}</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <>
      <Sidebar className={cn("dashboard-layout-sidebar")} />
      {/* <div
          className={cn(
            "dashboard-layout-backdrop",
            open
              ? "dashboard-layout-backdrop-active"
              : "dashboard-layout-backdrop-inactive",
          )}
          aria-hidden={open ? "false" : "true"}
          onClick={() => setOpen(false)}
        /> */}
    </>
  );
}
