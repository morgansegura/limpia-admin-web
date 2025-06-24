export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "switch"
  | "multi-select"
  | "datetime"
  | "date"
  | "tel"
  | "email"
  | "currency"
  | "radio";

export type FieldOption = {
  label: string;
  value: string;
};

export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  type: FieldType;
  options?: FieldOption[]; // only for select
  required?: boolean;
  disabled?: boolean;
}
