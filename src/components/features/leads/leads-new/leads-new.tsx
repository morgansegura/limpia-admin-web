"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSection } from "@/components/features/detail-section/detail-section";

import type { TLead } from "@/types/lead.types";
import {
  leadDetailsFields,
  leadLocationFields,
  customerPreferenceFields,
} from "@/components/features/leads/lead-detail/details";

const initialForm: Partial<TLead> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  preferredDays: [],
  cleaningType: "BASE",
};

export function LeadNewPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<TLead>>(initialForm);
  const [loading, setLoading] = useState(false);

  const updateField = (key: keyof TLead, value: unknown) => {
    setForm({ ...form, [key]: value });
  };

  const handleCreate = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.street ||
      !form.state ||
      !form.zip
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const created = await apiFetch<TLead>("/leads", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!created) {
        toast.error("Failed to create lead");
        return;
      }

      toast.success("Lead created");
      router.push(`/leads/${created.id}`);
    } catch (error) {
      toast.error("Failed to create lead");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/leads");
  };

  return (
    <div className="lead-create">
      <div className="dashboard-header-toolbar">
        <h2 className="dashboard-layout-title">New Lead</h2>
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
              fields={leadDetailsFields}
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
              fields={leadLocationFields}
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
