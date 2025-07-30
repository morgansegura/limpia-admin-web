import { useAuth } from "@/context/auth-context";
import { DASHBOARD_ROUTES } from "@/lib/utils/dashboard-routes";

import type { TUserRoles } from "@/types/user.types";
import { TDashboardMenus } from "@/lib/utils/dashboard-routes";

export function useDashboardMenu(): TDashboardMenus {
  const { user } = useAuth();
  const role = user?.role;

  if (!role)
    return {
      navMain: [],
      navSecondary: [],
      navProjects: [],
    };

  const filterByRole = <T extends { roles?: TUserRoles[] }>(items: T[]): T[] =>
    items.filter((item) => !item.roles || item.roles.includes(role));

  return {
    navMain: filterByRole(
      DASHBOARD_ROUTES.navMain.map((section) => ({
        ...section,
        items: section.items ? filterByRole(section.items) : [],
      })),
    ),
    navSecondary: DASHBOARD_ROUTES.navSecondary
      ? filterByRole(DASHBOARD_ROUTES.navSecondary)
      : [],
    navProjects: DASHBOARD_ROUTES.navProjects ?? [],
  };
}
