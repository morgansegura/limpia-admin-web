# Roles and Permitted Actions

**_Authorization Policy Notes_**

- All access should be **_scoped to the user's organization_** unless they are a `SUPER_ADMIN`.

- All endpoints should enforce `@Roles()` decorators and access guards using the current user's organizationId on the Back end.

- **_Support Agents_** and **_Sales Agents_** should never be allowed to hard delete data. Implement **_soft deletes (archival)_** with status tracking (`isArchived`, etc.).

- **_Field Workers_** should have **_read-only_** access to assigned jobs and checklists. Allow them to mark items complete but restrict editing.

---

## Roles and Permitted Actions (Limpia CRM)

| Role | Permissions |
| ---- | ----------- |

SUPER_ADMIN

- Full access to everything across all organizations:
  - CRUD all users, customers, jobs, leads, org settings
  - View all branches
  - System audit

BRANCH_MANAGER

- Full access within their org:
  - CRUD users (except SUPER_ADMIN)
  - Manage jobs, leads, customers
  - View reports & performance metrics

SUPPORT_AGENT

- View & edit jobs, leads, customers within their branch
- Communicate with customers
- Can reschedule jobs
- Cannot delete accounts

SALES_AGENT

- Create/update leads & customers
- View estimates
- Promote lead → customer
- Limited access to reports
- Cannot delete records

MARKETER

- Create and manage campaigns (future)
- View customer demographics
- Track lead source data

TRAINER

- View user performance
- View job assignments
- Leave training notes

TEAM_MANAGER

- View job schedules and assigned cleaners
- Reassign field workers
- Access team metrics and customer feedback

FIELD_WORKER

- View assigned jobs
- Mark tasks complete
- Add internal job notes
- Cannot access customers/leads directly

## Entity Access Matrix

| Entity               | SUPER_ADMIN | BRANCH_MANAGER | SUPPORT_AGENT | SALES_AGENT | MARKETER | TRAINER | TEAM_MANAGER | FIELD_WORKER  |
| -------------------- | ----------- | -------------- | ------------- | ----------- | -------- | ------- | ------------ | ------------- |
| Users                | CRUD all    | CRUD own org   | ❌            | ❌          | ❌       | ❌      | ❌           | ❌            |
| Leads                | CRUD        | CRUD           | View/update   | CRUD View   | ❌       | ❌      | ❌           |
| Customers            | CRUD        | CRUD           | View/update   | Create/edit | View     | ❌      | View         | ❌            |
| Jobs                 | CRUD        | CRUD           | View/edit     | View        | ❌       | ❌      | View/edit    | View/complete |
| Estimates            | Full        | Full           | View          | Create/view | View     | ❌      | ❌           | ❌            |
| Value-Added Services | Full        | Full           | View/edit     | View        | ❌       | ❌      | ❌           | View          |
| Checklists           | Full        | Full           | View/edit     | ❌          | ❌       | View    | View/edit    | Complete only |
| Organizations        | Full        | ❌             | ❌            | ❌          | ❌       | ❌      | ❌           | ❌            |
