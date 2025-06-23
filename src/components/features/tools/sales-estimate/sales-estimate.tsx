"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { CLEANING_TYPE_OPTIONS, Customer } from "@/types/customer.types";
import { Switch } from "@/components/ui/switch";

export default function SalesEstimatePage() {
  const router = useRouter();

  const [form, setForm] = useState<
    Partial<Customer> & { isRecurring?: boolean }
  >({
    street: "",
    city: "",
    state: "",
    zip: "",
    cleaningType: "BASE",
    isRecurring: false,
  });

  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<null | {
    squareFootage: number;
    price: number;
    source: string;
  }>(null);

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const result = await apiFetch<{
        price: number;
        squareFootage: number;
        source: string;
      }>("/utilities/estimate", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!result?.price) {
        toast.error("Could not fetch estimate");
        return;
      }

      setEstimate({
        squareFootage: result.squareFootage,
        price: result.price,
        source: result.source,
      });

      toast.success("Estimate ready!");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching estimate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sales-estimate-page space-y-4">
      <div className="dashboard-header-toolbar">
        <h2 className="dashboard-layout-title">Sales Estimate Tool</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimate Cleaning Price</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Select
            value={form.cleaningType}
            onValueChange={(value) => handleChange("cleaningType", value)}
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

          <div className="flex items-center space-x-4">
            <label htmlFor="recurring-switch" className="text-sm font-medium">
              Recurring Job
            </label>
            <Switch
              id="recurring-switch"
              checked={form.isRecurring}
              onCheckedChange={(checked) =>
                handleChange("isRecurring", checked)
              }
            />
          </div>

          <Button
            className="w-full md:col-span-2"
            onClick={handleEstimate}
            disabled={loading}
          >
            Get Estimate
          </Button>
        </CardContent>
      </Card>

      {estimate && (
        <Card>
          <CardHeader>
            <CardTitle>Estimate Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              Square Footage: <strong>{estimate.squareFootage} sqft</strong>
            </div>
            <div>
              Estimated Price: <strong>${estimate.price}</strong>
            </div>
            <div>
              Source: <strong>{estimate.source}</strong>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const query = new URLSearchParams({
                  street: form.street ?? "",
                  city: form.city ?? "",
                  state: form.state ?? "",
                  zip: form.zip ?? "",
                  cleaningType: form.cleaningType ?? "BASE",
                  estimatedPrice: String(estimate?.price ?? 0),
                  isRecurring: String(form.isRecurring ?? false),
                }).toString();

                router.push(`/jobs/new?${query}`);
              }}
            >
              Create Job from Estimate
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
