import { TFieldType } from "./forms.types";

export interface TBaseField {
  key: string;
  label: string;
  type: TFieldType;
}

export interface TTextField extends TBaseField {
  type: "text";
}

export interface TSwitchField extends TBaseField {
  type: "switch";
}

export interface TSelectField extends TBaseField {
  type: "select";
  options: {
    value: string;
    label: string;
  }[];
}

export type FieldConfig = TTextField | TSelectField | TSwitchField;
