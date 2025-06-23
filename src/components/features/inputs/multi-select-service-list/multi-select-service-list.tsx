import { Checkbox } from "@/components/ui/checkbox";
import { VALUE_ADDED_SERVICE_TYPES } from "@/constants/value-added-service-types";

type Props = {
  selected: string[];
  onChange: (selected: string[]) => void;
};

export function MultiSelectServiceList({ selected, onChange }: Props) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="grid gap-2 max-h-48 overflow-y-auto">
      {VALUE_ADDED_SERVICE_TYPES.map((type) => (
        <label key={type} className="flex items-center gap-2">
          <Checkbox
            checked={selected.includes(type)}
            onCheckedChange={() => toggle(type)}
          />
          <span>{type}</span>
        </label>
      ))}
    </div>
  );
}
