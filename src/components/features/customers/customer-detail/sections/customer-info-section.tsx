import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

import { Customer, EditableCustomerField } from "@/types/customer.types";

interface Props {
  form: Customer;
  isEditing: boolean;
  onChange: (key: EditableCustomerField, value: unknown) => void;
}

export function CustomerInfoSection({ form, isEditing, onChange }: Props) {
  const noPreference = "No preference listed";

  return (
    <>
      <div className="border-t border-neutral-100">
        <div className="divide-y divide-neutral-100 ">
          {(["name", "email", "phone"] as EditableCustomerField[]).map(
            (key, index) => (
              <div
                className={cn(
                  "py-4 sm:grid sm:grid-cols-3 sm:gap-4",
                  index % 2 ? "bg-neutral-50 " : "bg-white",
                )}
                key={key}
              >
                <div className="px-4 text-sm/6 font-medium text-neutral-900">
                  {key[0].toUpperCase() + key.slice(1)}
                </div>
                <div className="pl-4 text-sm/6 text-neutral-700 sm:col-span-2 ">
                  {isEditing ? (
                    <Input
                      name={key}
                      value={form[key] !== undefined ? String(form[key]) : ""}
                      onChange={(e) => onChange(key, e.target.value)}
                    />
                  ) : (
                    <p>{form[key] || noPreference}</p>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
}
