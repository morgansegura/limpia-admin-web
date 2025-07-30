"use client";

import { MdNotificationsNone } from "react-icons/md";

import { cn } from "@/lib/utils";
import { AuthContextType } from "@/context/auth-context";

import "./dashboard-header.css";
import { HeaderDropdown } from "./header-dropdown/header-dropdown";

type DashboardLayoutHeaderProps = {
  open: boolean;
  setOpen?: () => void;
  user: AuthContextType["user"];
};

export function DashboardHeader({ setOpen, user }: DashboardLayoutHeaderProps) {
  return (
    <div className={cn("dashboard-header")}>
      <div className="nav">
        <button type="button" className="nav-button">
          <span className="sr-only">View notifications</span>
          <MdNotificationsNone />
        </button>

        {/* <!-- Separator --> */}
        <div className="divider" aria-hidden="true" />

        {/* <!-- Profile dropdown --> */}
        <HeaderDropdown user={user} />
      </div>
    </div>
  );
}
