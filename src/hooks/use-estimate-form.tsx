import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { EstimateFormValues } from "@/types/estimate.types";

export function useEstimateForm() {
  const [form, setForm] = useState<EstimateFormValues>({
    street: "",
    zip: "",
    cleaningType: "BASE",
    isRecurring: false,
    discountPercent: 0,
  });

  const [estimate, setEstimate] = useState<null | {
    price: number;
    squareFootage: number;
    source: string;
  }>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key: keyof EstimateFormValues, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEstimate = async () => {
    setIsLoading(true);
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

      setEstimate(result);
      toast.success("Estimate ready!");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching estimate");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    estimate,
    isLoading,
    handleChange,
    handleEstimate,
  };
}
