import { TLead } from "@/types/lead.types";

export const emptyLead: Partial<TLead> = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  unit: "",
  city: "",
  state: "",
  zip: "",
  squareFootage: 0,
  cleaningPreference: "",
  homeType: "",
  bedrooms: 0,
  bathrooms: 0,
  contactPermission: "",
  contactMethod: "",
  entryInstructions: "",
  hasPets: false,
  parkingInstructions: "",
  alarmSystemInstructions: "",
  cleaningNotes: "",
  preferredTimeOfDay: "",
  preferredDays: [],
  suppliesProvidedByCustomer: false,
  estimateStartedAt: "",
  estimate: undefined,
  status: "NEW", // "NEW" | "CONTACTED" | "CONVERTED" | "DISQUALIFIED" | "ARCHIVED"
  isArchived: false,
  organizationId: "",
  organization: "",
  createdById: "",
  createdBy: undefined,
  updatedAt: "",
  createdAt: "",
  contactedAt: "",
  convertedAt: "",
  lastActivityAt: "",
  lastModifiedById: "",
  lastModifiedBy: undefined,
};
