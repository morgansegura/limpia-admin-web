"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Customer } from "@/types/customer.types";
import { toast } from "sonner";
import { DetailSection } from "@/components/features/detail-section/detail-section";
import {
  customerDetailsFields,
  customerLocationFields,
  customerPreferenceFields,
} from "@/components/features/customers/customer-detail/details";

const initialForm: Partial<Customer> = {
  name: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  preferredDays: [],
  cleaningType: "BASE",
};

export function CustomerNewPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Customer>>(initialForm);
  const [loading, setLoading] = useState(false);

  const updateField = (key: keyof Customer, value: unknown) => {
    setForm({ ...form, [key]: value });
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const created = await apiFetch<Customer>("/leads", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (
        !form.name ||
        !form.email ||
        !form.street ||
        !form.state ||
        !form.zip
      ) {
        toast.error("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      if (!created) {
        toast.error("Failed to create customer");
        return;
      }

      toast.success("Customer created");
      router.push(`/leads/${created.id}`);
    } catch (error) {
      toast.error("Failed to create customer");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/leads");
  };

  return (
    <div className="customer-create">
      <div className="dashboard-header-toolbar">
        <h2 className="dashboard-layout-title">New Customer</h2>
        <div className="dashboard-header-button-block">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            Save
          </Button>
        </div>
      </div>

      <div className="dashboard-layout-sections">
        <Card className="dashboard-layout-section">
          <CardHeader>
            <CardTitle>Contact Info</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailSection
              form={form}
              isEditing={true}
              onChange={updateField}
              fields={customerDetailsFields}
            />
          </CardContent>
        </Card>

        <Card className="dashboard-layout-section">
          <CardHeader>
            <CardTitle>Property Info</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailSection
              form={form}
              isEditing={true}
              onChange={updateField}
              fields={customerLocationFields}
            />
          </CardContent>
        </Card>

        <Card className="dashboard-layout-section">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailSection
              form={form}
              isEditing={true}
              onChange={updateField}
              fields={customerPreferenceFields}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
