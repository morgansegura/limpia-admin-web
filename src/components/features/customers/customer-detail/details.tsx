import { TCustomer, TEditableCustomerField } from "@/types/customer.types";
import { TFieldConfig } from "@/types/forms.types";

export const customerDetailsFields: TFieldConfig<
  Pick<TCustomer, TEditableCustomerField>
>[] = [
  { key: "firstName", label: "First Name", type: "text" },
  { key: "lastName", label: "Last Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
];

export const customerLocationFields: TFieldConfig<
  Pick<TCustomer, TEditableCustomerField>
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

export const customerEstimateFields: TFieldConfig<
  Pick<TCustomer, TEditableCustomerField>
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

export const customerAccessFields: TFieldConfig<
  Pick<TCustomer, TEditableCustomerField>
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

export const customerPreferenceFields: TFieldConfig<
  Pick<TCustomer, TEditableCustomerField>
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

export const customerBillingFields: TFieldConfig<
  Pick<TCustomer, TEditableCustomerField>
>[] = [
  { key: "billingMethod", label: "Billing Method", type: "text" },
  { key: "invoiceNotes", label: "Invoice Notes", type: "textarea" },
  { key: "emailOptIn", label: "Email Opt-in", type: "switch" },
];

export const customerInternalFields: TFieldConfig<
  Pick<TCustomer, TEditableCustomerField>
>[] = [
  { key: "crmId", label: "CRM ID", type: "text" },
  { key: "customerSince", label: "Customer Since", type: "text" },
  { key: "isVIP", label: "VIP Customer", type: "switch" },
  { key: "notes", label: "Internal Notes", type: "textarea" },
  { key: "referredBy", label: "Referred By", type: "text" },
];
