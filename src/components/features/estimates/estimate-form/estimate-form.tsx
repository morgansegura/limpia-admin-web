"use client";

import { Button } from "@/components/ui/button";
import { useEstimateForm } from "@/hooks/use-estimate-form";
import { estimateFields } from "@/constants/estimate-fields";
import { DetailSection } from "@/components/features/detail-section/detail-section";

export function EstimateForm() {
  const { form, isLoading, handleChange, handleEstimate } = useEstimateForm();

  return (
    <div className="space-y-6">
      <DetailSection
        form={form}
        isEditing={true}
        onChange={handleChange}
        fields={estimateFields}
      />
      <Button onClick={handleEstimate} disabled={isLoading} className="w-full">
        {isLoading ? "Loading..." : "Get Estimate"}
      </Button>
    </div>
  );
}
