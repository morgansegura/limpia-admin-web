"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Clock, TrendingUp, BarChart3 } from "lucide-react";

interface EnhancedSalesEstimatorProps {
  onClose: () => void;
}

// Detailed charge codes structure
const CHARGE_CODES = {
  BASE: { rate: 0.6, description: "Base cleaning rate" },
  SIZE: { rate: 0.525, description: "Size adjustment" },
  HOUSE: { rate: 0.324, description: "House type premium" },
  APARTMENT: { rate: 0.0, description: "Apartment adjustment" },
  WEEKLY: { rate: -0.25, description: "Weekly frequency discount" },
  BI_WEEKLY: { rate: 0.0, description: "Bi-weekly standard" },
  MONTHLY: { rate: 0.15, description: "Monthly frequency premium" },
  TURN_1: { rate: 0.15, description: "First turn premium" },
  DEEP_CLEAN_BLUE: { rate: 0.0, description: "Deep clean blue" },
  DEEP_CLEAN_SHINE: { rate: 0.0, description: "Deep clean shine" },
  DEEP_COMBO: { rate: 0.0, description: "Deep clean combo" },
  MOVE_IN_OUT: { rate: 0.0, description: "Move in/out service" },
  ONE_TIME: { rate: 0.0, description: "One-time service" },
  DOG_UP_TO_2: { rate: 0.0, description: "Dogs up to 2" },
  DOG_3_PLUS: { rate: 0.0, description: "Dogs 3+" },
  CAT_UP_TO_2: { rate: 0.0, description: "Cats up to 2" },
  CAT_3_PLUS: { rate: 0.0, description: "Cats 3+" },
  DOG_CAT: { rate: 0.25, description: "Dog + Cat combination" },
  DOG_CAT_3_PLUS: { rate: 0.0, description: "Dog + Cat 3+ combined" },
};

// Cost structure constants
const COST_CONSTANTS = {
  COSTING_RATE: 22.5,
  SUPPLIES_RATE: 0.04, // 4% of price
  TRANSPORTATION_RATE: 0.06, // 6% of price
  GROSS_PROFIT_TARGET: 50.92, // 50.92%
  BASE_HOURLY_RATE: 55.0, // Base rate for time calculations
};

interface PricingBreakdown {
  chargeItems: Array<{
    code: string;
    description: string;
    time: number;
    dollars: number;
  }>;
  baselinePrice: number;
  marketRecommendedPrice: number;
  recommendedCommission: number;
  annualCommission: number;
  per100Customers: number;
  salesRepPrice: number;
  salesRepCommission: number;
  salesRepAnnualCommission: number;
  salesRepPer100: number;
  totalTime: number;
  totalMinutes: number;
  costBreakdown: {
    price: number;
    bestDealPrice: number;
    grossProfitPercent: number;
    costingRate: number;
    realtorCommission: number;
    contractorCost: number;
    suppliesCost: number;
    transportationCost: number;
    projectedCOGS: number;
    grossProfitDollars: number;
  };
}

