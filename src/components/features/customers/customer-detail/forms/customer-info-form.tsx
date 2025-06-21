"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { apiFetch } from "@/lib/api";

import { Customer } from "@/types/customer.types";

export function CustomerInfoForm({
  customer,
  onSuccess,
}: {
  customer: Customer;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || "",
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
      <div>
        <Label htmlFor="name">Name</Label>
        <Input name="name" value={form.name} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input name="email" value={form.email} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input name="phone" value={form.phone} onChange={handleChange} />
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        Save
      </Button>
    </div>
  );
}
