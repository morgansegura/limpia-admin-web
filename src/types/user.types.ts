export type Role =
  | "SUPER_ADMIN"
  | "BRANCH_MANAGER"
  | "SUPPORT_AGENT"
  | "SALES_AGENT"
  | "MARKETER"
  | "TRAINER"
  | "TEAM_MANAGER"
  | "FIELD_WORKER";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId?: string;
  avatarUrl?: string;
}
