import { TCleaningType } from "./customer.types";
import { TEstimate } from "./estimate.types";
import { TUser } from "./user.types";

export type TLead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  homeType?: string;
  bedrooms?: number;
  bathrooms?: number;
  entryInstructions?: string;
  hasPets?: boolean;
  parkingInstructions?: string;
  cleaningType?: TCleaningType;
  alarmSystemInstructions?: string;

  // Preferences
  cleaningNotes?: string;
  preferredTimeOfDay?: string;
  preferredDays: string[];
  suppliesProvidedByCustomer?: boolean;

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

export type TEditableLeadField = keyof Pick<
  TLead,
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "zip"
  | "street"
  | "unit"
  | "city"
  | "state"
  | "homeType"
  | "bedrooms"
  | "bathrooms"
  | "status"
  | "isArchived"
  | "squareFootage"
  | "contactPermission"
  | "entryInstructions"
  | "hasPets"
  | "parkingInstructions"
  | "alarmSystemInstructions"
  | "cleaningNotes"
  | "preferredTimeOfDay"
  | "preferredDays"
  | "suppliesProvidedByCustomer"
  | "contactMethod"
  | "cleaningPreference"
  | "organizationId"
  | "organization"
  | "estimateStartedAt"
  | "estimate"
  | "createdById"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "contactedAt"
  | "convertedAt"
  | "lastActivityAt"
  | "lastModifiedById"
  | "lastModifiedBy"
>;

export type TLeadStatus =
  | "NEW"
  | "CONTACTED"
  | "CONVERTED"
  | "DISQUALIFIED"
  | "ARCHIVED";
