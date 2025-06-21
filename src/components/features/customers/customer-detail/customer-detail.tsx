"use client";

import { useState } from "react";
import { Customer } from "@/types/customer.types";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CustomerInfoSection } from "./sections/customer-info-section";
import { CustomerAddressSection } from "./sections/customer-address-section";
import { CustomerPreferencesSection } from "./sections/customer-preferences-section";

interface Props {
  customer: Customer;
}

export function CustomerDetail({ customer: initialCustomer }: Props) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [form, setForm] = useState({ ...initialCustomer });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    await apiFetch(`/customers/${customer.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
    setCustomer(form);
    setIsEditing(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setForm(customer);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Detail</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              Save
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <CustomerInfoSection
        form={form}
        isEditing={isEditing}
        onChange={updateField}
      />
      <CustomerAddressSection
        form={form}
        isEditing={isEditing}
        onChange={updateField}
      />
      <CustomerPreferencesSection
        form={form}
        isEditing={isEditing}
        onChange={updateField}
      />
    </div>
  );
}
