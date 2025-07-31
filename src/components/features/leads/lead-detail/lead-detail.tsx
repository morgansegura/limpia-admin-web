"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, HouseIcon } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DetailSection } from "@/components/features/detail-section/detail-section";
import {
  leadDetailsFields,
  leadLocationFields,
  leadEstimateFields,
  customerAccessFields,
  customerPreferenceFields,
} from "./details";

import type { TLead } from "@/types/lead.types";

interface Props {
  customer: TLead;
}

export function LeadDetail({ customer: initialLead }: Props) {
  const [lead, setLead] = useState<TLead>(initialLead);
  const [form, setForm] = useState<TLead>({ ...initialLead });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();

  const updateField = (key: keyof TLead, value: unknown) => {
    setForm({ ...form, [key]: value });
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(lead);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await apiFetch<TLead>(`/leads/${lead.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      if (!updated) {
        toast.error("Failed to update lead");
        return;
      }

      setLead(updated);
      setForm(updated);
      setIsEditing(false);
      toast.success("Lead updated successfully");
    } catch (error) {
      toast.error("Failed to update lead");
      console.error("Error updating lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this lead? This action cannot be undone.",
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await apiFetch(`/leads/${lead.id}`, {
        method: "DELETE",
      });
      toast.success("Lead deleted successfully");
      router.replace("/leads");
    } catch (error) {
      toast.error("Failed to delete lead");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(lead);
    setIsEditing(false);
  };

  return (
    <div className="customer-detail">
      <div className="dashboard-header-toolbar">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <div className="breadcrumb">
            <Link href="/dashboard" className="breadcrumb-item">
              <HouseIcon className="breadcrumb-icon" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
          <div className="breadcrumb">
            <ChevronRightIcon className="breadcrumb-icon" />
            <Link href="/leads" className="breadcrumb-item">
              <span>Leads</span>
            </Link>
          </div>
          <div className="breadcrumb">
            <ChevronRightIcon className="breadcrumb-icon" />
            <div className="breadcrumb-item">
              <span>
                {lead.firstName} {lead.lastName}
              </span>
            </div>
          </div>
        </nav>

        <div className="dashboard-header-button-block">
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading || !isDirty}
                >
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-layout-heading-block">
        <div className="dashboard-layout-title-block">
          <h2 className="dashboard-layout-title">
            {lead.firstName} {lead.lastName}
          </h2>
          <div className="dashboard-layout-description-small -mb-1.5">
            <span>Lead ID:</span>
            <ChevronRightIcon className="w-4" />
            {lead.id}
          </div>
        </div>
      </div>

      <div className="dashboard-layout-sections">
        <Tabs defaultValue="contact">
          <TabsList>
            <TabsTrigger value="contact">Contact Information</TabsTrigger>
            <TabsTrigger value="property">Property Details</TabsTrigger>
            <TabsTrigger value="estimate">Estimate</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="grid gap-4">
            {[
              { fields: leadDetailsFields, title: "Contact" },
              { fields: customerPreferenceFields, title: "Preferences" },
            ].map(({ fields, title }, index: number) => (
              <Card className="dashboard-layout-section" key={index}>
                <CardHeader className="dashboard-layout-section-header">
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DetailSection
                    form={form}
                    isEditing={isEditing}
                    onChange={updateField}
                    fields={fields}
                  />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="property" className="grid gap-4">
            {[
              { fields: leadLocationFields, title: "Property" },
              { fields: customerAccessFields, title: "Access Notes" },
            ].map(({ fields, title }, index: number) => (
              <Card className="dashboard-layout-section" key={index}>
                <CardHeader className="dashboard-layout-section-header">
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DetailSection
                    form={form}
                    isEditing={isEditing}
                    onChange={updateField}
                    fields={fields}
                  />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="estimate" className="grid gap-4">
            <Card className="dashboard-layout-section">
              <CardHeader className="dashboard-layout-section-header">
                <CardTitle>Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailSection
                  form={form}
                  isEditing={isEditing}
                  onChange={updateField}
                  fields={leadEstimateFields}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex w-full justify-end mt-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Lead
          </Button>
        </div>
      </div>
    </div>
  );
}
