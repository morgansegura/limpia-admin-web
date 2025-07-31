import { TCleaningType } from "./customer.types";
import { TLead } from "./lead.types";

export type TEstimateFormValues = {
  street: string;
  zip: string;
  cleaningType: string;
  isRecurring: boolean;
  discountPercent: number;
};

export type TEstimate = {
  id: string;
  leadId?: string;
  lead?: TLead;
  cleaningType: TCleaningType;
  squareFootage: number;
  priceEstimate: number;
  createdById: string;
  createdAt: string;
  notes?: string;
};
