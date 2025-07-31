export type TJobStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface TJob {
  id: string;
  title: string;
  description?: string;
  status: TJobStatus;
  scheduledAt: string;
  completedAt: string;
  isRecurring: boolean;
  recurrenceType: string;
  repeatNextAt: string;
  discount: number;
  cleaningType: TCleaningType;
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

export const JOB_STATUS_OPTIONS: TJobStatus[] = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export type TCleaningType =
  | "BASE"
  | "MOVE_OUT"
  | "MOVE_IN"
  | "AIRBNB"
  | "DEEP"
  | "OFFICE";

export type TRecurrenceType = "WEEKLY" | "BIWEEKLY" | "MONTHLY";
