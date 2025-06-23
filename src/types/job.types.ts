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
  status?: string;
};
