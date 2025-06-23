"use client";

import { useState } from "react";
import { createValueAddedService } from "@/lib/api/value-added-services";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  jobId: string;
  onCreated: Function;
};

export function ValueAddedServiceForm({ jobId, onCreated }: Props) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createValueAddedService({ name, duration, jobId });
      toast.success("Service added");
      setName("");
      setDuration(10);
      onCreated();
    } catch (err) {
      toast.error("Failed to add service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Service name"
      />
      <Input
        type="number"
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value))}
        placeholder="Duration (minutes)"
      />
      <Button onClick={handleSubmit} disabled={submitting}>
        Add Service
      </Button>
    </div>
  );
}
