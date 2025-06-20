import { apiFetch } from "@/lib/api";

import type { Customer } from "@/types/customer.types";

export async function fetchCustomers() {
  return apiFetch<Customer[]>("/customers");
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`,
      {
        credentials: "include",
      },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
