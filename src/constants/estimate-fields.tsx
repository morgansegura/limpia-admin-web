import { FieldConfig } from "@/types/forms.types";

export const estimateFields: FieldConfig<any>[] = [
  {
    key: "street",
    label: "Street Address",
    type: "text",
  },
  {
    key: "zip",
    label: "Zip Code",
    type: "text",
  },
  {
    key: "cleaningType",
    label: "Cleaning Type",
    type: "select",
    options: [
      { value: "BASE", label: "Base Clean" },
      { value: "DEEP", label: "Deep Clean" },
      { value: "MOVE_IN", label: "Move In" },
      { value: "MOVE_OUT", label: "Move Out" },
    ],
  },
  {
    key: "isRecurring",
    label: "Recurring Job?",
    type: "switch",
  },
  {
    key: "discountPercent",
    label: "Discount Percent",
    type: "select",
    options: [
      { value: "0", label: "0%" },
      { value: "5", label: "5%" },
      { value: "10", label: "10%" },
      { value: "15", label: "15%" },
      { value: "20", label: "20%" },
    ],
  },
];