export function EnhancedSalesEstimator({
  onClose,
}: EnhancedSalesEstimatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    serviceType: "regular_cleaning",
    squareFootage: "",
    propertyType: "house",
    frequency: "bi_weekly",
    pets: {
      dogs: 0,
      cats: 0,
    },
    isRealtor: false,
    isRushJob: false,
    discountPercentage: 0,
    discountReason: "",
    notes: "",
    proposedStartDate: "",
    salesRepPrice: 0, // Manual override price
  });

  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown>({
    chargeItems: [],
    baselinePrice: 0,
    marketRecommendedPrice: 0,
    recommendedCommission: 0,
    annualCommission: 0,
    per100Customers: 0,
    salesRepPrice: 0,
    salesRepCommission: 0,
    salesRepAnnualCommission: 0,
    salesRepPer100: 0,
    totalTime: 0,
    totalMinutes: 0,
    costBreakdown: {
      price: 0,
      bestDealPrice: 0,
      grossProfitPercent: 0,
      costingRate: COST_CONSTANTS.COSTING_RATE,
      realtorCommission: 0,
      contractorCost: 0,
      suppliesCost: 0,
      transportationCost: 0,
      projectedCOGS: 0,
      grossProfitDollars: 0,
    },
  });

  const calculateDetailedPricing = useCallback(() => {
    if (!formData.squareFootage) return;

    const sqft = parseInt(formData.squareFootage);
    const chargeItems: PricingBreakdown["chargeItems"] = [];
    let totalTime = 0;
    let totalDollars = 0;

    // Base charge calculation
    const baseTime = CHARGE_CODES.BASE.rate;
    const baseDollars =
      baseTime * COST_CONSTANTS.BASE_HOURLY_RATE + sqft * 0.055;
    chargeItems.push({
      code: "Base",
      description: CHARGE_CODES.BASE.description,
      time: baseTime,
      dollars: baseDollars,
    });
    totalTime += baseTime;
    totalDollars += baseDollars;

    // Size adjustment
    const sizeTime = CHARGE_CODES.SIZE.rate;
    const sizeDollars =
      sizeTime * COST_CONSTANTS.BASE_HOURLY_RATE + sqft * 0.042;
    chargeItems.push({
      code: "Size",
      description: CHARGE_CODES.SIZE.description,
      time: sizeTime,
      dollars: sizeDollars,
    });
    totalTime += sizeTime;
    totalDollars += sizeDollars;

    // Property type adjustment
    if (formData.propertyType === "house") {
      const houseTime = CHARGE_CODES.HOUSE.rate;
      const houseDollars = houseTime * COST_CONSTANTS.BASE_HOURLY_RATE + 10;
      chargeItems.push({
        code: "House",
        description: CHARGE_CODES.HOUSE.description,
        time: houseTime,
        dollars: houseDollars,
      });
      totalTime += houseTime;
      totalDollars += houseDollars;
    }

    // Frequency adjustments
    if (formData.frequency === "weekly") {
      const weeklyTime = CHARGE_CODES.WEEKLY.rate;
      const weeklyDollars = weeklyTime * COST_CONSTANTS.BASE_HOURLY_RATE;
      chargeItems.push({
        code: "Weekly",
        description: CHARGE_CODES.WEEKLY.description,
        time: weeklyTime,
        dollars: weeklyDollars,
      });
      totalTime += weeklyTime;
      totalDollars += weeklyDollars;
    }

    // Pet charges
    const totalPets = formData.pets.dogs + formData.pets.cats;
    if (formData.pets.dogs > 0 && formData.pets.cats > 0) {
      // Dog + Cat combination
      const petTime = CHARGE_CODES.DOG_CAT.rate;
      const petDollars =
        totalPets <= 2 ? 15.0 : petTime * COST_CONSTANTS.BASE_HOURLY_RATE + 25;
      chargeItems.push({
        code: "Dog+Cat",
        description: CHARGE_CODES.DOG_CAT.description,
        time: petTime,
        dollars: petDollars,
      });
      totalTime += petTime;
      totalDollars += petDollars;
    }

    // Service type adjustments (Turn 1, Deep Clean, etc.)
    if (
      formData.serviceType === "deep_clean_blue" ||
      formData.serviceType === "deep_clean_shine"
    ) {
      const turnTime = CHARGE_CODES.TURN_1.rate;
      const turnDollars = 40.0; // Fixed charge for Turn 1
      chargeItems.push({
        code: "Turn 1",
        description: CHARGE_CODES.TURN_1.description,
        time: turnTime,
        dollars: turnDollars,
      });
      totalTime += turnTime;
      totalDollars += turnDollars;
    }

    // Calculate baseline and recommended pricing
    const baselinePrice = totalDollars;
    const marketRecommendedPrice = baselinePrice * 1.07; // 7% markup

    // Commission calculations
    const recommendedCommission = marketRecommendedPrice * 0.065; // 6.5% commission
    const annualCommission = recommendedCommission * 52; // Weekly service
    const per100Customers = annualCommission * 100;

    // Sales rep pricing (manual override or recommended + 3.7%)
    const salesRepPrice =
      formData.salesRepPrice || marketRecommendedPrice * 1.037;
    const salesRepCommission = salesRepPrice * 0.0982; // 9.82% commission
    const salesRepAnnualCommission = salesRepCommission * 52;
    const salesRepPer100 = salesRepAnnualCommission * 100;

    // Cost breakdown
    const finalPrice =
      formData.discountPercentage > 0
        ? salesRepPrice * (1 - formData.discountPercentage / 100)
        : salesRepPrice;

    const suppliesCost = finalPrice * COST_CONSTANTS.SUPPLIES_RATE;
    const transportationCost = finalPrice * COST_CONSTANTS.TRANSPORTATION_RATE;
    const contractorCost = totalTime * COST_CONSTANTS.COSTING_RATE * 3.2; // Contractor multiplier
    const projectedCOGS = contractorCost + suppliesCost + transportationCost;
    const grossProfitDollars = finalPrice - projectedCOGS;
    const grossProfitPercent = (grossProfitDollars / finalPrice) * 100;

    setPricingBreakdown({
      chargeItems,
      baselinePrice,
      marketRecommendedPrice,
      recommendedCommission,
      annualCommission,
      per100Customers,
      salesRepPrice,
      salesRepCommission,
      salesRepAnnualCommission,
      salesRepPer100,
      totalTime,
      totalMinutes: totalTime * 60,
      costBreakdown: {
        price: finalPrice,
        bestDealPrice: finalPrice,
        grossProfitPercent,
        costingRate: COST_CONSTANTS.COSTING_RATE,
        realtorCommission: formData.isRealtor ? finalPrice * 0.03 : 0,
        contractorCost,
        suppliesCost,
        transportationCost,
        projectedCOGS,
        grossProfitDollars,
      },
    });
  }, [
    formData.squareFootage,
    formData.propertyType,
    formData.frequency,
    formData.pets,
    formData.serviceType,
    formData.isRealtor,
    formData.discountPercentage,
    formData.salesRepPrice,
  ]);

  useEffect(() => {
    calculateDetailedPricing();
  }, [calculateDetailedPricing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { salesApi } = await import("@/lib/api");

      const estimateData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        serviceType: formData.serviceType,
        squareFootage: parseInt(formData.squareFootage),
        propertyType: formData.propertyType,
        frequency: formData.frequency,
        pets: [
          `${formData.pets.dogs} dogs`,
          `${formData.pets.cats} cats`,
        ].filter((p) => !p.startsWith("0")),
        isRealtor: formData.isRealtor,
        isRushJob: formData.isRushJob,
        discountPercentage: formData.discountPercentage,
        discountReason: formData.discountReason,
        notes: formData.notes,
        proposedStartDate: formData.proposedStartDate,
        quotedPrice: pricingBreakdown.marketRecommendedPrice,
        finalPrice: pricingBreakdown.costBreakdown.price,
        discountAmount:
          pricingBreakdown.marketRecommendedPrice -
          pricingBreakdown.costBreakdown.price,
        commissionAmount: pricingBreakdown.salesRepCommission,
        estimatedTime: pricingBreakdown.totalTime,
        costBreakdown: pricingBreakdown.costBreakdown,
        chargeItems: pricingBreakdown.chargeItems,
      };

      const result = await salesApi.createEstimate(estimateData);
      console.log("Enhanced estimate created:", result);
      alert(
        `Professional estimate created! Estimate #${
          result.estimateNumber || result.id
        }\nFinal Price: $${pricingBreakdown.costBreakdown.price.toFixed(
          2,
        )}\nCommission: $${pricingBreakdown.salesRepCommission.toFixed(2)}`,
      );

      onClose();
    } catch (error) {
      console.error("Error creating enhanced estimate:", error);
      alert("Failed to create estimate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
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
            </div>

            <div>
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
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                placeholder="+1 (305) 555-0123"
              />
            </div>

            <div>
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) =>
                  setFormData({ ...formData, customerAddress: e.target.value })
                }
                placeholder="1200 Brickell Ave, Miami, FL 33131"
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="serviceType">Type of Cleaning *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular_cleaning">
                    Regular House Cleaning
                  </SelectItem>
                  <SelectItem value="deep_clean_blue">
                    Deep Clean Blue
                  </SelectItem>
                  <SelectItem value="deep_clean_shine">
                    Deep Clean Shine
                  </SelectItem>
                  <SelectItem value="deep_clean_combo">
                    Deep Clean Blue + Shine Combo
                  </SelectItem>
                  <SelectItem value="move_in_out">
                    Move In/Out Cleaning
                  </SelectItem>
                  <SelectItem value="one_time">One-Time Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="squareFootage">Square Footage *</Label>
              <Input
                id="squareFootage"
                type="number"
                value={formData.squareFootage}
                onChange={(e) =>
                  setFormData({ ...formData, squareFootage: e.target.value })
                }
                placeholder="1447"
                min="500"
                max="10000"
                required
              />
            </div>

            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) =>
                  setFormData({ ...formData, propertyType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Once a Month</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dogs">Dogs</Label>
                <Input
                  id="dogs"
                  type="number"
                  value={formData.pets.dogs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pets: {
                        ...formData.pets,
                        dogs: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  min="0"
                  max="10"
                />
              </div>
              <div>
                <Label htmlFor="cats">Cats</Label>
                <Input
                  id="cats"
                  type="number"
                  value={formData.pets.cats}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pets: {
                        ...formData.pets,
                        cats: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  min="0"
                  max="10"
                />
              </div>
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
                <Label htmlFor="isRealtor">Realtor Discount</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRushJob"
                  checked={formData.isRushJob}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isRushJob: !!checked })
                  }
                />
                <Label htmlFor="isRushJob">Rush Job</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Professional Sales Quote Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Charge Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold">Charge Code Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-4 gap-2 font-medium border-b pb-4">
                  <span>Code</span>
                  <span>Time</span>
                  <span>Dollars</span>
                  <span>Description</span>
                </div>
                {pricingBreakdown.chargeItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <span className="font-mono">{item.code}</span>
                    <span>{item.time.toFixed(3)}</span>
                    <span>${item.dollars.toFixed(2)}</span>
                    <span className="text-xs">{item.description}</span>
                  </div>
                ))}
                <Separator />
                <div className="grid grid-cols-4 gap-2 font-semibold">
                  <span>Total</span>
                  <span>{pricingBreakdown.totalTime.toFixed(3)}</span>
                  <span>${pricingBreakdown.baselinePrice.toFixed(2)}</span>
                  <span></span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Hours:</span>
                  <span className="font-medium">
                    {pricingBreakdown.totalTime.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Minutes:</span>
                  <span className="font-medium">
                    {pricingBreakdown.totalMinutes.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Baseline Price:</span>
                  <span className="font-medium">
                    ${pricingBreakdown.baselinePrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Market Recommended Price:</span>
                  <span className="font-medium text-green-600">
                    ${pricingBreakdown.marketRecommendedPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Commission Analysis */}
            <div className="space-y-4">
              <h4 className="font-semibold">Commission Analysis</h4>

              <div className="space-y-3 border rounded p-3 bg-green-50">
                <h5 className="font-medium text-green-800">
                  Recommended Price Strategy
                </h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Recommended Commission per event:</span>
                    <span className="font-medium">
                      ${pricingBreakdown.recommendedCommission.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Commission (52 visits):</span>
                    <span className="font-medium">
                      ${pricingBreakdown.annualCommission.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Every 100 customers @ recommended:</span>
                    <span className="font-medium">
                      ${pricingBreakdown.per100Customers.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salesRepPrice">Manual Sales Rep Price</Label>
                <Input
                  id="salesRepPrice"
                  type="number"
                  value={
                    formData.salesRepPrice ||
                    pricingBreakdown.salesRepPrice.toFixed(2)
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salesRepPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder={pricingBreakdown.salesRepPrice.toFixed(2)}
                  step="0.01"
                />
              </div>

              <div className="space-y-3 border rounded p-3 bg-blue-50">
                <h5 className="font-medium text-blue-800">
                  Sales Rep Performance
                </h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Sales Rep Commission per event:</span>
                    <span className="font-medium">
                      ${pricingBreakdown.salesRepCommission.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Commission by Sales Rep:</span>
                    <span className="font-medium">
                      ${pricingBreakdown.salesRepAnnualCommission.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Every 100 customers @ Sales Rep price:</span>
                    <span className="font-medium">
                      ${pricingBreakdown.salesRepPer100.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Cost Analysis & Profitability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-semibold">Pricing & Discount</h4>

              <div>
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
              </div>

              <div>
                <Label htmlFor="discountReason">Discount Reason</Label>
                <Input
                  id="discountReason"
                  value={formData.discountReason}
                  onChange={(e) =>
                    setFormData({ ...formData, discountReason: e.target.value })
                  }
                  placeholder="e.g., First-time customer, competitor match"
                />
              </div>

              <div className="space-y-2 border rounded p-3">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-bold text-lg">
                    ${pricingBreakdown.costBreakdown.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Best Deal Price:</span>
                  <span className="font-medium">
                    ${pricingBreakdown.costBreakdown.bestDealPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Profit (%):</span>
                  <span
                    className={`font-medium ${
                      pricingBreakdown.costBreakdown.grossProfitPercent >= 45
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {pricingBreakdown.costBreakdown.grossProfitPercent.toFixed(
                      2,
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Cost Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Costing Rate:</span>
                  <span className="font-medium">
                    ${pricingBreakdown.costBreakdown.costingRate.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Realtor Commission:</span>
                  <span className="font-medium">
                    $
                    {pricingBreakdown.costBreakdown.realtorCommission.toFixed(
                      2,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Contractor Cost:</span>
                  <span className="font-medium">
                    ${pricingBreakdown.costBreakdown.contractorCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Supplies Cost:</span>
                  <span className="font-medium">
                    ${pricingBreakdown.costBreakdown.suppliesCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transportation Cost:</span>
                  <span className="font-medium">
                    $
                    {pricingBreakdown.costBreakdown.transportationCost.toFixed(
                      2,
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Projected COGS:</span>
                  <span>
                    ${pricingBreakdown.costBreakdown.projectedCOGS.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Gross Profit ($):</span>
                  <span>
                    $
                    {pricingBreakdown.costBreakdown.grossProfitDollars.toFixed(
                      2,
                    )}
                  </span>
                </div>
              </div>
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
          <div>
            <Label htmlFor="proposedStartDate">Proposed Start Date</Label>
            <Input
              id="proposedStartDate"
              type="date"
              value={formData.proposedStartDate}
              onChange={(e) =>
                setFormData({ ...formData, proposedStartDate: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Special requirements, customer preferences, competitive considerations, etc."
            />
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
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading
            ? "Creating Professional Estimate..."
            : "Create Professional Estimate"}
        </Button>
      </div>
    </form>
  );
}
