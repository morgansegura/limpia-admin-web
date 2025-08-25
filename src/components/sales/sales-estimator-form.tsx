"use client";

import { Calculator } from "lucide-react";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormItem } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface SalesEstimatorFormProps {
  onClose: () => void;
}

// Limpia's exact pricing structure from backend
const SQUARE_FOOTAGE_PRICING = [
  { min: 500, max: 699, price: 125 },
  { min: 700, max: 849, price: 140 },
  { min: 850, max: 999, price: 155 },
  { min: 1000, max: 1149, price: 170 },
  { min: 1150, max: 1299, price: 185 },
  { min: 1300, max: 1449, price: 200 },
  { min: 1450, max: 1599, price: 215 },
  { min: 1600, max: 1799, price: 235 },
  { min: 1800, max: 1999, price: 255 },
  { min: 2000, max: 2199, price: 275 },
  { min: 2200, max: 2399, price: 295 },
  { min: 2400, max: 2699, price: 320 },
  { min: 2700, max: 2999, price: 345 },
  { min: 3000, max: 3299, price: 370 },
  { min: 3300, max: 3699, price: 400 },
  { min: 3700, max: 3999, price: 430 },
  { min: 4000, max: 4499, price: 465 },
  { min: 4500, max: 4999, price: 500 },
  { min: 5000, max: Infinity, price: 535 },
];

const SERVICE_MULTIPLIERS = {
  regular_cleaning: { name: "Regular House Cleaning", multiplier: 1.0 },
  deep_clean_blue: { name: "Deep Clean Blue", multiplier: 2.0 },
  deep_clean_shine: { name: "Deep Clean Shine", multiplier: 2.5 },
  deep_clean_combo: { name: "Deep Clean Blue + Shine Combo", multiplier: 3.0 },
  move_in_out: { name: "Move In/Out Cleaning", multiplier: 2.2 },
  one_time: { name: "One-Time Cleaning", multiplier: 1.2 },
};

const FREQUENCY_MULTIPLIERS = {
  weekly: { name: "Weekly", multiplier: 1.0 },
  bi_weekly: { name: "Bi-weekly", multiplier: 1.1 },
  monthly: { name: "Monthly", multiplier: 1.15 },
  one_time: { name: "One-time", multiplier: 1.25 },
};

const COMMISSION_TIERS = {
  EXCELLENT: {
    threshold: 0,
    rate: 20,
    description: "0-5% discount: 20% commission",
  },
  GOOD: {
    threshold: 5,
    rate: 15,
    description: "5-15% discount: 15% commission",
  },
  FAIR: {
    threshold: 15,
    rate: 10,
    description: "15-25% discount: 10% commission",
  },
  POOR: { threshold: 25, rate: 5, description: "25%+ discount: 5% commission" },
};

