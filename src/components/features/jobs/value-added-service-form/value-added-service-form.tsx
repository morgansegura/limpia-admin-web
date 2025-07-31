"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { createValueAddedService } from "@/lib/api/value-added-services";
import { apiFetch } from "@/lib/api";

import { VALUE_ADDED_SERVICE_TYPES } from "@/constants/value-added-service-types";
import type { TValueAddedService } from "@/types/value-added-services.types";

type Props = {
  jobId: string;
  onCreated?: (newService: TValueAddedService) => void;
};

type ServiceEntry = {
  selected: boolean;
  duration: number;
  existingId?: string; // for updates
};

type FormState = Record<string, ServiceEntry>;

export function ValueAddedServiceForm({ jobId, onCreated }: Props) {
  const [form, setForm] = useState<FormState>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExisting() {
      try {
        const existing: TValueAddedService[] =
          (await apiFetch(`/jobs/${jobId}/value-added-services`)) ?? [];

        const mapped: FormState = VALUE_ADDED_SERVICE_TYPES.reduce(
          (acc, name) => {
            const match = existing.find((item) => item.name === name);
            acc[name] = {
              selected: Boolean(match),
              duration: match?.duration ?? 10,
              existingId: match?.id ?? undefined,
            };
            return acc;
          },
          {} as FormState,
        );

        setForm(mapped);
      } catch {
        toast.error("Failed to load existing services");
      } finally {
        setLoading(false);
      }
    }

    loadExisting();
  }, [jobId]);

  const toggleService = (name: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        selected: !prev[name].selected,
      },
    }));
  };

  const updateDuration = (name: string, duration: number) => {
    setForm((prev) => ({
      ...prev,
      [name]: { ...prev[name], duration },
    }));
  };

  const handleSubmit = async () => {
    const selectedItems = Object.entries(form).filter(
      ([, val]) => val.selected && val.duration > 0,
    );

    if (selectedItems.length === 0) {
      toast.error("Select at least one service with valid duration");
      return;
    }

    setSubmitting(true);

    try {
      const results = await Promise.all(
        selectedItems.map(([name, val]) =>
          createValueAddedService({
            name,
            duration: val.duration,
            jobId,
          }),
        ),
      );

      if (onCreated) {
        results
          .filter((s): s is TValueAddedService => s !== null)
          .forEach(onCreated);
      }
      toast.success("Services updated");

      // Reset only selection
      setForm((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key].selected = false;
        }
        return updated;
      });
    } catch {
      toast.error("Failed to update services");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-muted">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VALUE_ADDED_SERVICE_TYPES.map((type) => (
          <div key={type} className="flex flex-col gap-2 border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Label>{type}</Label>
              <Switch
                checked={form[type]?.selected}
                onCheckedChange={() => toggleService(type)}
              />
            </div>

            <Input
              type="number"
              min={0}
              step={5}
              disabled={!form[type]?.selected}
              value={form[type]?.duration ?? 10}
              onChange={(e) =>
                updateDuration(type, parseInt(e.target.value, 10))
              }
              className="w-full"
              placeholder="Duration (minutes)"
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={submitting}>
        Save Services
      </Button>
    </div>
  );
}
