import { apiFetch } from "@/lib/api";

export function fetchCRMReports() {
  return apiFetch("/crm/reports");
}

export function fetchLeadsSummary() {
  return apiFetch("/crm/leads-summary");
}

export function fetchCustomersSummary() {
  return apiFetch("/crm/customers-summary");
}
