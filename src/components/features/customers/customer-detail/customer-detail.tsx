"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, HouseIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

import { Customer, EditableCustomerField } from "@/types/customer.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSection } from "../../detail-section/detail-section";
import { FieldConfig } from "@/types/forms.types";

import TypographyMuted from "@/components/typography-muted";

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

  const customerDetailsFields: FieldConfig<
    Pick<Customer, EditableCustomerField>
  >[] = [
    {
      key: "name",
      label: "Name",
      type: "text",
    },
    {
      key: "email",
      label: "Email",
      type: "text",
    },
    {
      key: "phone",
      label: "Phone",
      type: "text",
    },
    {
      key: "street",
      label: "Street",
      type: "text",
    },
    {
      key: "unit",
      label: "Unit #",
      type: "text",
    },
    {
      key: "city",
      label: "City",
      type: "text",
    },
    {
      key: "state",
      label: "State",
      type: "text",
    },
  ];

  const customerLocationFields: FieldConfig<
    Pick<Customer, EditableCustomerField>
  >[] = [
    {
      key: "name",
      label: "Name",
      type: "text",
    },
    {
      key: "email",
      label: "Email",
      type: "text",
    },
    {
      key: "phone",
      label: "Phone",
      type: "text",
    },
    {
      key: "street",
      label: "Street",
      type: "text",
    },
    {
      key: "unit",
      label: "Unit #",
      type: "text",
    },
    {
      key: "city",
      label: "City",
      type: "text",
    },
    {
      key: "state",
      label: "State",
      type: "text",
    },
  ];

  const customerPreferenceFields: FieldConfig<
    Pick<Customer, EditableCustomerField>
  >[] = [
    {
      key: "preferredTimeOfDay",
      label: "Preferred Time",
      type: "radio",
      options: [
        { label: "Morning", value: "morning" },
        { label: "Afternoon", value: "afternoon" },
      ],
    },
    {
      key: "preferredDays",
      label: "Preferred Days",
      type: "multi-select",
      options: [
        { label: "Sunday", value: "Sunday" },
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
      ],
    },
    {
      key: "hasPets",
      label: "Has Pets",
      type: "switch",
    },
  ];

  return (
    <div className="customer-detail">
      <div className="dashboard-header-toolbar">
        {/* Breadcrubms */}
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
              <span>{customer["name"]}</span>
            </div>
          </div>
        </nav>

        <div className="dashboard-header-button-block">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          ) : (
            <>
              <Button onClick={handleSave} disabled={loading}>
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="dashboard-layout-heading-block">
        {/* Title Block */}
        <div className="dashboard-layout-title-block">
          <h2 className="dashboard-layout-title">{customer["name"]}</h2>

          <div className="dashboard-layout-description-small">
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
        <Card className="dashboard-layout-section">
          <CardHeader className="dashboard-layout-section-header">
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailSection
              form={form}
              isEditing={isEditing}
              onChange={updateField}
              fields={customerDetailsFields}
            />
          </CardContent>
        </Card>
        <Card className="dashboard-layout-section">
          <CardHeader className="dashboard-layout-section-header">
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailSection
              form={form}
              isEditing={isEditing}
              onChange={updateField}
              fields={customerLocationFields}
            />
          </CardContent>
        </Card>
        <Card className="dashboard-layout-section">
          <CardHeader className="dashboard-layout-section-header">
            <CardTitle>Preference Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailSection
              form={form}
              isEditing={isEditing}
              onChange={updateField}
              fields={customerPreferenceFields}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
