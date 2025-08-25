"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm";
  id?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, size = "default", id, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const sizeClasses = size === "sm" ? "h-4 w-7" : "h-6 w-11";
    const thumbSizeClasses = size === "sm" ? "h-3 w-3" : "h-5 w-5";
    const thumbTransformClasses = size === "sm" 
      ? checked ? "translate-x-3" : "translate-x-0"
      : checked ? "translate-x-5" : "translate-x-0";

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        id={id}
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-input",
          sizeClasses,
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
            thumbSizeClasses,
            thumbTransformClasses
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch }