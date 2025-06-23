"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { createValueAddedService } from "@/lib/api/value-added-services";
import { VALUE_ADDED_SERVICE_TYPES } from "@/constants/value-added-service-types";

type Props = {
  jobId: string;
  onCreated: (newService: unknown) => void;
};

type FormState = Record<string, { selected: boolean; duration: number }>;

export function ValueAddedServiceForm({ jobId, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(() => {
    return VALUE_ADDED_SERVICE_TYPES.reduce((acc, name) => {
      acc[name] = { selected: false, duration: 10 };
      return acc;
    }, {} as FormState);
  });

  const [submitting, setSubmitting] = useState(false);

  const toggleService = (name: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: { ...prev[name], selected: !prev[name].selected },
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
      ([, val]) => val.selected && val.duration >= 0,
    );

    if (selectedItems.length === 0) {
      toast.error("Select at least one service with valid duration");
      return;
    }

    setSubmitting(true);
    try {
      const results = await Promise.all(
        selectedItems.map(([name, val]) =>
          createValueAddedService({ name, duration: val.duration, jobId }),
        ),
      );

      results.forEach(onCreated);
      toast.success("Services added");

      // Reset only selection, keep durations
      setForm((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key].selected = false;
        }
        return updated;
      });
    } catch {
      toast.error("Failed to add services");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VALUE_ADDED_SERVICE_TYPES.map((type) => (
          <div
            key={type}
            className="flex items-center justify-between gap-4 border p-3 rounded-md"
          >
            <div className="flex flex-col">
              <span className="font-medium">{type}</span>
              <Input
                type="number"
                min={0}
                value={form[type].duration}
                onChange={(e) => updateDuration(type, parseInt(e.target.value))}
                disabled={!form[type].selected}
                className="w-28 mt-2"
                placeholder="Minutes"
              />
            </div>

            <Switch
              checked={form[type].selected}
              onCheckedChange={() => toggleService(type)}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={submitting}>
        Add Selected Services
      </Button>
    </div>
  );
}
