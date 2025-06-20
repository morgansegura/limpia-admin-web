import { apiFetch } from "@/lib/api";

type Customer = {
  id: string;
  name: string;
  email: string;
};

export async function fetchCustomers() {
  return apiFetch<Customer[]>("/customers");
}
