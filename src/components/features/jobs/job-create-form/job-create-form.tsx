"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { CLEANING_TYPE_OPTIONS } from "@/types/customer.types";
import { ValueAddedServiceForm } from "../value-added-service-form/value-added-service-form";
import { ValueAddedService } from "@/types/value-added-services.types";
import { User } from "@/types/user.types";
import { Customer } from "@/types/customer.types";
import { Job } from "@/types/job.types";
import { Combobox } from "@/components/ui/combobox";

const DISCOUNT_PERCENT_OPTIONS = ["5", "10", "15", "20"]; // Cap control

export function JobCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [valueServices, setValueServices] = useState<ValueAddedService[]>([]);
  const isRecurringFromEstimate = searchParams.get("isRecurring") === "true";

  const [form, setForm] = useState({
    title: "",
    customerId: "",
    price: 0,
    assignedToId: "",
    scheduledAt: new Date().toISOString().slice(0, 16),
    cleaningType: searchParams.get("cleaningType") ?? "BASE",
    street: searchParams.get("street") ?? "",
    city: searchParams.get("city") ?? "",
    state: searchParams.get("state") ?? "",
    zip: searchParams.get("zip") ?? "",
    isRecurring: isRecurringFromEstimate,
    squareFootage: 0,
    recurrenceType: "",
    recurrenceEndDate: "",
    discountAmount: "",
    discountPercent: "",
    usedReferral: false,
    giftCardCode: "",
    manualPriceOverride: "",
    internalNotes: "",
    customerNotes: "",
  });

  const [estimate] = useState<number | null>(
    Number(searchParams.get("estimatedPrice")) || null,
  );

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [custs, users] = await Promise.all([
        apiFetch<Customer[]>("/customers"),
        apiFetch<User[]>("/users"),
      ]);
      setCustomers(custs || []);
      setUsers(users || []);
    }
    loadData();
  }, []);

  const handleChange = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch<Job>("/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          squareFootage: Number(form.squareFootage),
          discountAmount: form.discountAmount
            ? Number(form.discountAmount)
            : undefined,
          discountPercent: form.discountPercent
            ? Number(form.discountPercent)
            : undefined,
          manualPriceOverride: form.manualPriceOverride
            ? Number(form.manualPriceOverride)
            : undefined,
          recurrenceEndDate: form.recurrenceEndDate || undefined,
          recurrenceType: form.isRecurring ? form.recurrenceType : undefined,
          valueAddedServices: valueServices,
        }),
      });
      toast.success("Job created");
      router.push(`/jobs/${res?.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedPrice = () => {
    let base = estimate ?? 0;
    if (form.discountPercent)
      base -= (base * Number(form.discountPercent)) / 100;
    if (form.discountAmount) base -= Number(form.discountAmount);
    if (form.manualPriceOverride) return Number(form.manualPriceOverride);
    return base;
  };

  return (
    <div>
      <div className="dashboard-header-toolbar">
        <h2 className="dashboard-layout-title">Create New Job</h2>

        <Button onClick={handleSubmit} disabled={submitting}>
          Create Job
        </Button>
      </div>

      <div className="py-6 px-4 lg:px-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Combobox
              items={customers.map((c) => ({
                label: `${c.name} (${c.email})`,
                value: c.id,
              }))}
              value={form.customerId}
              onChange={(id) => handleChange("customerId", id)}
              placeholder="Search customer..."
            />

            <Select
              value={form.assignedToId}
              onValueChange={(val) => handleChange("assignedToId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign To" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => handleChange("scheduledAt", e.target.value)}
            />

            <Select
              value={form.cleaningType}
              onValueChange={(val) => handleChange("cleaningType", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cleaning Type" />
              </SelectTrigger>
              <SelectContent>
                {CLEANING_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Street Address"
              value={form.street}
              onChange={(e) => handleChange("street", e.target.value)}
            />
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
            <Input
              placeholder="State"
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
            <Input
              placeholder="Zip"
              value={form.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
            />

            <Input
              placeholder="Square Footage"
              type="number"
              value={form.squareFootage}
              onChange={(e) => handleChange("squareFootage", e.target.value)}
            />

            <div className="flex items-center space-x-2">
              <Switch
                checked={form.isRecurring}
                onCheckedChange={(val) => handleChange("isRecurring", val)}
              />
              <label>Recurring Job</label>
            </div>

            {form.isRecurring && (
              <>
                <Select
                  value={form.recurrenceType}
                  onValueChange={(val) => handleChange("recurrenceType", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Recurrence Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  placeholder="Recurrence End Date"
                  value={form.recurrenceEndDate}
                  onChange={(e) =>
                    handleChange("recurrenceEndDate", e.target.value)
                  }
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promotions & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={form.discountPercent}
              onValueChange={(val) => handleChange("discountPercent", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="% Discount" />
              </SelectTrigger>
              <SelectContent>
                {DISCOUNT_PERCENT_OPTIONS.map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Flat Discount ($)"
              value={form.discountAmount}
              onChange={(e) => handleChange("discountAmount", e.target.value)}
            />

            <Input
              placeholder="Gift Card Code"
              value={form.giftCardCode}
              onChange={(e) => handleChange("giftCardCode", e.target.value)}
            />

            <Input
              type="number"
              placeholder="Manual Price Override"
              value={form.manualPriceOverride}
              onChange={(e) =>
                handleChange("manualPriceOverride", e.target.value)
              }
            />

            <div className="flex items-center space-x-2">
              <Switch
                checked={form.usedReferral}
                onCheckedChange={(val) => handleChange("usedReferral", val)}
              />
              <label>Customer Used Referral</label>
            </div>

            <div className="md:col-span-2">
              <strong>Final Estimated Price:</strong> $
              {calculatedPrice().toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <Textarea
              placeholder="Internal Notes"
              value={form.internalNotes}
              onChange={(e) => handleChange("internalNotes", e.target.value)}
            />
            <Textarea
              placeholder="Customer Notes"
              value={form.customerNotes}
              onChange={(e) => handleChange("customerNotes", e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Value-Added Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ValueAddedServiceForm
              jobId="new-job-temp"
              onCreated={(s) =>
                setValueServices((prev) => [...prev, s as ValueAddedService])
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
