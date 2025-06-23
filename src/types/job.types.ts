export type Job = {
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
