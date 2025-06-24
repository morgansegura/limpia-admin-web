export type JobStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type Job = {
  [x: string]: any;
  id: string;
  customerId: string;
  cleaningType: string;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
  // Optional fields:
  notes?: string;
  recurrence?: string;
  status?: JobStatus;
};

export const JOB_STATUS_OPTIONS: JobStatus[] = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];
