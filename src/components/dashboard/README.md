# Dashboard Admin

## Summary – Design Principles to Follow

### Principle UI Example

This is the workflow for the dashboard and the design process for how the roles and role managemnt will work.

- Role Isolation Sidebar and content filtered by role
- Modular UI Dashboards built from role-based widget blocks
- Transparency Access denial with guidance, not blank screens
- Mental Model Show role, region, and scope in UI
- Mobile-First For field workers and managers on-the-go
- Quick Focus Actions and info that match job responsibility

---

## Potential UI Features

### 1. Single Dashboard Entry Point

- Default route after login: /dashboard

- Internally, this page detects the user's role and renders a customized view

- Show a welcome message with name and role (e.g., “Welcome back, Maria (Sales Agent)”)

### 2. Dynamic Sidebar Navigation

- Use a shared config like:

```
type TUserRoles = "SUPER_ADMIN" | "BRANCH_MANAGER" | "SUPPORT_AGENT" | "SALES_AGENT" | "MARKETER" | "TRAINER" | "TEAM_MANAGER" | "FIELD_WORKER";
```

```
export type TDashboardRoute = {
  icon: ReactNode;
  href: string;
  label: string;
  description?: string;
  roles: TUserRoles[];
  section?: string;
};
```

```
export const DASHBOARD_ROUTES: TDashboardRoute[] = [
  {
    icon: <LayoutDashboard />,
    href: "/dashboard",
    label: "Dashboard",
    roles: [
      "SUPER_ADMIN",
      "BRANCH_MANAGER",
      "SALES_AGENT",
      "TEAM_MANAGER",
      "TRAINER",
    ],
  },
];
```

### 3. Dashboard Widgets Based on Role

- The dashboard should be modular: each card/widget is a React component that renders only if the role matches.

---

Example:

- SALES_AGENT “Top 5 Leads to Follow Up”, “Quote Status”
- TEAM_MANAGER “Today’s Jobs”, “Team Attendance Tracker”
- TRAINER “New Hire Progress”, “Checklist Quality”
- SUPPORT_AGENT “Open Tickets”, “Customer Satisfaction”
- SUPER_ADMIN Everything, with global filters (org, region)

---

### 4. Role Badge in Header

- Always show the role in the topbar next to the profile avatar.

- Hover or dropdown shows:
  - Role: Trainer
  - Region: San Diego
  - Permissions: Limited to team access

- This keeps users grounded in their scope.

### 5. Contextual Access Messages

- When a user attempts to access a restricted page, do not show a 404 — instead:
  > “You don’t have access to this section. Please contact your manager if you believe this is an error.”
- Optionally disable the link rather than hiding it completely (for context)
- Show a lock icon on restricted buttons/tabs
- Add a call-to-action: “Request Access” or “Message Admin”

### 6. Mobile-Friendly Role-Specific Views

- FIELD_WORKER and TEAM_MANAGER should default to mobile-first design

- Keep views simple, large-tap areas, with focus on:
  - Today’s job

  - Clock in/out

  - Checklist completion

  - Quick notes or photos

### 7. Search & Quick Actions Toolbar

- For roles like SUPPORT_AGENT and SALES_AGENT, include a floating quick search bar:
  - Search: Customer, Job, Lead, Ticket
  - Quick actions: Create Estimate, Create Ticket, Assign Job

### 8. Color-Coded Role Cues

- Consider subtle color cues per role:
  - BLUE: Admin/Managers

  - GREEN: Sales

  - ORANGE: Support

  - PURPLE: Training

  - RED: Field Staff

- Keep this minimal, but use it for:
  - Sidebar accents

  - Badges

  - Headers

### 9. Future-Proof Tabs/Pages

Use a wrapper component like `<RoleProtected role={['SUPER_ADMIN', 'MARKETER']}>` so that if roles expand later, access control is maintainable.
