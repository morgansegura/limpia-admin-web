import type { TLead, TEditableLeadField } from "@/types/lead.types";
import type { TFieldConfig } from "@/types/forms.types";

export const leadDetailsFields: TFieldConfig<
  Pick<TLead, TEditableLeadField>
>[] = [
  { key: "firstName", label: "First Name", type: "text" },
  { key: "lastName", label: "Last Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "contactPermission", label: "Contact Permission", type: "text" },
  { key: "contactMethod", label: "Preferred Contact Method", type: "text" },
];

export const leadLocationFields: TFieldConfig<
  Pick<TLead, TEditableLeadField>
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

export const leadEstimateFields: TFieldConfig<
  Pick<TLead, TEditableLeadField>
>[] = [
  {
    key: "cleaningPreference",
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
];

export const customerAccessFields: TFieldConfig<
  Pick<TLead, TEditableLeadField>
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
  Pick<TLead, TEditableLeadField>
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
  {
    key: "suppliesProvidedByCustomer",
    label: "Supplies Provided",
    type: "switch",
  },
];
