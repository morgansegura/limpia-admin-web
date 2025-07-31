import { apiFetch } from "@/lib/api";

import type { TLead, TLeadStatus } from "@/types/lead.types";

// GET: all leads
export function fetchLeads(): Promise<TLead[]> {
  return apiFetch("/leads");
}

// GET: one lead by ID
export function getLeadById(id: string): Promise<TLead> {
  return apiFetch(`/leads/${id}`);
}

// POST: create a new lead
export function createLead(data: Partial<TLead>): Promise<TLead> {
  return apiFetch("/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT: update lead by ID
export function updateLead(id: string, data: Partial<TLead>): Promise<TLead> {
  return apiFetch(`/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// PATCH: archive a lead
export function archiveLead(id: string): Promise<void> {
  return apiFetch(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "ARCHIVED" satisfies TLeadStatus,
      isArchived: true,
    }),
  });
}

// DELETE: delete lead by ID
export function deleteLead(id: string): Promise<void> {
  return apiFetch(`/leads/${id}`, {
    method: "DELETE",
  });
}
