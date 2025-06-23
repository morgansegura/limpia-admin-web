"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

import { ValueAddedServiceForm } from "@/components/features/jobs/value-added-service-form/value-added-service-form";

import { ValueAddedService } from "@/types/valye-added-services.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValueAddedServiceList } from "../value-added-service-list/value-added-service-list";

type Props = {
  jobId: string;
};

export function JobPage({ jobId }: Props) {
  const [valueServices, setValueServices] = useState<ValueAddedService[]>([]);

  useEffect(() => {
    async function fetchServices() {
      const data = await apiFetch<ValueAddedService[]>(
        `/jobs/${jobId}/value-added-services`,
      );
      setValueServices(data ?? []);
    }

    fetchServices();
  }, [jobId]);

  const handleNewService = (service: ValueAddedService) => {
    setValueServices((prev) => [...prev, service]);
  };

  return (
    <>
      <Card className="dashboard-layout-section">
        <CardHeader>
          <CardTitle>Value-Added Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {valueServices.map((service) => (
            <div key={service.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">
                  {service.estimatedMinutes} min — ${service.price}
                </p>
              </div>
              {/* You can add delete logic here too */}
            </div>
          ))}

          <h3>Value-Added Services</h3>
          <ValueAddedServiceForm
            jobId={jobId}
            onCreated={(newService) =>
              setValueServices((prev) => [
                ...prev,
                newService as ValueAddedService,
              ])
            }
          />
          <ValueAddedServiceList jobId={jobId} />
        </CardContent>
      </Card>
    </>
  );
}
