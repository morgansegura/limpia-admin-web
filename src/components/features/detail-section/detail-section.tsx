import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { FieldConfig } from "@/types/forms.types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Switch } from "@radix-ui/react-switch";

type Props<T extends object, K extends keyof T = keyof T> = {
  form: Partial<T>;
  isEditing: boolean;
  onChange: (key: K, value: unknown) => void;
  fields: FieldConfig<Pick<T, K>>[];
  title?: string;
};

export function DetailSection<T extends object, K extends keyof T = keyof T>({
  form,
  isEditing,
  onChange,
  fields,
  title,
}: Props<T, K>) {
  const isLoading = !form;

  return (
    <>
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {fields.map(({ key, label, type, options }, index) => {
        const value = form?.[key];

        return (
          <div key={String(key)} className="border-t border-neutral-100">
            <div
              className={cn(
                "py-4 grid sm:grid-cols-3 gap-2 items-center",
                index % 2 ? "bg-neutral-50 " : "bg-white",
              )}
            >
              <div className="px-4 text-sm/6 font-medium text-neutral-900">
                <Label className="divide-y divide-neutral-100">{label}</Label>
              </div>

              <div className="pl-4 text-sm/6 text-neutral-700 sm:col-span-2">
                {isLoading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : isEditing ? (
                  <>
                    {type === "text" && (
                      <Input
                        value={value ? String(value) : ""}
                        onChange={(e) => onChange(key, e.target.value)}
                      />
                    )}

                    {type === "textarea" && (
                      <Textarea
                        value={value ? String(value) : ""}
                        onChange={(e) => onChange(key, e.target.value)}
                      />
                    )}

                    {type === "switch" && (
                      <>
                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => onChange(key, checked)}
                        />
                      </>
                    )}

                    {type === "select" && options && (
                      <Select
                        value={value ? String(value) : ""}
                        onValueChange={(v) => onChange(key, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {type === "multi-select" &&
                      Array.isArray(value) &&
                      options && (
                        <div className="flex flex-wrap gap-2">
                          {options.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={value.includes(opt.value)}
                                onCheckedChange={(checked) => {
                                  const newVal = checked
                                    ? [...value, opt.value]
                                    : value.filter(
                                        (v: string) => v !== opt.value,
                                      );
                                  onChange(key, newVal);
                                }}
                              />
                              <span className="text-sm">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                    {type === "radio" && options && (
                      <RadioGroup
                        value={value ? String(value) : ""}
                        onValueChange={(val) => onChange(key, val)}
                      >
                        {options.map((opt) => (
                          <div
                            key={opt.value}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem value={opt.value} id={opt.value} />
                            <Label htmlFor={opt.value}>{opt.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-medium">
                    {Array.isArray(value)
                      ? value.join(", ")
                      : String(value ?? "No preference selected")}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
