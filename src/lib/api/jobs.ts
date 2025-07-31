import { apiFetch } from "@/lib/api";
import type { TJob } from "@/types/job.types";

export function fetchJobs(): Promise<TJob[]> {
  return apiFetch("/jobs");
}

export function getJobById(id: string): Promise<TJob> {
  return apiFetch(`/jobs/${id}`);
}

export function createJob(data: Partial<TJob>) {
  return apiFetch<TJob>("/jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateJob(id: string, data: Partial<TJob>) {
  return apiFetch<TJob>(`/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteJob(id: string) {
  return apiFetch(`/jobs/${id}`, {
    method: "DELETE",
  });
}
