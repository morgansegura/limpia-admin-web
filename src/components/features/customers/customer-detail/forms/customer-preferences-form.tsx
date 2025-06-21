"use client";

import { useState } from "react";
import { Customer } from "@/types/customer.types";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function CustomerPreferencesForm({
  customer,
  onSuccess,
}: {
  customer: Customer;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    preferredTimeOfDay: customer.preferredTimeOfDay || "",
    preferredDays: (customer.preferredDays || []).join(", "),
    hasPets: customer.hasPets || false,
    suppliesProvidedByCustomer: customer.suppliesProvidedByCustomer || false,
    rotationSystemOptIn: customer.rotationSystemOptIn || false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSwitch = (key: keyof typeof form) => {
    setForm({ ...form, [key]: !form[key] });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await apiFetch(`/customers/${customer.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...form,
        preferredDays: form.preferredDays.split(",").map((d) => d.trim()),
      }),
    });
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="preferredTimeOfDay">Preferred Time of Day</Label>
        <Input
          name="preferredTimeOfDay"
          value={form.preferredTimeOfDay}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="preferredDays">Preferred Days (comma-separated)</Label>
        <Input
          name="preferredDays"
          value={form.preferredDays}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Has Pets</Label>
        <Switch
          checked={form.hasPets}
          onCheckedChange={() => handleSwitch("hasPets")}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Customer Provides Supplies</Label>
        <Switch
          checked={form.suppliesProvidedByCustomer}
          onCheckedChange={() => handleSwitch("suppliesProvidedByCustomer")}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Rotation System Opt-In</Label>
        <Switch
          checked={form.rotationSystemOptIn}
          onCheckedChange={() => handleSwitch("rotationSystemOptIn")}
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        Save
      </Button>
    </div>
  );
}
