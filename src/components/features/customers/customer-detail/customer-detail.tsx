"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, HouseIcon } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DetailSection } from "@/components/features/detail-section/detail-section";
import {
  customerAccessFields,
  customerBillingFields,
  customerDetailsFields,
  customerEstimateFields,
  customerInternalFields,
  customerLocationFields,
  customerPreferenceFields,
} from "./details";

import { TCustomer } from "@/types/customer.types";
import { useRouter } from "next/navigation";

interface Props {
  customer: TCustomer;
}

export function CustomerDetail({ customer: initialCustomer }: Props) {
  const [customer, setCustomer] = useState<TCustomer>(initialCustomer);
  const [form, setForm] = useState<TCustomer>({ ...initialCustomer });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();

  const updateField = (key: keyof TCustomer, value: unknown) => {
    setForm({ ...form, [key]: value });
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(customer);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await apiFetch<TCustomer>(`/customers/${customer.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      if (!updated) {
        toast.error("Failed to update customer");
        return;
      }

      setCustomer(updated);
      setForm(updated);
      setIsEditing(false);
      toast.success("Customer updated successfully");
    } catch (error) {
      toast.error("Failed to update customer");
      console.error("Error updating customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer? This action cannot be undone.",
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await apiFetch(`/customers/${customer.id}`, {
        method: "DELETE",
      });
      toast.success("Customer deleted successfully");
      router.replace("/customers");
    } catch (error) {
      toast.error("Failed to delete customer");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(customer);
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
            <Link href="/customers" className="breadcrumb-item">
              <span>Customers</span>
            </Link>
          </div>
          <div className="breadcrumb">
            <ChevronRightIcon className="breadcrumb-icon" />
            <div className="breadcrumb-item">
              <span>
                {customer.firstName} {customer.lastName}
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
            {customer.firstName} {customer.lastName}
          </h2>
          <div className="dashboard-layout-description-small -mb-1.5">
            <span>Customer ID:</span>
            <ChevronRightIcon className="w-4" />
            {customer.id}
          </div>
          <div className="dashboard-layout-description-small">
            <span>CRM ID:</span>
            <ChevronRightIcon className="w-4" />
            {customer.crmId ?? "N/A"}
          </div>
        </div>
      </div>

      <div className="dashboard-layout-sections">
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="contact">Customer Information</TabsTrigger>
            <TabsTrigger value="property">Property Details</TabsTrigger>
            <TabsTrigger value="account">Account Information</TabsTrigger>
          </TabsList>
          <TabsContent value="contact" className="grid gap-4">
            {[
              { fields: customerDetailsFields, title: "Contact Information" },
              { fields: customerPreferenceFields, title: "Preferences" },
              { fields: customerEstimateFields, title: "Cleaning & Estimate" },
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
              { fields: customerLocationFields, title: "Property Details" },
              { fields: customerAccessFields, title: "Access & Home Notes" },
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
          <TabsContent value="account" className="grid gap-4">
            {[
              { fields: customerBillingFields, title: "Billing" },
              { fields: customerInternalFields, title: "Internal / CRM" },
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
        </Tabs>

        <div className="flex w-full justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}
