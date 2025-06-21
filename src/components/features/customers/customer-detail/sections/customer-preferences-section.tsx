import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

import { Customer, EditableCustomerField } from "@/types/customer.types";

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
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Preferences</h2>

      <div>
        <Label>Preferred Time of Day</Label>
        {isEditing ? (
          <Input
            value={form.preferredTimeOfDay || ""}
            onChange={(e) => onChange("preferredTimeOfDay", e.target.value)}
          />
        ) : (
          <p>{form.preferredTimeOfDay || "—"}</p>
        )}
      </div>

      <div>
        <Label>Preferred Days (comma-separated)</Label>
        {isEditing ? (
          <Input
            value={(form.preferredDays || []).join(", ")}
            onChange={(e) =>
              onChange(
                "preferredDays",
                e.target.value.split(",").map((d) => d.trim()),
              )
            }
          />
        ) : (
          <p>{(form.preferredDays || []).join(", ") || "—"}</p>
        )}
      </div>

      {(
        [
          "hasPets",
          "suppliesProvidedByCustomer",
          "rotationSystemOptIn",
        ] as EditableCustomerField[]
      ).map((key) => (
        <div key={key} className="flex items-center justify-between">
          <Label>{key}</Label>
          {isEditing ? (
            <Switch
              checked={Boolean(form[key])}
              onCheckedChange={(checked) => onChange(key, checked)}
            />
          ) : (
            <span>{form[key] ? "Yes" : "No"}</span>
          )}
        </div>
      ))}
    </div>
  );
}
