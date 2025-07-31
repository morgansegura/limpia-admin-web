import { TEmploymentType, TRole } from "@/constants/roles";
import { TLead } from "./lead.types";
import { TJob } from "./job.types";

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

export interface TUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: TRole;
  phone: string;
  avatarUrl: string;

  // Employment Info
  type: TEmploymentType;
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
  leadsCreated: TLead[];
  leadsLastModified: TLead[];
  Job: TJob[];
  passwordResetToken: string;
}
