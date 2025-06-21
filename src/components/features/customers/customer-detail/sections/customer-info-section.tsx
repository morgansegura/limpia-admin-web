import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Customer, EditableCustomerField } from "@/types/customer.types";

interface Props {
  form: Customer;
  isEditing: boolean;
  onChange: (key: EditableCustomerField, value: unknown) => void;
}

export function CustomerInfoSection({ form, isEditing, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Basic Info</h2>
      {(["name", "email", "phone"] as EditableCustomerField[]).map((key) => (
        <div key={key}>
          <Label htmlFor={key}>{key[0].toUpperCase() + key.slice(1)}</Label>
          {isEditing ? (
            <Input
              name={key}
              value={form[key] !== undefined ? String(form[key]) : ""}
              onChange={(e) => onChange(key, e.target.value)}
            />
          ) : (
            <p>{form[key] || "—"}</p>
          )}
        </div>
      ))}
    </div>
  );
}
