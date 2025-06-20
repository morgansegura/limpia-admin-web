"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { Label } from "@/components/ui/label";

import type { Customer } from "@/types/customer.types";

type Props = {
  customer?: Customer | null;
  onSuccess: () => void;
};

export function CustomerForm({ customer, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (customer?.id) {
        await apiFetch(`/customers/${customer.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await apiFetch(`/customers`, {
          method: "POST",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
        });
      }

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to save customer");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="name">Last Name</Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : customer ? "Update" : "Create"}
      </Button>
    </form>
  );
}
