"use client";

import Link from "next/link";

import { MdHouse } from "react-icons/md";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useDashboardMenu } from "@/hooks/use-dashboard-menu";
import type { AuthContextType } from "@/context/auth-context";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavProjects } from "@/components/dashboard/nav-projects";

import "./dashboard-sidebar.css";

type TDashboardSidebarProps = {
  user: AuthContextType["user"];
};

export function DashboardSidebar({ user }: TDashboardSidebarProps) {
  const { navMain, navSecondary, navProjects } = useDashboardMenu();

  return (
    <Sidebar collapsible="icon" className="dashboard-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-7 items-center justify-center rounded-full">
                  {/* <Command className="size-4" /> */}
                  <MdHouse className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.organization.name}
                  </span>
                  <span className="truncate text-xs">{user?.region}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={navProjects} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
