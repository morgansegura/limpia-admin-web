"use client";

import Link from "next/link";

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
import { Separator } from "@/components/ui/separator";
import { LucideHouse } from "lucide-react";

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
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm">
                  {/* <Command className="size-4" /> */}
                  <LucideHouse />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.organization.name}
                  </span>
                  <span className="truncate text-xs">{user?.role}</span>
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
      <Separator />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
