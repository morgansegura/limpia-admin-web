export type TFieldType =
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

export type TFieldOption = {
  label: string;
  value: string;
};

export interface TFieldConfig<T> {
  key: keyof T;
  label: string;
  type: TFieldType;
  options?: TFieldOption[]; // only for select
  required?: boolean;
  disabled?: boolean;
}
