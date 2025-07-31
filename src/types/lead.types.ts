import { TEstimate } from "./estimate.types";
import { TUser } from "./user.types";

export type TLead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  zip: string;
  status?: TLeadStatus; // New
  isArchived?: boolean; // false
  squareFootage?: number;
  contactPermission: string;
  contactMethod?: string;
  cleaningPreference?: string;
  organizationId?: string;
  organization?: string;
  estimateStartedAt?: string;
  estimate?: TEstimate;
  createdById?: string;
  createdBy?: TUser;
  createdAt?: string;
  updatedAt?: string;
  contactedAt?: string;
  convertedAt?: string;
  lastActivityAt?: string;
  lastModifiedById?: string;
  lastModifiedBy?: TUser;
};

export type TLeadStatus =
  | "NEW"
  | "CONTACTED"
  | "CONVERTED"
  | "DISQUALIFIED"
  | "ARCHIVED";
