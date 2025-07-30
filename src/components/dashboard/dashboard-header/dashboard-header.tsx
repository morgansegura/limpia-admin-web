"use client";

import { MdNotificationsNone } from "react-icons/md";

import { cn } from "@/lib/utils";
import { AuthContextType } from "@/context/auth-context";

import { SidebarTrigger } from "@/components/ui/sidebar";

import { HeaderDropdown } from "./header-dropdown/header-dropdown";

import "./dashboard-header.css";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type DashboardLayoutHeaderProps = {
  user: AuthContextType["user"];
};

export function DashboardHeader({ user }: DashboardLayoutHeaderProps) {
  return (
    //   <div className={cn("dashboard-header")}>
    //     <SidebarTrigger />
    //     <div className="nav">
    //       <button type="button" className="nav-button">
    //         <span className="sr-only">View notifications</span>
    //         <MdNotificationsNone />
    //       </button>

    //       {/* <!-- Separator --> */}
    //       <div className="divider" aria-hidden="true" />

    //       {/* <!-- Profile dropdown --> */}
    //       <HeaderDropdown user={user} />
    //     </div>
    //   </div>
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
