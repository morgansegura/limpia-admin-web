import { WhenProps } from "./when.types";

export function When({ condition, children }: WhenProps) {
  return condition ? <>{children}</> : null;
}
