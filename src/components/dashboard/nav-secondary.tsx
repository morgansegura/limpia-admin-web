import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { TDashboardRoute } from "@/lib/utils/dashboard-routes";

type TNavSecondaryProps = {
  items?: TDashboardRoute[];
};

export function NavSecondary({
  items,
  ...props
}: TNavSecondaryProps & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items?.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <a href={item.url}>
                  {!!item?.icon ? item.icon : null}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
