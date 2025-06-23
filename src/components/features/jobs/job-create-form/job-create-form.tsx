"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLEANING_TYPE_OPTIONS } from "@/types/customer.types";
import { ValueAddedServiceForm } from "../value-added-service-form/value-added-service-form";
import { ValueAddedService } from "@/types/valye-added-services.types";
import { apiFetch } from "@/lib/api";
import { Job } from "@/types/job.types";
import { CustomerSearchSelect } from "@/components/features/customers/customer-search-selector/customer-search-selector";

export function JobCreateForm() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    customerId: "",
    street: searchParams.get("street") ?? "",
    city: searchParams.get("city") ?? "",
    state: searchParams.get("state") ?? "",
    zip: searchParams.get("zip") ?? "",
    cleaningType: searchParams.get("cleaningType") ?? "BASE",
    scheduledDate: "",
  });

  const [valueServices, setValueServices] = useState<ValueAddedService[]>([]);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEstimate = async () => {
    try {
      const result = await apiFetch<{
        price: number;
      }>("/utilities/estimate", {
        method: "POST",
        body: JSON.stringify({
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          cleaningType: form.cleaningType,
        }),
      });

      if (result?.price) {
        setEstimate(result.price);
      } else {
        toast.error("Could not estimate price");
      }
    } catch {
      toast.error("Estimation failed");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const job = await apiFetch<Job>("/jobs", {
        method: "POST",
        body: JSON.stringify({
          customerId: form.customerId,
          cleaningType: form.cleaningType,
          scheduledDate: form.scheduledDate,
          valueAddedServices: valueServices,
        }),
      });

      toast.success("Job created");
      window.location.href = `/jobs/${job?.id}`;
    } catch {
      toast.error("Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="dashboard-header-toolbar">
        <h2 className="dashboard-layout-title">Create New Job</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomerSearchSelect
            value={form.customerId}
            onSelect={(customer) =>
              setForm((prev) => ({
                ...prev,
                customerId: customer.id,
                street: customer.street,
                city: customer.city,
                state: customer.state,
                zip: customer.zip,
              }))
            }
          />
          <Input
            type="datetime-local"
            value={form.scheduledDate}
            onChange={(e) => handleChange("scheduledDate", e.target.value)}
          />
          <Select
            value={form.cleaningType}
            onValueChange={(value) => handleChange("cleaningType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cleaning Type" />
            </SelectTrigger>
            <SelectContent>
              {CLEANING_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={handleEstimate}>
            Estimate Price
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Value-Added Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ValueAddedServiceForm
            jobId={"new-job-temp"}
            onCreated={(service) =>
              setValueServices((prev) => [
                ...prev,
                service as ValueAddedService,
              ])
            }
          />
        </CardContent>
      </Card>

      {estimate && (
        <Card>
          <CardHeader>
            <CardTitle>Estimated Price: ${estimate}</CardTitle>
          </CardHeader>
        </Card>
      )}

      <Button onClick={handleSubmit} disabled={submitting}>
        Create Job
      </Button>
    </div>
  );
}
