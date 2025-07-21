import { CleaningType } from "./customer.types";

export type JobStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  scheduledAt: string;
  completedAt: string;
  isRecurring: boolean;
  recurrenceType: string;
  repeatNextAt: string;
  discount: number;
  cleaningType: CleaningType;
  squareFootage: number;
  price: number;

  customer: {
    name: string;
    city: string;
    state: string;
    zip: string;
  };

  checklistItem: {
    id: string;
    label: string;
    isCompleted: boolean;
    room?: string;
    isRotationTask?: boolean;
  }[];
}

export const JOB_STATUS_OPTIONS: JobStatus[] = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];
