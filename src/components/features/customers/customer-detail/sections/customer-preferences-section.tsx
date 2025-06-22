"use client";

import { EditableCustomerField, Customer } from "@/types/customer.types";
import { DetailSection } from "@/components/features/detail-section/detail-section";
import { FieldConfig } from "@/types/forms.types";

interface Props {
  form: Customer;
  isEditing: boolean;
  onChange: (key: EditableCustomerField, value: unknown) => void;
}

export function CustomerPreferencesSection({
  form,
  isEditing,
  onChange,
}: Props) {
  const fields: FieldConfig<Pick<Customer, EditableCustomerField>>[] = [
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
  ];

  return (
    <DetailSection
      title="Preferences"
      form={form}
      isEditing={isEditing}
      onChange={onChange}
      fields={fields}
    />
  );
}
