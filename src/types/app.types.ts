// Core Entity Types
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone: string;
  status: "VIP" | "Regular" | "New" | "Inactive";
  address:
    | string
    | {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
      };
  totalBookings?: number;
  totalSpent?: number;
  lastBooking?: Date;
  averageRating?: number;
  joinedDate?: Date;
  preferences?: string[];
  preferredContactMethod?: "email" | "sms" | "phone";
  createdAt?: string;
  updatedAt?: string;
  isVip?: boolean;
  rating?: number;
  source?: string;
  notes?: string;
}

export interface Job {
  id: string;
  customer: string; // Customer name as string (not ID)
  customerId?: string;
  service: string; // Service name as string (not ID)
  serviceId?: string;
  crew?: string; // Crew name as string
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  scheduledStart?: Date;
  estimatedEnd?: Date;
  actualStart?: Date | null;
  scheduledDate?: string;
  address: string;
  description?: string;
  notes?: string;
  price?: number;
  estimatedDuration?: number;
  progress?: number;
  crewId?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: number;
  category: string;
  isActive: boolean;
}

// Communication Types
export interface CallData {
  customerId: string;
  customerName: string;
  duration: number;
  notes: string;
  outcome: "answered" | "voicemail" | "no_answer" | "busy";
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface EmailData {
  customerId: string;
  customerName: string;
  to: string;
  subject: string;
  content: string;
  templateId?: string;
  attachments?: string[];
}

export interface MessageData {
  customerId: string;
  customerName: string;
  message: string;
  type: "sms" | "app_notification" | "internal_note";
  urgent: boolean;
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
}

export enum UserRole {
  CORPORATE_EXECUTIVE = "CORPORATE_EXECUTIVE",
  CORPORATE_ADMIN = "CORPORATE_ADMIN",
  CORPORATE_SUPPORT = "CORPORATE_SUPPORT",
  FRANCHISE_OWNER = "FRANCHISE_OWNER",
  LOCATION_MANAGER = "LOCATION_MANAGER",
  SALES_MANAGER = "SALES_MANAGER",
  SALES_REP = "SALES_REP",
  SUPERVISOR = "SUPERVISOR",
  EMPLOYEE = "EMPLOYEE",
}

// Form Data Types
export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  notes?: string;
  source?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Sales Types
export interface Estimate {
  id: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceType?: string;
  status:
    | "draft"
    | "sent"
    | "approved"
    | "rejected"
    | "expired"
    | "DRAFT"
    | "SENT"
    | "ACCEPTED";
  totalAmount?: number;
  basePrice?: number;
  quotedPrice?: number;
  finalPrice?: number;
  commission?: number;
  commissionAmount?: number;
  commissionTier?: string;
  squareFootage?: string | number;
  discountPercentage?: number;
  discountAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  validUntil?: string;
  notes?: string;
  createdBy?: string;
}

export interface CalculatorData {
  serviceType?: string;
  area?: number;
  rooms?: number;
  addOns?: string[];
  frequency?: string;
  discount?: number;
  total?: number;
  commission?: number;
  basePrice?: number;
  quotedPrice?: number;
  finalPrice?: number;
  squareFootage?: string;
  discountPercentage?: number;
  discountAmount?: number;
  commissionAmount?: number;
  commissionTier?: string;
}

// Crew Types
export interface Crew {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  members?: string[];
}

// Employee Types
export interface Employee {
  id: string;
  name?: string;
  type?: string;
  contactEmail?: string;
  status?: string;
  lastClockIn?: string;
  hoursWorkedToday?: number;
  currentLocation?: string;
}

// Payment Types
export interface Payment {
  id: string;
  customerId?: string;
  amount?: number;
  status?: string;
  method?: string;
  createdAt?: string;
  description?: string;
}

export interface Subscription {
  id: string;
  customerId?: string;
  planName?: string;
  amount?: number;
  status?: string;
  nextBillingDate?: string;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  customerId?: string;
  amount?: number;
  status?: string;
  dueDate?: string;
  issueDate?: string;
  number?: string;
}

// Generic Error Type
export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
}
