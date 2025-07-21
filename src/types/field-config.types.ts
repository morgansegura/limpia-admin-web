export type FieldType = "text" | "select" | "switch";

export interface BaseField {
  key: string;
  label: string;
  type: FieldType;
}

export interface TextField extends BaseField {
  type: "text";
}

export interface SwitchField extends BaseField {
  type: "switch";
}

export interface SelectField extends BaseField {
  type: "select";
  options: {
    value: string;
    label: string;
  }[];
}

export type FieldConfig = TextField | SelectField | SwitchField;
