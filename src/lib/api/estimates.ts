import { apiFetch } from "@/lib/api";
import type { TEstimate } from "@/types/estimate.types";

export function fetchEstimates(): Promise<TEstimate[]> {
  return apiFetch("/estimates");
}

export function getEstimateById(id: string): Promise<TEstimate> {
  return apiFetch(`/estimates/${id}`);
}

export function createEstimate(data: Partial<TEstimate>) {
  return apiFetch<TEstimate>("/estimates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteEstimate(id: string) {
  return apiFetch(`/estimates/${id}`, {
    method: "DELETE",
  });
}
