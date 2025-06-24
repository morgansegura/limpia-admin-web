"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import TypographyH3 from "@/components/ui/typography-h3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEstimateForm } from "@/hooks/use-estimate-form";
import { estimateFields } from "@/constants/estimate-fields";
import { DetailSection } from "@/components/features/detail-section/detail-section";

export default function SalesEstimatePage() {
  const router = useRouter();
  const { form, estimate, isLoading, handleChange, handleEstimate } =
    useEstimateForm();

  return (
    <div className="sales-estimate-page space-y-6 pb-20">
      <div className="pt-10 text-center">
        <TypographyH3>Sales Estimate Tool</TypographyH3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimate Cleaning Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailSection
            form={form}
            isEditing={true}
            onChange={handleChange}
            fields={estimateFields}
          />

          <Button
            className="w-full"
            onClick={handleEstimate}
            disabled={isLoading}
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
          <CardContent className="space-y-4">
            <div>
              <strong>Square Footage:</strong> {estimate.squareFootage} sqft
            </div>
            <div>
              <strong>Estimated Price:</strong> ${estimate.price}
            </div>
            <div>
              <strong>Price Source:</strong> {estimate.source}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  const query = new URLSearchParams({
                    street: form.street ?? "",
                    zip: form.zip ?? "",
                    cleaningType: form.cleaningType ?? "BASE",
                    isRecurring: String(form.isRecurring ?? false),
                    discountPercent: String(form.discountPercent ?? 0),
                    estimatedPrice: String(estimate.price),
                  }).toString();
                  router.push(`/jobs/new?${query}`);
                }}
              >
                Create Job
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const query = new URLSearchParams({
                    street: form.street ?? "",
                    zip: form.zip ?? "",
                    cleaningType: form.cleaningType ?? "BASE",
                    isRecurring: String(form.isRecurring ?? false),
                    discountPercent: String(form.discountPercent ?? 0),
                    estimatedPrice: String(estimate.price),
                  }).toString();
                  router.push(`/customers/new?${query}`);
                }}
              >
                Create Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
