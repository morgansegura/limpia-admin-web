"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { createValueAddedService } from "@/lib/api/value-added-services";

import { MultiSelectServiceList } from "@/components/features/inputs/multi-select-service-list/multi-select-service-list";

type Props = {
  jobId: string;
  onCreated: (newService: unknown) => void;
};

export function ValueAddedServiceForm({ jobId, onCreated }: Props) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      toast.error("Select at least one service");
      return;
    }

    setSubmitting(true);
    try {
      const results = await Promise.all(
        selectedServices.map((name) =>
          createValueAddedService({ name, duration, jobId }),
        ),
      );

      results.forEach(onCreated);
      toast.success("Services added");
      setSelectedServices([]);
      setDuration(10);
    } catch {
      toast.error("Failed to add services");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {selectedServices.length > 0
              ? `${selectedServices.length} selected`
              : "Select services"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <MultiSelectServiceList
            selected={selectedServices}
            onChange={setSelectedServices}
          />
        </PopoverContent>
      </Popover>

      <Input
        type="number"
        min={0}
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value))}
        placeholder="Duration (minutes)"
      />

      <Button onClick={handleSubmit} disabled={submitting}>
        Add Selected
      </Button>
    </div>
  );
}
