import { useEffect, useState } from "react";
import { getValueAddedServices } from "@/lib/api/value-added-services";
import { ValueAddedService } from "@/types/valye-added-services.types";
import { apiFetch } from "@/lib/api";

type Props = {
  jobId: string;
};

export function ValueAddedServiceList({ jobId }: Props) {
  const [services, setServices] = useState<ValueAddedService[]>([]);

  useEffect(() => {
    async function fetch() {
      const data = await apiFetch<ValueAddedService[]>(
        `/jobs/${jobId}/value-added-services`,
      );
      setServices(data ?? []);
    }

    fetch();
  }, [jobId]);

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <div key={service.id} className="flex justify-between items-center">
          <div>
            <p className="font-medium">{service.name}</p>
            <p className="text-sm text-muted-foreground">
              {service.estimatedMinutes} min — ${service.price}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
