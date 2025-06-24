import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FieldConfig } from "@/types/forms.types";

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
      {fields.map(({ key, label, type, options, disabled }, index) => {
        const value = form?.[key];

        const inputClass = disabled ? "opacity-50 pointer-events-none" : "";

        return (
          <div key={String(key)} className="border-t border-neutral-100">
            <div
              className={cn(
                "py-4 grid sm:grid-cols-3 gap-2 items-center",
                index % 2 ? "bg-neutral-50" : "bg-white",
              )}
            >
              <div className="px-4 text-sm/6 font-medium text-neutral-900">
                <Label>{label}</Label>
              </div>

              <div className="pl-4 text-sm/6 text-neutral-700 sm:col-span-2">
                {isLoading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : isEditing ? (
                  <>
                    {(type === "text" ||
                      type === "email" ||
                      type === "tel" ||
                      type === "currency") && (
                      <Input
                        type={type === "currency" ? "number" : type}
                        inputMode={type === "currency" ? "decimal" : undefined}
                        value={value ? String(value) : ""}
                        onChange={(e) => onChange(key, e.target.value)}
                        className={inputClass}
                        disabled={disabled}
                      />
                    )}

                    {type === "number" && (
                      <Input
                        type="number"
                        value={value ? String(value) : ""}
                        onChange={(e) => onChange(key, Number(e.target.value))}
                        className={inputClass}
                        disabled={disabled}
                      />
                    )}

                    {type === "date" && (
                      <Input
                        type="date"
                        value={value ? String(value).slice(0, 10) : ""}
                        onChange={(e) => onChange(key, e.target.value)}
                        className={inputClass}
                        disabled={disabled}
                      />
                    )}

                    {type === "textarea" && (
                      <Textarea
                        value={value ? String(value) : ""}
                        onChange={(e) => onChange(key, e.target.value)}
                        className={inputClass}
                        disabled={disabled}
                      />
                    )}

                    {type === "switch" && (
                      <Switch
                        checked={Boolean(value)}
                        onCheckedChange={(checked) => onChange(key, checked)}
                        disabled={disabled}
                      />
                    )}

                    {type === "select" && options && (
                      <Select
                        value={value ? String(value) : ""}
                        onValueChange={(val) => onChange(key, val)}
                      >
                        <SelectTrigger
                          className={inputClass}
                          disabled={disabled}
                        >
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
                                disabled={disabled}
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
                            <RadioGroupItem
                              value={opt.value}
                              id={opt.value}
                              disabled={disabled}
                            />
                            <Label htmlFor={opt.value}>{opt.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {![
                      "text",
                      "number",
                      "textarea",
                      "switch",
                      "select",
                      "multi-select",
                      "radio",
                      "date",
                      "email",
                      "tel",
                      "currency",
                    ].includes(type) && (
                      <p className="text-red-500 text-sm">
                        Unknown field type: <code>{type}</code>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-medium">
                    {Array.isArray(value)
                      ? value.join(", ")
                      : String(value ?? "—")}
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
