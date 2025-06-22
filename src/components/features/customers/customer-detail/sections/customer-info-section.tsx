import TypographySmall from "@/components/typography-small";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { Customer, EditableCustomerField } from "@/types/customer.types";

interface Props {
  form: Customer;
  isEditing: boolean;
  onChange: (key: EditableCustomerField, value: unknown) => void;
}

export function CustomerInfoSection({ form, isEditing, onChange }: Props) {
  return (
    <>
      <div className="px-6 pt-3">
        <h3 className="text-base/7 font-semibold text-gray-900">
          Applicant Information
        </h3>
        <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
          Personal details and application.
        </p>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          {(["name", "email", "phone"] as EditableCustomerField[]).map(
            (key, index) => (
              <div
                className={cn(
                  "py-6 sm:grid sm:grid-cols-3 sm:gap-4 px-6",
                  index % 2 ? "bg-gray-50" : "bg-white",
                )}
                key={key}
              >
                <dt className="text-sm/6 font-medium text-gray-900">
                  {key[0].toUpperCase() + key.slice(1)}
                </dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {isEditing ? (
                    <Input
                      name={key}
                      value={form[key] !== undefined ? String(form[key]) : ""}
                      onChange={(e) => onChange(key, e.target.value)}
                    />
                  ) : (
                    <p>{form[key] || "—"}</p>
                  )}
                </dd>
              </div>
            ),
          )}
        </dl>
      </div>
    </>
  );
}
