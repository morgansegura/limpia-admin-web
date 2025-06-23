import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function humanDate() {
  return new Date("2025-06-22T23:13:44.943Z").toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
