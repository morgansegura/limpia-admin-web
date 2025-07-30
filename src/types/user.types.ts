import { EmploymentType, Role } from "@/constants/roles";

export type TUserRoles =
  | "SUPER_ADMIN"
  | "BRANCH_MANAGER"
  | "SUPPORT_AGENT"
  | "SALES_AGENT"
  | "MARKETER"
  | "TRAINER"
  | "TEAM_MANAGER"
  | "FIELD_WORKER";

type TOrganization = {
  name: string;
  id: string;
  type: string | null;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  logoUrl: string | null;
  colorHex: string | null;
};

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone: string;
  avatarUrl: string;

  // Employment Info
  type: EmploymentType;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  trainingCompleted: boolean;
  availability: string; // e.g. "Mon-Fri 8am-5pm"
  region: string; // optional region or zone
  internalNotes: string;

  organization: TOrganization;
  organizationId: TOrganization["id"];

  createdAt: string;
  updatedAt: string;
}
