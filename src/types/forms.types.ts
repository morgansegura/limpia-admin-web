export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "switch"
  | "multi-select"
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
}
