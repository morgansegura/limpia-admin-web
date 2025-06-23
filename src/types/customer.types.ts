export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isActive: boolean;

  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  squareFootage?: number;
  priceEstimate?: number;
  homeType?: string;
  bedrooms?: number;
  bathrooms?: number;

  entryInstructions?: string;
  hasPets?: boolean;
  parkingInstructions?: string;
  alarmSystemInstructions?: string;

  cleaningNotes?: string;
  cleaningType: CleaningType;
  preferredTimeOfDay?: string;
  preferredDays: DayOfWeek[];
  preferredCleanerId?: string;
  rotationSystemOptIn?: boolean;
  suppliesProvidedByCustomer?: boolean;

  customerSince: string;
  isVIP: boolean;
  notes?: string;
  referredBy?: string;
  organizationId?: string;
  createdByUserId?: string;

  billingMethod?: string;
  invoiceNotes?: string;
  crmId?: string;
  emailOptIn: boolean;

  createdAt: string;
  updatedAt: string;
}

export type EditableCustomerField = keyof Pick<
  Customer,
  | "name"
  | "email"
  | "phone"
  | "unit"
  | "street"
  | "city"
  | "state"
  | "zip"
  | "squareFootage"
  | "cleaningType"
  | "priceEstimate"
  | "homeType"
  | "bedrooms"
  | "bathrooms"
  | "entryInstructions"
  | "hasPets"
  | "parkingInstructions"
  | "alarmSystemInstructions"
  | "cleaningNotes"
  | "preferredTimeOfDay"
  | "preferredDays"
  | "preferredCleanerId"
  | "rotationSystemOptIn"
  | "suppliesProvidedByCustomer"
  | "customerSince"
  | "isVIP"
  | "notes"
  | "referredBy"
  | "organizationId"
  | "createdByUserId"
  | "billingMethod"
  | "invoiceNotes"
  | "crmId"
  | "emailOptIn"
  | "createdAt"
  | "updatedAt"
>;

export type DayOfWeek = [
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday",
];

export type DAYS_OF_THE_WEEK = DayOfWeek[];

export type CleaningType =
  | "BASE"
  | "MOVE_OUT"
  | "MOVE_IN"
  | "AIRBNB"
  | "DEEP"
  | "OFFICE";

export type CLEANING_TYPE = CleaningType[];

export const CLEANING_TYPE_OPTIONS: CleaningType[] = [
  "BASE",
  "MOVE_OUT",
  "MOVE_IN",
  "AIRBNB",
  "DEEP",
  "OFFICE",
];
