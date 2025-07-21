"use client";

import { useState } from "react";
import { BellIcon, ChevronDownIcon, MenuIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { AuthContextType } from "@/context/auth-context";

type DashboardLayoutHeaderProps = {
  open: boolean;
  setOpen?: () => void;
  user: AuthContextType["user"];
};

export function DashboardLayoutHeader({
  setOpen,
  user,
}: DashboardLayoutHeaderProps) {
  const [menuActive, setMenuActive] = useState<boolean>(false);

  function toggleMenu() {
    setMenuActive(!menuActive);
  }

  return (
    <div className={cn("dashboard-layout-header")}>
      <button
        type="button"
        className="dashboard-layout-header-selector"
        onClick={setOpen}
      >
        <span className="sr-only">Open sidebar</span>
        <MenuIcon className="dashboard-layout-header-selector-icon" />
      </button>
      <div className="dashboard-layout-header-nav">
        <button type="button" className="dashboard-layout-header-nav-button">
          <span className="sr-only">View notifications</span>
          <BellIcon />
        </button>

        {/* <!-- Separator --> */}
        <div className="dashboard-layout-header-divider" aria-hidden="true" />

        {/* <!-- Profile dropdown --> */}
        <div className="dashboard-layout-header-dropdown">
          <button
            className="dashboard-layout-header-dropdown-selector"
            type="button"
            id="user-menu-button"
            aria-expanded="false"
            aria-haspopup="true"
            onClick={toggleMenu}
          >
            <span className="sr-only">Open user menu</span>
            <div className="dashboard-layout-header-dropdown-avatar">
              {user?.avatarUrl || "MS"}
            </div>
            <span className="dashboard-layout-header-dropdown-selector-input">
              <span
                className="dashboard-layout-header-dropdown-selector-name"
                aria-hidden="true"
              >
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDownIcon className="dashboard-layout-header-dropdown-selector-icon" />
            </span>
          </button>

          <div
            className="dashboard-layout-header-dropdown-menu"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabIndex={-1}
            data-dropdown-menu-active={menuActive ? true : false}
          >
            <a
              href="#"
              className="dashboard-layout-header-dropdown-menu-item"
              role="menuitem"
              tabIndex={-1}
              id="user-menu-item-0"
            >
              Your profile
            </a>
            <a
              href="#"
              className="dashboard-layout-header-dropdown-menu-item"
              role="menuitem"
              tabIndex={-1}
              id="user-menu-item-1"
            >
              Sign out
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
