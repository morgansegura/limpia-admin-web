import { apiFetch } from "@/lib/api";
import { ValueAddedService } from "@/types/value-added-services.types";

export async function createValueAddedService(input: {
  name: string;
  duration: number;
  jobId: string;
}) {
  return apiFetch<ValueAddedService>("/value-added-services", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      duration: input.duration,
      estimatedMinutes: input.duration,
      jobId: input.jobId,
    }),
  });
}

export async function deleteValueAddedService(id: string) {
  return apiFetch(`/value-added-services/${id}`, {
    method: "DELETE",
  });
}

export async function updateValueAddedService(
  id: string,
  data: Partial<{
    name: string;
    duration: number;
  }>,
) {
  return apiFetch(`/value-added-services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
