"use client";

import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandEmpty,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

export type ComboboxItem = {
  label: string;
  value: string;
};

type ComboboxProps = {
  items: ComboboxItem[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find((item) => item.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`w-full justify-between ${className}`}
        >
          {selected?.label || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={(val) => {
                  onChange(val);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    item.value === value ? "opacity-100" : "opacity-0"
                  }`}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
