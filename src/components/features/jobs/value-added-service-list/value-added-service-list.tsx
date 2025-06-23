"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, X, Check } from "lucide-react";

import { ValueAddedService } from "@/types/valye-added-services.types";
import {
  deleteValueAddedService,
  updateValueAddedService,
} from "@/lib/api/value-added-services";
import { apiFetch } from "@/lib/api";

type Props = {
  jobId: string;
};

export function ValueAddedServiceList({ jobId }: Props) {
  const [services, setServices] = useState<ValueAddedService[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState<number>(10);

  useEffect(() => {
    async function fetch() {
      const data = await apiFetch<ValueAddedService[]>(
        `/jobs/${jobId}/value-added-services`,
      );
      setServices(data ?? []);
    }

    fetch();
  }, [jobId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      await deleteValueAddedService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  const startEdit = (service: ValueAddedService) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditDuration(service.duration);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDuration(10);
  };

  const saveEdit = async (id: string) => {
    try {
      const updated = (await updateValueAddedService(id, {
        name: editName,
        duration: editDuration,
      })) as ValueAddedService;
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated } : s)),
      );
      toast.success("Updated");
      cancelEdit();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex justify-between items-center gap-2"
        >
          {editingId === service.id ? (
            <div className="flex flex-col gap-1 w-full">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <Input
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(parseInt(e.target.value))}
              />
            </div>
          ) : (
            <div className="w-full">
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-muted-foreground">
                {service.estimatedMinutes} min — ${service.price}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {editingId === service.id ? (
              <>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => saveEdit(service.id)}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={cancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => startEdit(service)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
