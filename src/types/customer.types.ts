export interface TCustomer {
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
  cleaningType: TCleaningType;
  preferredTimeOfDay?: string;
  preferredDays: TDayOfWeek[];
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

export type TEditableCustomerField = keyof Pick<
  TCustomer,
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

export type TDayOfWeek = [
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday",
];

export type DAYS_OF_THE_WEEK = TDayOfWeek[];

export type TCleaningType =
  | "BASE"
  | "MOVE_OUT"
  | "MOVE_IN"
  | "AIRBNB"
  | "DEEP"
  | "OFFICE";

export type CLEANING_TYPE = TCleaningType[];

export const CLEANING_TYPE_OPTIONS: TCleaningType[] = [
  "BASE",
  "MOVE_OUT",
  "MOVE_IN",
  "AIRBNB",
  "DEEP",
  "OFFICE",
];

export type TCustomerStatus = "ACTIVE" | "INACTIVE" | "PAUSED" | "CANCELED";
