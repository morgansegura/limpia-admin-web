import { apiFetch } from "@/lib/api";

import type { Customer } from "@/types/customer.types";

export function fetchLeads() {
  return apiFetch<Customer[]>("/leads");
}

export function getLeadById(id: string) {
  return apiFetch<Customer>(`/leads/${id}`, {
    credentials: "include",
  });
}
