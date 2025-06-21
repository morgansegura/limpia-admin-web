"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Customer } from "@/types/customer.types";

export function CustomerAddressForm({
  customer,
  onSuccess,
}: {
  customer: Customer;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    street: customer.street,
    unit: customer.unit || "",
    city: customer.city,
    state: customer.state,
    zip: customer.zip,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await apiFetch(`/customers/${customer.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      {["street", "unit", "city", "state", "zip"].map((field) => (
        <div key={field}>
          <Label htmlFor={field}>
            {field[0].toUpperCase() + field.slice(1)}
          </Label>
          <Input
            name={field}
            value={form[field as keyof typeof form]}
            onChange={handleChange}
          />
        </div>
      ))}
      <Button onClick={handleSubmit} disabled={loading}>
        Save
      </Button>
    </div>
  );
}
