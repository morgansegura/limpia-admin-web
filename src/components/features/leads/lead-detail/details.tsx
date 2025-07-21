import { Customer, EditableCustomerField } from "@/types/customer.types";
import { FieldConfig } from "@/types/forms.types";

export const customerDetailsFields: FieldConfig<
  Pick<Customer, EditableCustomerField>
>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
];

export const customerLocationFields: FieldConfig<
  Pick<Customer, EditableCustomerField>
>[] = [
  { key: "street", label: "Street", type: "text" },
  { key: "unit", label: "Unit #", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "state", label: "State", type: "text" },
  { key: "zip", label: "Zip Code", type: "text" },
  { key: "homeType", label: "Home Type", type: "text" },
  { key: "bedrooms", label: "Bedrooms", type: "text" },
  { key: "bathrooms", label: "Bathrooms", type: "text" },
];

export const customerEstimateFields: FieldConfig<
  Pick<Customer, EditableCustomerField>
>[] = [
  {
    key: "cleaningType",
    label: "Cleaning Type",
    type: "select",
    options: [
      { label: "Base", value: "BASE" },
      { label: "Move Out", value: "MOVE_OUT" },
      { label: "Move In", value: "MOVE_IN" },
      { label: "Airbnb", value: "AIRBNB" },
      { label: "Deep", value: "DEEP" },
      { label: "Office", value: "OFFICE" },
    ],
  },
  { key: "squareFootage", label: "Estimated Sq. Ft.", type: "text" },
  { key: "priceEstimate", label: "Estimated Price", type: "text" },
];

export const customerAccessFields: FieldConfig<
  Pick<Customer, EditableCustomerField>
>[] = [
  { key: "entryInstructions", label: "Entry Instructions", type: "textarea" },
  {
    key: "parkingInstructions",
    label: "Parking Instructions",
    type: "textarea",
  },
  {
    key: "alarmSystemInstructions",
    label: "Alarm Instructions",
    type: "textarea",
  },
  { key: "cleaningNotes", label: "Cleaning Notes", type: "textarea" },
  { key: "hasPets", label: "Has Pets", type: "switch" },
];

export const customerPreferenceFields: FieldConfig<
  Pick<Customer, EditableCustomerField>
>[] = [
  {
    key: "preferredTimeOfDay",
    label: "Preferred Time",
    type: "radio",
    options: [
      { label: "Morning", value: "morning" },
      { label: "Afternoon", value: "afternoon" },
    ],
  },
  {
    key: "preferredDays",
    label: "Preferred Days",
    type: "multi-select",
    options: [
      { label: "Sunday", value: "Sunday" },
      { label: "Monday", value: "Monday" },
      { label: "Tuesday", value: "Tuesday" },
      { label: "Wednesday", value: "Wednesday" },
      { label: "Thursday", value: "Thursday" },
      { label: "Friday", value: "Friday" },
      { label: "Saturday", value: "Saturday" },
    ],
  },
  { key: "preferredCleanerId", label: "Preferred Cleaner ID", type: "text" },
  {
    key: "rotationSystemOptIn",
    label: "Use Rotation System",
    type: "switch",
  },
  {
    key: "suppliesProvidedByCustomer",
    label: "Supplies Provided",
    type: "switch",
  },
];

export const customerBillingFields: FieldConfig<
  Pick<Customer, EditableCustomerField>
>[] = [
  { key: "billingMethod", label: "Billing Method", type: "text" },
  { key: "invoiceNotes", label: "Invoice Notes", type: "textarea" },
  { key: "emailOptIn", label: "Email Opt-in", type: "switch" },
];

export const customerInternalFields: FieldConfig<
  Pick<Customer, EditableCustomerField>
>[] = [
  { key: "crmId", label: "CRM ID", type: "text" },
  { key: "customerSince", label: "Customer Since", type: "text" },
  { key: "isVIP", label: "VIP Customer", type: "switch" },
  { key: "notes", label: "Internal Notes", type: "textarea" },
  { key: "referredBy", label: "Referred By", type: "text" },
];
