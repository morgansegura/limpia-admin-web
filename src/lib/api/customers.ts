import { apiFetch } from "@/lib/api";

import type { TCustomer } from "@/types/customer.types";

// GET /customers
export function fetchCustomers(): Promise<TCustomer[]> {
  return apiFetch<TCustomer[]>("/customers");
}

// GET /customers/:id
export function getCustomerById(id: string): Promise<TCustomer | null> {
  return apiFetch<TCustomer>(
    `/customers/${id}`,
    {
      credentials: "include",
    },
    {
      throwOnError: false,
    },
  );
}

// POST /customers
export function createCustomer(data: Partial<TCustomer>): Promise<TCustomer> {
  return apiFetch<TCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /customers/:id
export function updateCustomer(
  id: string,
  data: Partial<TCustomer>,
): Promise<TCustomer> {
  return apiFetch<TCustomer>(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE /customers/:id
export function deleteCustomer(id: string): Promise<void> {
  return apiFetch<void>(`/customers/${id}`, {
    method: "DELETE",
  });
}
