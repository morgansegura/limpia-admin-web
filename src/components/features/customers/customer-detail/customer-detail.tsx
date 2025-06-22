"use client";

import { useState } from "react";
import Link from "next/link";
import { HouseIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CustomerInfoSection } from "./sections/customer-info-section";
import { CustomerAddressSection } from "./sections/customer-address-section";
import { CustomerPreferencesSection } from "./sections/customer-preferences-section";
import { apiFetch } from "@/lib/api";

import { Customer } from "@/types/customer.types";

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

  const SpacerIcon = () => (
    <svg
      className="breadcrumb-spacer"
      viewBox="0 0 24 44"
      preserveAspectRatio="none"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
    </svg>
  );

  return (
    <div className="customer-detail overflow-y-auto h-full">
      <div className="dashboard-layout-heading-block">
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
              <SpacerIcon />
              <Link href="/customers" className="breadcrumb-item">
                <span>Customers</span>
              </Link>
            </div>
            <div className="breadcrumb">
              <SpacerIcon />
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

        {/* Title Block */}
        <div className="dashboard-layout-title-block">
          <h2 className="dashboard-title">{customer["name"]}</h2>
          <p className="dashboard-description">
            <strong>Customer ID:</strong> <span>{customer.id}</span>
          </p>
          <p className="dashboard-description">
            <strong>CRM ID:</strong> <span>{customer.crmId ?? ""}</span>
          </p>
        </div>
      </div>

      <div className="bg-neutral-100 grid grid-cols-3 overflow-y-scroll">
        <div className="h-full col-span-2 my-8 ml-6">
          <div className="border bg-white rounded-lg ">
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
        </div>
      </div>
      <div className="flex flex-col border">
        <div className="w-full h-92 bg-neutral-100 p-6">Stuff</div>
      </div>
    </div>
  );
}