export function SalesEstimatorForm({ onClose }: SalesEstimatorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    serviceType: "",
    squareFootage: "",
    propertyType: "house",
    frequency: "bi_weekly",
    pets: [] as string[],
    isRealtor: false,
    isRushJob: false,
    discountPercentage: 0,
    discountReason: "",
    notes: "",
    proposedStartDate: "",
  });

  const [pricing, setPricing] = useState({
    basePrice: 0,
    finalPrice: 0,
    discountAmount: 0,
    commissionAmount: 0,
    commissionTier: "EXCELLENT",
    commissionRate: 20,
    minimumPrice: 0,
  });

  const calculatePricing = useCallback(() => {
    if (!formData.serviceType || !formData.squareFootage) return;

    const sqft = parseInt(formData.squareFootage);
    const pricingTier = SQUARE_FOOTAGE_PRICING.find(
      (tier) => sqft >= tier.min && sqft <= tier.max,
    );

    if (!pricingTier) return;

    let basePrice = pricingTier.price;

    // Apply service multiplier
    const serviceMultiplier =
      SERVICE_MULTIPLIERS[
        formData.serviceType as keyof typeof SERVICE_MULTIPLIERS
      ]?.multiplier || 1;
    basePrice *= serviceMultiplier;

    // Apply frequency multiplier
    const frequencyMultiplier =
      FREQUENCY_MULTIPLIERS[
        formData.frequency as keyof typeof FREQUENCY_MULTIPLIERS
      ]?.multiplier || 1;
    basePrice *= frequencyMultiplier;

    // Apply modifiers
    if (formData.isRealtor) basePrice *= 0.9; // 10% realtor discount
    if (formData.isRushJob) basePrice *= 1.25; // 25% rush job premium

    // Calculate discount and final price
    const discountAmount = (basePrice * formData.discountPercentage) / 100;
    const finalPrice = basePrice - discountAmount;
    const minimumPrice = basePrice * 0.7; // 30% minimum margin

    // Determine commission tier
    let commissionTier = "EXCELLENT";
    let commissionRate = 20;

    if (formData.discountPercentage >= 25) {
      commissionTier = "POOR";
      commissionRate = 5;
    } else if (formData.discountPercentage >= 15) {
      commissionTier = "FAIR";
      commissionRate = 10;
    } else if (formData.discountPercentage >= 5) {
      commissionTier = "GOOD";
      commissionRate = 15;
    }

    const commissionAmount = (finalPrice * commissionRate) / 100;

    setPricing({
      basePrice,
      finalPrice,
      discountAmount,
      commissionAmount,
      commissionTier,
      commissionRate,
      minimumPrice,
    });
  }, [
    formData.serviceType,
    formData.squareFootage,
    formData.frequency,
    formData.propertyType,
    formData.isRealtor,
    formData.isRushJob,
    formData.discountPercentage,
  ]);

  // Recalculate pricing when relevant fields change
  React.useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { salesApi } = await import("@/lib/api");

      // First get quick pricing if not already calculated with backend
      const quickPriceData = {
        serviceType: formData.serviceType,
        squareFootage: parseInt(formData.squareFootage),
        propertyType: formData.propertyType,
        frequency: formData.frequency,
        pets: formData.pets,
        addOns: [],
        isRealtor: formData.isRealtor,
        isRushJob: formData.isRushJob,
        discountPercentage:
          parseFloat(formData.discountPercentage.toString()) || 0,
      };

      // If we have customer info, create full estimate; otherwise just get quick price
      if (formData.customerName && formData.customerEmail) {
        const estimateData = {
          ...quickPriceData,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          discountReason: formData.discountReason,
          notes: formData.notes,
          proposedStartDate: formData.proposedStartDate,
        };

        const result = await salesApi.createEstimate(estimateData);
        console.log("Estimate created:", result);
        alert(
          `Estimate created successfully! Estimate #${result.estimateNumber}`,
        );
      } else {
        const result = await salesApi.getQuickPrice(quickPriceData);
        console.log("Quick price calculated:", result);
        alert(
          `Quick price: $${result.finalPrice.toFixed(
            2,
          )} (Commission: $${result.commissionBreakdown.commissionAmount.toFixed(
            2,
          )})`,
        );
      }

      onClose();
    } catch (error) {
      console.error("Error creating estimate:", error);
      alert("Failed to create estimate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCommissionTierColor = (tier: string) => {
    switch (tier) {
      case "EXCELLENT":
        return "bg-green-500 text-white";
      case "GOOD":
        return "bg-blue-500 text-white";
      case "FAIR":
        return "bg-yellow-500 text-white";
      case "POOR":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormItem>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="e.g., Sofia Martinez"
                required
              />
            </FormItem>

            <FormItem>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                placeholder="customer@email.com"
              />
            </FormItem>

            <FormItem>
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                placeholder="+1 (305) 555-0123"
              />
            </FormItem>

            <FormItem>
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) =>
                  setFormData({ ...formData, customerAddress: e.target.value })
                }
                placeholder="1200 Brickell Ave, Miami, FL 33131"
              />
            </FormItem>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormItem>
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceType: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_MULTIPLIERS).map(([key, service]) => (
                    <SelectItem key={key} value={key}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQUENCY_MULTIPLIERS).map(([key, freq]) => (
                    <SelectItem key={key} value={key}>
                      {freq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <div className="grid gap-4 md:grid-cols-2">
              <FormItem>
                <Label htmlFor="squareFootage">Square Footage *</Label>
                <Input
                  id="squareFootage"
                  type="number"
                  value={formData.squareFootage}
                  onChange={(e) =>
                    setFormData({ ...formData, squareFootage: e.target.value })
                  }
                  placeholder="2500"
                  min="500"
                  max="10000"
                  required
                />
              </FormItem>

              <FormItem>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, propertyType: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRealtor"
                  checked={formData.isRealtor}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isRealtor: !!checked })
                  }
                />
                <Label htmlFor="isRealtor">Realtor (10% discount)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRushJob"
                  checked={formData.isRushJob}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isRushJob: !!checked })
                  }
                />
                <Label htmlFor="isRushJob">Rush Job (25% premium)</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Pricing & Commission Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <FormItem>
                <Label htmlFor="discountPercentage">
                  Discount Percentage (0-50%)
                </Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="50"
                  step="0.1"
                />
              </FormItem>

              <FormItem>
                <Label htmlFor="discountReason">Discount Reason</Label>
                <Input
                  id="discountReason"
                  value={formData.discountReason}
                  onChange={(e) =>
                    setFormData({ ...formData, discountReason: e.target.value })
                  }
                  placeholder="e.g., First-time customer"
                />
              </FormItem>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Base Price:</span>
                <span className="font-medium">
                  ${pricing.basePrice.toFixed(2)}
                </span>
              </div>

              {pricing.discountAmount > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span>Discount ({formData.discountPercentage}%):</span>
                  <span>-${pricing.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Final Price:</span>
                <span>${pricing.finalPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Commission ({pricing.commissionRate}%):</span>
                <span className="font-medium">
                  ${pricing.commissionAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Commission Tier:</span>
                <Badge
                  className={getCommissionTierColor(pricing.commissionTier)}
                >
                  {pricing.commissionTier}
                </Badge>
              </div>

              {pricing.finalPrice < pricing.minimumPrice && (
                <div className="text-red-600 text-sm">
                  ⚠️ Price below 30% minimum margin ($
                  {pricing.minimumPrice.toFixed(2)})
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormItem>
            <Label htmlFor="proposedStartDate">Proposed Start Date</Label>
            <Input
              id="proposedStartDate"
              type="date"
              value={formData.proposedStartDate}
              onChange={(e) =>
                setFormData({ ...formData, proposedStartDate: e.target.value })
              }
            />
          </FormItem>

          <FormItem>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Special requirements, customer preferences, etc."
            />
          </FormItem>
        </CardContent>
      </Card>

      {/* Commission Tier Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commission Tier Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(COMMISSION_TIERS).map(([tier, info]) => (
              <div key={tier} className="flex items-center space-x-3">
                <Badge className={getCommissionTierColor(tier)}>{tier}</Badge>
                <span className="text-sm">{info.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading || !formData.serviceType || !formData.squareFootage
          }
        >
          {isLoading
            ? "Processing..."
            : formData.customerName && formData.customerEmail
            ? "Create Full Estimate"
            : "Get Quick Price"}
        </Button>
      </div>
    </form>
  );
}
