import { apiFetch } from "@/lib/api";

import type { Customer } from "@/types/customer.types";

export function fetchCustomers() {
  return apiFetch<Customer[]>("/customers");
}

export function getCustomerById(id: string) {
  return apiFetch<Customer>(`/customers/${id}`, {
    credentials: "include",
  });
}
