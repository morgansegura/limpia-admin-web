import { apiFetch } from "@/lib/api";
import { TValueAddedService } from "@/types/value-added-services.types";

// Create a new value-added service
export async function createValueAddedService(input: {
  name: string;
  duration: number;
  jobId: string;
}): Promise<TValueAddedService> {
  return apiFetch("/value-added-services", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      duration: input.duration,
      estimatedMinutes: input.duration,
      jobId: input.jobId,
    }),
  });
}

// Update a value-added service
export async function updateValueAddedService(
  id: string,
  data: Partial<{ name: string; duration: number }>,
): Promise<TValueAddedService> {
  return apiFetch(`/value-added-services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Delete a value-added service
export async function deleteValueAddedService(id: string): Promise<void> {
  return apiFetch(`/value-added-services/${id}`, {
    method: "DELETE",
  });
}
