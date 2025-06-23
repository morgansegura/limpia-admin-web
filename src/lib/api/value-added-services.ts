import { apiFetch } from "@/lib/api";
import { ValueAddedService } from "@/types/valye-added-services.types";

export async function createValueAddedService(
  data: Partial<ValueAddedService>,
) {
  return await apiFetch<ValueAddedService>("/value-added-services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getValueAddedServices(jobId: string) {
  return await apiFetch<ValueAddedService[]>(
    `/value-added-services?jobId=${jobId}`,
    {},
    { throwOnError: false },
  );
}
