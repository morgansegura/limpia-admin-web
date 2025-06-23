"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";

import { CLEANING_TYPE_OPTIONS, Customer } from "@/types/customer.types";
import { User } from "@/types/user.types";
import { ValueAddedService } from "@/types/valye-added-services.types";
import { Job } from "@/types/job.types";
import { ValueAddedServiceForm } from "../value-added-service-form/value-added-service-form";

export function JobCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [valueServices, setValueServices] = useState<ValueAddedService[]>([]);

  const [form, setForm] = useState({
    customerId: "",
    assignedToId: "",
    street: searchParams.get("street") ?? "",
    city: searchParams.get("city") ?? "",
    state: searchParams.get("state") ?? "",
    zip: searchParams.get("zip") ?? "",
    cleaningType: searchParams.get("cleaningType") ?? "BASE",
    squareFootage: 0,
    price: searchParams.get("estimatedPrice")
      ? Number(searchParams.get("estimatedPrice"))
      : undefined,
    scheduledAt: new Date().toISOString().slice(0, 16),
    isRecurring: searchParams.get("isRecurring") === "true",
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

  const handleChange = (key: string, value: any) => {
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
          price: form.price ?? undefined,
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

  return (
    <div className="space-y-4">
      <div className="dashboard-header-toolbar">
        <h2 className="dashboard-layout-title">Create New Job</h2>
      </div>
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
            onChange={(val) => handleChange("customerId", val)}
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
            placeholder="Square Footage"
            type="number"
            value={form.squareFootage}
            onChange={(e) => handleChange("squareFootage", e.target.value)}
          />

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.isRecurring}
              onCheckedChange={(val) => handleChange("isRecurring", val)}
              id="recurring-switch"
            />
            <label htmlFor="recurring-switch">Recurring Job</label>
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

          {form.price && (
            <div className="md:col-span-2">
              <strong>Estimated Price:</strong> ${form.price}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promotions & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Flat Discount"
            value={form.discountAmount}
            onChange={(e) => handleChange("discountAmount", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Percent Discount"
            value={form.discountPercent}
            onChange={(e) => handleChange("discountPercent", e.target.value)}
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
            <Checkbox
              checked={form.usedReferral}
              onCheckedChange={(val) => handleChange("usedReferral", val)}
            />
            <label>Customer Used Referral</label>
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

      <Button onClick={handleSubmit} disabled={submitting}>
        Create Job
      </Button>
    </div>
  );
}
