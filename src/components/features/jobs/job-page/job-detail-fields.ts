import type { TFieldConfig } from "@/types/forms.types";
import type { TJob } from "@/types/job.types";

export const jobInfoFields: TFieldConfig<TJob>[] = [
  { key: "title", label: "Job Title", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Assigned", value: "ASSIGNED" },
      { label: "IN_PROGRESS", value: "IN_PROGRESS" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    key: "cleaningType",
    label: "Cleaning Type",
    type: "select",
    options: [
      { label: "Base", value: "PENDING" },
      { label: "Move Out", value: "ASSIGNED" },
      { label: "Move In", value: "IN_PROGRESS" },
      { label: "AirBnB", value: "AIRBNB" },
      { label: "Deep", value: "DEEP" },
      { label: "Office", value: "OFFICE" },
    ],
  },
];

export const jobScheduleFields: TFieldConfig<TJob>[] = [
  { key: "scheduledAt", label: "Scheduled At", type: "datetime" },
  { key: "completedAt", label: "Completed At", type: "datetime" },
  { key: "isRecurring", label: "Is Recurring", type: "switch" },
  { key: "recurrenceType", label: "Recurrence Type", type: "text" },
  { key: "repeatNextAt", label: "Next Repeat", type: "datetime" },
];

export const jobPricingFields: TFieldConfig<TJob>[] = [
  { key: "squareFootage", label: "Square Footage", type: "number" },
  { key: "price", label: "Price", type: "number" },
  { key: "discount", label: "Discount", type: "number" },
];
