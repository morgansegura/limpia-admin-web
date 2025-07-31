import { ReactNode } from "react";

import {
  Briefcase,
  ClipboardList,
  Calendar,
  Settings2,
  LifeBuoy,
  Send,
} from "lucide-react";

import { TUserRoles } from "@/types/user.types";

export type TDashboardRoute = {
  icon?: ReactNode;
  url: string;
  title?: string;
  name?: string;
  description?: string;
  roles?: TUserRoles[];
  section?: string;
  isActive?: boolean;
  items?: TDashboardRoute[];
};

export type TDashboardMenus = {
  navMain: TDashboardRoute[];
  navSecondary: TDashboardRoute[];
  navProjects: TDashboardRoute[];
};

export const DASHBOARD_ROUTES: TDashboardMenus = {
  navMain: [
    {
      title: "CRM",
      url: "#",
      icon: <Briefcase />,
      roles: ["SUPER_ADMIN", "SALES_AGENT", "SUPPORT_AGENT"],
      items: [
        {
          title: "Leads",
          url: "/leads",
          roles: ["SALES_AGENT", "SUPER_ADMIN"],
        },
        { title: "Customers", url: "/customers" },
        {
          title: "Estimates",
          url: "/estimates",
          roles: ["SALES_AGENT", "SUPER_ADMIN"],
        },
      ],
    },
    {
      title: "Jobs",
      url: "#",
      icon: <ClipboardList />,
      roles: ["SUPER_ADMIN", "TEAM_MANAGER", "FIELD_WORKER", "TRAINER"],
      items: [
        { title: "All Jobs", url: "/jobs" },
        {
          title: "Schedule",
          url: "/schedule",
          roles: ["TEAM_MANAGER", "SUPER_ADMIN"],
        },
        { title: "Checklists", url: "/checklists" },
      ],
    },
    {
      title: "My Work",
      url: "#",
      icon: <Calendar />,
      roles: ["FIELD_WORKER", "TEAM_MANAGER", "SUPER_ADMIN"],
      items: [
        { title: "My Jobs", url: "/my-jobs" },
        { title: "Clock In/Out", url: "/clock" },
        { title: "Hours Worked", url: "/hours" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <Settings2 />,
      roles: ["SUPER_ADMIN"],
      items: [
        { title: "Organization", url: "/settings/organization" },
        { title: "Users", url: "/users" },
        { title: "Cleaning Types", url: "/settings/cleaning-types" },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: <LifeBuoy />,
      roles: ["SUPPORT_AGENT", "SUPER_ADMIN"],
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: <Send />,
      roles: ["TRAINER", "TEAM_MANAGER", "SUPER_ADMIN"],
    },
  ],
  navProjects: [
    // {
    //   name: "Design Engineering",
    //   url: "#",
    //   icon: <Frame />,
    // },
    // {
    //   name: "Sales & Marketing",
    //   url: "#",
    //   icon: <PieChart />,
    // },
    // {
    //   name: "Travel",
    //   url: "#",
    //   icon: <Map />,
    // },
  ],
};
