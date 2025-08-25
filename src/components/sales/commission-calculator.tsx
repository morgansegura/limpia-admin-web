"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, Percent, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { UserRole, salesApi } from "@/lib/api";
import { FormItem } from "../ui/form";
import { useEffect } from "react";
import { DiscountApprovalDialog } from "./discount-approval-dialog";

// Dynamic Pricing Model (from spreadsheet analysis)
// Base pricing components that can be modified without hardcoding

// Square footage to time/price mapping (from spreadsheet data)
const SQUARE_FOOTAGE_TIERS = [
  { min: 0, max: 750, baseTime: 0.50, basePrice: 75.68, sizeTime: 0.00, sizePrice: 0.00 },
  { min: 751, max: 1000, baseTime: 0.55, basePrice: 76.68, sizeTime: 0.15, sizePrice: 15.00 },
  { min: 1001, max: 1250, baseTime: 0.55, basePrice: 77.68, sizeTime: 0.35, sizePrice: 35.00 },
  { min: 1251, max: 1500, baseTime: 0.60, basePrice: 78.68, sizeTime: 0.44, sizePrice: 43.75 },
  { min: 1501, max: 1750, baseTime: 0.60, basePrice: 79.68, sizeTime: 0.53, sizePrice: 60.38 },
  { min: 1751, max: 2000, baseTime: 0.60, basePrice: 80.68, sizeTime: 0.66, sizePrice: 75.47 },
  { min: 2001, max: 2250, baseTime: 0.65, basePrice: 81.68, sizeTime: 0.75, sizePrice: 86.25 },
  { min: 2251, max: 2500, baseTime: 0.65, basePrice: 82.68, sizeTime: 0.84, sizePrice: 97.03 },
  { min: 2501, max: 2750, baseTime: 0.65, basePrice: 83.68, sizeTime: 1.00, sizePrice: 115.00 },
  { min: 2751, max: 3000, baseTime: 0.70, basePrice: 84.68, sizeTime: 1.10, sizePrice: 137.50 },
  { min: 3001, max: Infinity, baseTime: 0.70, basePrice: 85.68, sizeTime: 1.20, sizePrice: 150.00 },
];

// Service type configurations (from spreadsheet)
const SERVICE_TYPE_CONFIG = {
  turn_1: { name: "Turn 1", timeAdjustment: 0.15, dollarAmount: 45.00, description: "Maintenance cleaning rotation 1" },
  turn_2: { name: "Turn 2", timeAdjustment: 0.15, dollarAmount: 45.00, description: "Maintenance cleaning rotation 2" },
  turn_3: { name: "Turn 3", timeAdjustment: 0.15, dollarAmount: 45.00, description: "Maintenance cleaning rotation 3" },
  turn_4: { name: "Turn 4", timeAdjustment: 0.15, dollarAmount: 45.00, description: "Maintenance cleaning rotation 4" },
  deep_clean_blue: { name: "Deep Clean Blue", timeAdjustment: 0.0, dollarAmount: 83.00, description: "Deep cleaning service" },
  deep_clean_shine: { name: "Deep Clean Shine", timeAdjustment: 0.0, dollarAmount: 83.00, description: "Deep cleaning service" },
  deep_combo: { name: "Deep Blue + Shine", timeAdjustment: 0.0, dollarAmount: 332.00, description: "Combined deep clean" },
  move_in_out: { name: "Move In/Out", timeAdjustment: 0.0, dollarAmount: 232.00, description: "Moving day cleaning" },
  one_time: { name: "One-Time", timeAdjustment: 0.0, dollarAmount: 332.00, description: "Single service" },
};

// Property type adjustments (from spreadsheet)
const PROPERTY_TYPE_CONFIG = {
  house: { name: "House", timeAdjustment: 0.324, dollarAmount: 28.00 },
  apartment: { name: "Apartment", timeAdjustment: 0.0, dollarAmount: 0.00 },
  office: { name: "Office", timeAdjustment: 0.4, dollarAmount: 35.00 },
  studio: { name: "Studio", timeAdjustment: 0.0, dollarAmount: 0.00 },
  warehouse: { name: "Warehouse", timeAdjustment: 0.5, dollarAmount: 40.00 },
};

// Frequency adjustments (from spreadsheet)
const FREQUENCY_CONFIG = {
  weekly: { name: "Weekly", timeAdjustment: -0.25, dollarAmount: -40.00 },
  bi_weekly: { name: "Bi-weekly", timeAdjustment: 0.0, dollarAmount: 0.00 },
  monthly: { name: "Once a Month", timeAdjustment: 0.0, dollarAmount: 25.43 },
};

// Pet adjustments (from spreadsheet)
const PET_CONFIG = {
  none: { name: "No Pets", timeAdjustment: 0.0, dollarAmount: 0.0 },
  dog_1_2: { name: "Dog up to 2", timeAdjustment: 0.25, dollarAmount: 15.0 },
  dog_3_plus: { name: "3 Dogs +", timeAdjustment: 0.375, dollarAmount: 22.5 },
  cat_1_2: { name: "Cat up to 2", timeAdjustment: 0.25, dollarAmount: 15.0 },
  cat_3_plus: { name: "3 Cats +", timeAdjustment: 0.375, dollarAmount: 22.5 },
  dog_cat: { name: "Dog + Cat", timeAdjustment: 0.25, dollarAmount: 15.0 },
  dog_cat_3_plus: { name: "Dog + Cat (3+ combined)", timeAdjustment: 0.375, dollarAmount: 22.5 },
};

// COGS configuration (from spreadsheet)
const COGS_CONFIG = {
  costingRate: 22.50, // Per hour contractor rate
  suppliesCost: 7.73, // Fixed supplies cost
  transportationCost: 11.60, // Fixed transportation cost
  realtorCommissionRate: 0.03, // 3% for realtor referrals
};

// Commission structure based on actual Limpia spreadsheet data
const COMMISSION_TIERS = [
  {
    tier: "EXCELLENT",
    grossMarginThreshold: 50, // 50%+ gross margin (like spreadsheet example)
    commissionRate: 12.8, // From spreadsheet: $11.93 ÷ $93.31 gross profit
    color: "bg-green-500 text-white",
    description: "Excellent profitability! Matches Limpia target margins.",
  },
  {
    tier: "GOOD",
    grossMarginThreshold: 40, // 40-50% gross margin
    commissionRate: 10.0,
    color: "bg-blue-500 text-white",
    description: "Good profitability with solid commission rate.",
  },
  {
    tier: "FAIR",
    grossMarginThreshold: 30, // 30-40% gross margin
    commissionRate: 7.5,
    color: "bg-yellow-500 text-white",
    description: "Fair deal. Lower margin affects commission.",
  },
  {
    tier: "POOR",
    grossMarginThreshold: 0, // Below 30% gross margin
    commissionRate: 5.0,
    color: "bg-red-500 text-white",
    description: "Low profitability. Consider pricing adjustment.",
  },
];

interface CommissionCalculatorProps {
  onCreateEstimate?: (calculationData: {
    basePrice: number;
    quotedPrice: number;
    serviceType: string;
    squareFootage: string;
    frequency: string;
    finalPrice: number;
    isPriceBelowBaseline: boolean;
    discountFromBaseline: number;
    commissionAmount: number;
    commissionTier: string;
  }) => void;
}

export function CommissionCalculator({
  onCreateEstimate,
}: CommissionCalculatorProps) {
  
  // Add slider styling
  const sliderStyle = `
    .commission-slider {
      -webkit-appearance: none;
      appearance: none;
      height: 8px;
      border-radius: 4px;
      outline: none;
      background: linear-gradient(to right, #fecaca 0%, #fef3c7 50%, #bbf7d0 100%);
    }
    .commission-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #059669;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .commission-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #059669;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `;

  // Inject styles
  if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = sliderStyle;
    if (!document.head.querySelector('.commission-slider-styles')) {
      styleSheet.className = 'commission-slider-styles';
      document.head.appendChild(styleSheet);
    }
  }
  const { user, isLoading: authLoading } = useAuth();

  // Debug user role
  console.log("🔍 Commission Calculator - Current user role:", user?.role);
  console.log("🔍 Commission Calculator - UserRole.SALES_REP:", UserRole.SALES_REP);
  console.log("🔍 Commission Calculator - Role type:", typeof user?.role);
  
  // Convert role to string for consistent comparison
  const userRole = user?.role as UserRole;
  const userRoleString = userRole?.toString() || '';
  
  // Determine if user can see sensitive business data
  const isSalesRep = userRoleString === 'SALES_REP';
  const canViewSensitiveData = !isSalesRep && userRole &&
    [
      'CORPORATE_EXECUTIVE',
      'CORPORATE_ADMIN', 
      'FRANCHISE_OWNER',
      'LOCATION_MANAGER',
      'SALES_MANAGER'
    ].includes(userRoleString);

  console.log("🔍 Commission Calculator - Can view sensitive data:", canViewSensitiveData);
  console.log("🔍 Commission Calculator - Is Sales Rep:", isSalesRep);
  console.log("🔍 Commission Calculator - String comparison:", userRole === "SALES_REP");
  console.log("🔍 Commission Calculator - Enum comparison:", userRole === UserRole.SALES_REP);

  // Limpia's pricing inputs
  const [squareFootage, setSquareFootage] = useState("");
  const [propertyType, setPropertyType] = useState("house");
  const [frequency, setFrequency] = useState("bi_weekly");
  const [serviceType, setServiceType] = useState("recurring");
  const [petSituation, setPetSituation] = useState("none");
  const [isRealtor, setIsRealtor] = useState(false);

  // Pricing override
  const [quotedPriceOverride, setQuotedPriceOverride] = useState("");

  // Discount tracking and approval state
  const [discountBudgetUsed, setDiscountBudgetUsed] = useState(850); // Will come from API
  const [discountBudgetLimit, setDiscountBudgetLimit] = useState(2000); // $2000/month limit
  const [discountBudget, setDiscountBudget] = useState<any>(null);
  const [isLoadingBudget, setIsLoadingBudget] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  // Load discount budget data on component mount
  useEffect(() => {
    const loadDiscountBudget = async () => {
      if (!user?.id) {
        console.log("👤 No user ID, skipping discount budget load");
        return;
      }

      console.log(
        "👤 Current user role:",
        user.role,
        "Can view sensitive data:",
        canViewSensitiveData,
      );

      setIsLoadingBudget(true);
      try {
        const budgetData = await salesApi.getDiscountBudget(user.id);
        setDiscountBudget(budgetData);
        setDiscountBudgetUsed(budgetData.used || 0);
        setDiscountBudgetLimit(budgetData.limit || 2000);
        console.log("📊 Loaded discount budget:", budgetData);
      } catch (error: any) {
        // Handle different types of errors
        if (
          error?.response?.status === 401 ||
          error?.message?.includes("jwt expired")
        ) {
          console.warn(
            "🔐 Authentication expired, discount budget unavailable. User may need to re-login:",
            error,
          );
        } else {
          console.warn(
            "Failed to load discount budget, using defaults:",
            error,
          );
        }

        // Use mock data as fallback for testing
        const mockBudget = {
          used: 850,
          limit: 2000,
          period: "Monthly",
          periodStart: new Date(2025, 7, 1).toISOString(), // August 1st
          periodEnd: new Date(2025, 7, 31).toISOString(), // August 31st
        };
        setDiscountBudget(mockBudget);
        setDiscountBudgetUsed(mockBudget.used);
        setDiscountBudgetLimit(mockBudget.limit);
        console.log(
          "📊 Using mock discount budget (auth may be expired):",
          mockBudget,
        );
      } finally {
        setIsLoadingBudget(false);
      }
    };

    loadDiscountBudget();
  }, [user?.id, canViewSensitiveData]);

  // Calculate price using Limpia's exact formula based on spreadsheet analysis
  const calculateBasePrice = () => {
    console.log("🔄 calculateBasePrice called with inputs:", {
      squareFootage,
      serviceType,
      frequency,
      propertyType,
      petSituation,
    });

    if (!squareFootage || !serviceType || !frequency || !propertyType) {
      console.log("❌ Missing required fields:", {
        squareFootage,
        serviceType,
        frequency,
        propertyType,
      });
      return 0;
    }

    const sqft = parseInt(squareFootage);
    if (isNaN(sqft) || sqft <= 0) {
      console.log("❌ Invalid square footage:", sqft);
      return 0;
    }

    console.log("✅ Starting calculation for", sqft, "sq ft");

    // Step 1: Find square footage tier
    const sqftTier = SQUARE_FOOTAGE_TIERS.find(
      (tier) => sqft >= tier.min && sqft <= tier.max,
    );
    if (!sqftTier) {
      console.log("❌ No square footage tier found for:", sqft);
      return 0;
    }

    // Step 2: Start with base components from square footage tier
    let totalTime = sqftTier.baseTime + sqftTier.sizeTime;
    let totalDollarAmount = sqftTier.basePrice + sqftTier.sizePrice;
    console.log("Step 1 - Square footage tier:", {
      baseTime: sqftTier.baseTime,
      sizeTime: sqftTier.sizeTime,
      totalTime,
      basePrice: sqftTier.basePrice,
      sizePrice: sqftTier.sizePrice,
      totalDollarAmount,
    });

    // Step 3: Service type adjustment
    const serviceConfig = SERVICE_TYPE_CONFIG[serviceType as keyof typeof SERVICE_TYPE_CONFIG];
    if (serviceConfig) {
      totalTime += serviceConfig.timeAdjustment;
      totalDollarAmount += serviceConfig.dollarAmount;
      console.log("Step 2 - Service adjustment:", {
        timeAdjustment: serviceConfig.timeAdjustment,
        dollarAmount: serviceConfig.dollarAmount,
        totalTime,
        totalDollarAmount,
      });
    }

    // Step 4: Property type adjustment
    const propertyConfig = PROPERTY_TYPE_CONFIG[propertyType as keyof typeof PROPERTY_TYPE_CONFIG];
    if (propertyConfig) {
      totalTime += propertyConfig.timeAdjustment;
      totalDollarAmount += propertyConfig.dollarAmount;
      console.log("Step 3 - Property adjustment:", {
        timeAdjustment: propertyConfig.timeAdjustment,
        dollarAmount: propertyConfig.dollarAmount,
        totalTime,
        totalDollarAmount,
      });
    }

    // Step 5: Frequency adjustment
    const frequencyConfig = FREQUENCY_CONFIG[frequency as keyof typeof FREQUENCY_CONFIG];
    if (frequencyConfig) {
      totalTime += frequencyConfig.timeAdjustment;
      totalDollarAmount += frequencyConfig.dollarAmount;
      console.log("Step 4 - Frequency adjustment:", {
        timeAdjustment: frequencyConfig.timeAdjustment,
        dollarAmount: frequencyConfig.dollarAmount,
        totalTime,
        totalDollarAmount,
      });
    }

    // Step 6: Pet adjustment
    const petConfig = PET_CONFIG[petSituation as keyof typeof PET_CONFIG];
    if (petConfig) {
      totalTime += petConfig.timeAdjustment;
      totalDollarAmount += petConfig.dollarAmount;
      console.log("Step 5 - Pet adjustment:", {
        timeAdjustment: petConfig.timeAdjustment,
        dollarAmount: petConfig.dollarAmount,
        totalTime,
        totalDollarAmount,
      });
    }

    // Step 7: Calculate final price
    // Note: The spreadsheet analysis shows this is a mixed time + fixed dollar model
    // For now, using total dollar amount as the primary price
    // Time component might be used for COGS calculation rather than pricing
    const finalPrice = totalDollarAmount;
    console.log("Step 6 - Final calculation:", {
      totalTime: totalTime.toFixed(3),
      totalDollarAmount: totalDollarAmount.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
    });

    // Test against 2100 sq ft example (should be $184.06)
    if (sqft === 2100) {
      console.log("🔍 SPREADSHEET TEST - 2100 sq ft example:");
      console.log("Expected: $184.06, Calculated:", finalPrice.toFixed(2));
      if (Math.abs(finalPrice - 184.06) > 0.01) {
        console.warn("⚠️ MISMATCH with spreadsheet!", {
          expected: 184.06,
          calculated: finalPrice,
          difference: Math.abs(finalPrice - 184.06).toFixed(2),
        });
      } else {
        console.log("✅ MATCHES spreadsheet example!");
      }
    }

    const result = isNaN(finalPrice) ? 0 : Math.max(finalPrice, 0);
    console.log("💰 Final result:", result.toFixed(2));
    return result;
  };

  // Calculate total time breakdown using new configuration structure
  const getTimeBreakdown = () => {
    if (!squareFootage || !serviceType || !frequency || !propertyType) {
      return { totalTime: 0, breakdown: [] };
    }

    const sqft = parseInt(squareFootage);
    if (isNaN(sqft) || sqft <= 0) return { totalTime: 0, breakdown: [] };

    const breakdown = [];
    let totalTime = 0;

    // Square footage tier (base + size time)
    const sqftTier = SQUARE_FOOTAGE_TIERS.find(
      (tier) => sqft >= tier.min && sqft <= tier.max,
    );
    if (sqftTier) {
      totalTime += sqftTier.baseTime;
      breakdown.push({ label: "Base Time", time: sqftTier.baseTime });
      if (sqftTier.sizeTime > 0) {
        totalTime += sqftTier.sizeTime;
        breakdown.push({ label: "Size Adjustment", time: sqftTier.sizeTime });
      }
    }

    // Service type adjustment
    const serviceConfig = SERVICE_TYPE_CONFIG[serviceType as keyof typeof SERVICE_TYPE_CONFIG];
    if (serviceConfig && serviceConfig.timeAdjustment !== 0) {
      totalTime += serviceConfig.timeAdjustment;
      breakdown.push({
        label: "Service Type",
        time: serviceConfig.timeAdjustment,
      });
    }

    // Property type adjustment
    const propertyConfig = PROPERTY_TYPE_CONFIG[propertyType as keyof typeof PROPERTY_TYPE_CONFIG];
    if (propertyConfig && propertyConfig.timeAdjustment !== 0) {
      totalTime += propertyConfig.timeAdjustment;
      breakdown.push({
        label: "Property Type",
        time: propertyConfig.timeAdjustment,
      });
    }

    // Frequency adjustment
    const frequencyConfig = FREQUENCY_CONFIG[frequency as keyof typeof FREQUENCY_CONFIG];
    if (frequencyConfig && frequencyConfig.timeAdjustment !== 0) {
      totalTime += frequencyConfig.timeAdjustment;
      breakdown.push({
        label: "Frequency",
        time: frequencyConfig.timeAdjustment,
      });
    }

    // Pet adjustment
    const petConfig = PET_CONFIG[petSituation as keyof typeof PET_CONFIG];
    if (petConfig && petConfig.timeAdjustment !== 0) {
      totalTime += petConfig.timeAdjustment;
      breakdown.push({ label: "Pets", time: petConfig.timeAdjustment });
    }

    return { totalTime, breakdown };
  };

  // Calculate COGS using Limpia's actual structure
  const calculateCOGS = (revenue: number) => {
    if (!revenue || revenue <= 0) {
      return {
        supplies: 0,
        contractor: 0,
        transportation: 0,
        realtorCommission: 0,
        total: 0,
        grossMargin: 0,
        grossMarginPercentage: 0,
      };
    }

    const timeBreakdown = getTimeBreakdown();
    const totalTime = Math.max(timeBreakdown.totalTime, 0);

    // From spreadsheet: Contractor cost = totalHours * $22.50
    const contractorCost = totalTime * COGS_CONFIG.costingRate;

    // Fixed costs from spreadsheet
    const suppliesCost = COGS_CONFIG.suppliesCost;
    const transportationCost = COGS_CONFIG.transportationCost;
    const realtorCommission = isRealtor ? revenue * COGS_CONFIG.realtorCommissionRate : 0; // 3% if realtor

    const totalCOGS =
      contractorCost + suppliesCost + transportationCost + realtorCommission;

    return {
      supplies: suppliesCost,
      contractor: contractorCost,
      transportation: transportationCost,
      realtorCommission: realtorCommission,
      total: totalCOGS,
      grossMargin: revenue - totalCOGS,
      grossMarginPercentage:
        revenue > 0 ? ((revenue - totalCOGS) / revenue) * 100 : 0,
    };
  };

  const basePrice = calculateBasePrice();
  const quotedPrice = quotedPriceOverride
    ? parseFloat(quotedPriceOverride)
    : basePrice;

  // Calculate pricing - no discount percentage, just direct price comparison
  const finalPrice = quotedPrice;
  const cogsAnalysis = calculateCOGS(finalPrice);

  // Baseline protection logic
  const isPriceBelowBaseline = quotedPrice < basePrice;
  const discountFromBaseline = Math.max(0, basePrice - quotedPrice); // Amount below baseline
  const wouldExceedBudget = discountBudgetUsed + discountFromBaseline > discountBudgetLimit;
  const needsManagerApproval = isPriceBelowBaseline; // Any price below baseline needs approval

  // Debug baseline protection logic
  if (isPriceBelowBaseline) {
    console.log("🚫 BASELINE PROTECTION:", {
      basePrice: basePrice.toFixed(2),
      quotedPrice: quotedPrice.toFixed(2),
      discountFromBaseline: discountFromBaseline.toFixed(2),
      budgetUsed: discountBudgetUsed,
      budgetLimit: discountBudgetLimit,
      wouldExceedBudget,
      needsManagerApproval,
    });
  }

  // Debug logging for the main calculations
  console.log("💸 PRICING UPDATE:", {
    basePrice: basePrice.toFixed(2),
    quotedPriceOverride: quotedPriceOverride || "none",
    quotedPrice: quotedPrice.toFixed(2),
    finalPrice: finalPrice.toFixed(2),
    isPriceBelowBaseline,
    discountFromBaseline: discountFromBaseline.toFixed(2),
    needsManagerApproval,
    timestamp: new Date().toLocaleTimeString(),
  });

  // Determine commission tier based on gross margin percentage
  let currentTier = COMMISSION_TIERS[3]; // Default to POOR
  for (const tier of COMMISSION_TIERS) {
    if (cogsAnalysis.grossMarginPercentage >= tier.grossMarginThreshold) {
      currentTier = tier;
      break;
    }
  }

  const commissionAmount =
    (cogsAnalysis.grossMargin * currentTier.commissionRate) / 100;
  const isDiscountAllowed = cogsAnalysis.grossMarginPercentage >= 10; // Minimum 10% gross margin

  // Show loading state while authentication is being resolved
  if (authLoading) {
    return (
      <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 -mr-2">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-40 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 -mr-2">
      {/* Authentication Warning */}
      {!isLoadingBudget && !discountBudget?.periodStart && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div>
              <div className="text-yellow-800 font-medium text-sm">
                Limited Functionality - Authentication Issue
              </div>
              <div className="text-yellow-700 text-xs">
                Some features may be limited. If you're experiencing issues, try
                refreshing the page or logging in again.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Commission Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Navigation */}
          <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => document.getElementById('customer-info')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
            >
              Customer Info
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('service-details')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
            >
              Service Details
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('commission-pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
            >
              Commission & Pricing
            </button>
          </div>

          {/* Customer Information Section */}
          <div id="customer-info" className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <Label htmlFor="squareFootage">Square Footage</Label>
              <Input
                id="squareFootage"
                type="number"
                value={squareFootage}
                onChange={(e) => setSquareFootage(e.target.value)}
                placeholder="1447"
                min="500"
                max="10000"
              />
            </FormItem>

            <FormItem>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={propertyType}
                onValueChange={(value) => setPropertyType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_TYPE_CONFIG).map(
                    ([key, prop]) => (
                      <SelectItem key={key} value={key}>
                        {prop.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <Label htmlFor="serviceType">Type of Cleaning</Label>
              <Select
                value={serviceType}
                onValueChange={(value) => setServiceType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cleaning type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_TYPE_CONFIG).map(
                    ([key, service]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="font-medium">{service.name}</span>
                          {/* <span className="text-xs text-muted-foreground">{service.description}</span> */}
                        </div>
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(value) => setFrequency(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQUENCY_CONFIG).map(([key, freq]) => (
                    <SelectItem key={key} value={key}>
                      {freq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          {/* Additional Service Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <Label htmlFor="petSituation">Pets</Label>
              <Select
                value={petSituation}
                onValueChange={(value) => setPetSituation(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PET_CONFIG).map(([key, pet]) => (
                    <SelectItem key={key} value={key}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRealtor"
                checked={isRealtor}
                onChange={(e) => setIsRealtor(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isRealtor" className="flex items-center">
                Realtor referral (3% commission)
              </Label>
            </FormItem>
          </div>
          </div>

          <Separator />

          {/* Service Details Section */}
          <div id="service-details" className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Service Details</h3>


          {/* Pricing Adjustment */}
          <div className="space-y-4">
            <FormItem>
              <Label htmlFor="quotedPriceOverride" className="text-base font-semibold">
                Adjust Sales Price ($)
              </Label>
              <div className="space-y-2">
                {basePrice > 0 && (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">
                          📊 Baseline Price (Minimum):
                        </span>
                        <span className="text-lg font-bold text-green-900">
                          ${basePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        This is the minimum profitable price based on time calculation
                      </div>
                    </div>

                    {/* Market Recommended Pricing */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-blue-800">
                          💎 Market Recommended Price:
                        </span>
                        <span className="text-lg font-bold text-blue-900">
                          ${(basePrice * 1.45).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <div className="font-medium text-blue-800 mb-2">Recommended Price Benefits:</div>
                          <div className="flex justify-between">
                            <span>Commission per sale:</span>
                            <span className="font-medium text-green-600">
                              ${((basePrice * 1.45 - basePrice) * 0.49).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual commission (12 customers):</span>
                            <span className="font-medium text-green-600">
                              ${((basePrice * 1.45 - basePrice) * 0.49 * 12).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>100 customers potential:</span>
                            <span className="font-medium text-green-600">
                              ${((basePrice * 1.45 - basePrice) * 0.49 * 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-medium text-red-800 mb-2">Low Price Impact (${(basePrice * 1.03).toFixed(2)}):</div>
                          <div className="flex justify-between">
                            <span>Commission per sale:</span>
                            <span className="font-medium text-red-600">
                              ${((basePrice * 1.03 - basePrice) * 0.20).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual commission (12 customers):</span>
                            <span className="font-medium text-red-600">
                              ${((basePrice * 1.03 - basePrice) * 0.20 * 12).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>100 customers potential:</span>
                            <span className="font-medium text-red-600">
                              ${((basePrice * 1.03 - basePrice) * 0.20 * 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="text-xs text-blue-700">
                          <strong>💡 Sales Tip:</strong> The market recommended price maximizes your commission 
                          while remaining competitive. Higher pricing = higher commissions!
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Commission Bidding Slider */}
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-yellow-800">
                        💰 Commission Bidding System
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ${commissionAmount.toFixed(2)} commission
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Price Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600">Your Price</span>
                          <span className="text-sm font-bold">${quotedPrice.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={basePrice}
                          max={basePrice * 1.45} // Market recommended (45% markup)
                          step="1"
                          value={quotedPriceOverride || basePrice}
                          onChange={(e) => setQuotedPriceOverride(e.target.value)}
                          className="w-full commission-slider cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Baseline: ${basePrice.toFixed(0)}</span>
                          <span>Market: ${(basePrice * 1.45).toFixed(0)}</span>
                        </div>
                      </div>

                      {/* Commission Preview */}
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="font-medium text-red-800">At Baseline</div>
                          <div className="text-red-600">${(((basePrice - cogsAnalysis.total) * 0.20)).toFixed(0)}</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="font-medium text-yellow-800">Current Price</div>
                          <div className="text-yellow-600 font-bold">${commissionAmount.toFixed(0)}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-medium text-green-800">At Market Price</div>
                          <div className="text-green-600">${(((basePrice * 1.45 - cogsAnalysis.total) * 0.49)).toFixed(0)}</div>
                        </div>
                      </div>

                      {/* Annual Earning Potential */}
                      <div className="bg-blue-50 rounded p-2 text-center">
                        <div className="text-xs text-blue-700 mb-1">Annual Potential (100 customers)</div>
                        <div className="text-sm font-bold text-blue-900">
                          ${(commissionAmount * 100 * 12).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Price Input (Advanced) */}
                  <details className="group">
                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                      ⚙️ Advanced: Manual Price Entry
                    </summary>
                    <div className="mt-2">
                      <Input
                        id="quotedPriceOverride"
                        type="number"
                        value={quotedPriceOverride}
                        onChange={(e) => setQuotedPriceOverride(e.target.value)}
                        placeholder={basePrice > 0 ? basePrice.toFixed(2) : "Enter price"}
                        min={basePrice > 0 ? basePrice : 0}
                        step="0.01"
                        className={
                          quotedPriceOverride && parseFloat(quotedPriceOverride) < basePrice
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300"
                        }
                      />
                    </div>
                  </details>

                  {/* Price Status Indicators */}
                  {quotedPriceOverride && basePrice > 0 && (
                    <div className="mt-2">
                      {parseFloat(quotedPriceOverride) < basePrice && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                          <span>🚫</span>
                          <span className="font-medium">
                            Below baseline by ${(basePrice - parseFloat(quotedPriceOverride)).toFixed(2)} - Manager approval required
                          </span>
                        </div>
                      )}
                      
                      {parseFloat(quotedPriceOverride) >= basePrice && parseFloat(quotedPriceOverride) <= basePrice * 1.15 && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <span>✅</span>
                          <span>
                            Good pricing - ${(parseFloat(quotedPriceOverride) - basePrice).toFixed(2)} above baseline
                          </span>
                        </div>
                      )}
                      
                      {parseFloat(quotedPriceOverride) > basePrice * 1.15 && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                          <span>🎯</span>
                          <span>
                            Premium pricing - Higher commission potential!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FormItem>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission & Pricing Section */}
      <div id="commission-pricing">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-6">Commission & Pricing</h3>

      {/* Limpia Pricing Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Limpia Pricing Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {basePrice > 0 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <h4 className="font-medium text-blue-800">Time Components</h4>
                <div className="space-y-1 text-sm">
                  {getTimeBreakdown().breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.label}:</span>
                      <span className="font-medium">
                        {item.time >= 0
                          ? item.time.toFixed(3)
                          : `(${Math.abs(item.time).toFixed(3)})`}{" "}
                        hours
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-1 flex justify-between font-medium">
                    <span>Total Time:</span>
                    <span>{getTimeBreakdown().totalTime.toFixed(3)} hours</span>
                  </div>
                </div>
                {canViewSensitiveData && (
                  <div className="flex justify-between text-sm border-t pt-1">
                    <span>Contractor Rate:</span>
                    <span className="font-medium">
                      ${COGS_CONFIG.costingRate.toFixed(2)}/hour
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span>Baseline Price:</span>
                <span className="font-medium">${basePrice.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center">
            <span>
              {quotedPriceOverride
                ? "Sales Price:"
                : "Baseline Price:"}
              {quotedPriceOverride && basePrice > 0 && (
                <span className={`text-xs ml-1 ${
                  isPriceBelowBaseline 
                    ? "text-red-600 font-medium" 
                    : "text-muted-foreground"
                }`}>
                  {isPriceBelowBaseline ? "(below baseline)" : "(adjusted)"}
                </span>
              )}
            </span>
            <span className={`font-medium ${
              isPriceBelowBaseline ? "text-red-600" : ""
            }`}>
              ${quotedPrice.toFixed(2)}
            </span>
          </div>

          {isPriceBelowBaseline && (
            <div className="flex justify-between items-center text-red-600 bg-red-50 p-2 rounded">
              <span className="flex items-center gap-1">
                <span>🚫</span>
                Below baseline:
              </span>
              <span className="font-medium">-${discountFromBaseline.toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className={`flex justify-between items-center text-lg font-bold ${
            isPriceBelowBaseline ? "text-red-600" : ""
          }`}>
            <span>Final Price:</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>

          {finalPrice > 0 && canViewSensitiveData && (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                <h4 className="font-medium text-gray-800">Projected COGS</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Contractor Cost:</span>
                    <span>${cogsAnalysis.contractor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplies Cost:</span>
                    <span>${cogsAnalysis.supplies.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transportation Cost:</span>
                    <span>${cogsAnalysis.transportation.toFixed(2)}</span>
                  </div>
                  {cogsAnalysis.realtorCommission > 0 && (
                    <div className="flex justify-between">
                      <span>Realtor Commission:</span>
                      <span>${cogsAnalysis.realtorCommission.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-1 flex justify-between font-medium">
                    <span>Total COGS:</span>
                    <span>${cogsAnalysis.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>Gross Profit:</span>
                <span className="font-medium text-green-600">
                  ${cogsAnalysis.grossMargin.toFixed(2)} (
                  {cogsAnalysis.grossMarginPercentage.toFixed(1)}%)
                </span>
              </div>
            </>
          )}

          {finalPrice > 0 && !canViewSensitiveData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-blue-800 text-sm font-medium mb-2">
                💼 Sales Rep View
              </div>
              <div className="text-blue-600 text-sm">
                Your commission will be calculated based on final deal
                profitability. Focus on providing excellent customer value while
                maintaining competitive pricing.
              </div>
            </div>
          )}

          {/* Discount Budget Tracking */}
          {discountFromBaseline > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
              <h4 className="font-medium text-orange-800 flex items-center">
                💳 Discount Budget Impact
                {isLoadingBudget && (
                  <div className="ml-2 w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                {!isLoadingBudget && !discountBudget?.periodStart && (
                  <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                    Offline Mode
                  </span>
                )}
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Discount from baseline:</span>
                  <span className="font-medium text-orange-700">
                    ${discountFromBaseline.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {discountBudget?.period || "Month"} used:
                    {discountBudget?.periodStart && (
                      <span className="text-xs ml-1 text-gray-500">
                        (
                        {new Date(
                          discountBudget.periodStart,
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          discountBudget.periodEnd,
                        ).toLocaleDateString()}
                        )
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    ${discountBudgetUsed.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Would become:</span>
                  <span
                    className={`font-medium ${
                      wouldExceedBudget ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ${(discountBudgetUsed + discountFromBaseline).toFixed(2)} /
                    ${discountBudgetLimit.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      wouldExceedBudget
                        ? "bg-red-500"
                        : (discountBudgetUsed + discountFromBaseline) /
                            discountBudgetLimit >
                          0.8
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        ((discountBudgetUsed + discountFromBaseline) /
                          discountBudgetLimit) *
                          100,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    Usage:{" "}
                    {(
                      ((discountBudgetUsed + discountFromBaseline) /
                        discountBudgetLimit) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  <span>
                    Remaining: $
                    {(
                      discountBudgetLimit -
                      discountBudgetUsed -
                      discountFromBaseline
                    ).toFixed(2)}
                  </span>
                </div>
                {wouldExceedBudget && (
                  <div className="text-red-600 font-medium text-xs mt-1">
                    ⚠️ This discount would exceed your{" "}
                    {discountBudget?.period?.toLowerCase() || "monthly"} budget!
                  </div>
                )}
              </div>
            </div>
          )}

          {needsManagerApproval && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-800 text-sm font-medium mb-2">
                🚫 Manager Approval Required
              </div>
              <div className="text-red-700 text-sm space-y-1">
                <div>• Price is ${discountFromBaseline.toFixed(2)} below baseline</div>
                {wouldExceedBudget && (
                  <div>• Would exceed monthly discount budget</div>
                )}
                <div className="text-xs mt-2 mb-3 p-2 bg-red-100 rounded">
                  <strong>Baseline protection:</strong> Sales reps cannot sell below the calculated 
                  baseline price without manager approval to ensure profitability.
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    Request approval from your sales manager to proceed below baseline.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsApprovalDialogOpen(true)}
                    className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200"
                  >
                    Request Approval
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isDiscountAllowed && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-800 text-sm font-medium">
                ⚠️ Margin Too Low
              </div>
              <div className="text-red-600 text-sm">
                This pricing results in less than 10% gross margin.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Breakdown - Only visible to Sales Managers */}
      {canViewSensitiveData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Percent className="mr-2 h-5 w-5" />
              Commission Breakdown
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Commission Tier:</span>
            <Badge className={currentTier.color}>{currentTier.tier}</Badge>
          </div>

          <div className="flex justify-between items-center">
            <span>Commission Rate:</span>
            <span className="font-medium">{currentTier.commissionRate}%</span>
          </div>

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Commission Amount:</span>
            <span className="text-green-600">
              ${commissionAmount.toFixed(2)}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between items-center text-base font-bold">
            <span>Annual Commission Amount:</span>
            <span className="text-green-600">
              ${(commissionAmount * 12).toFixed(2)}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between items-center text-base font-bold">
            <span>Annual Commission (100 customers):</span>
            <span className="text-green-600">
              ${(commissionAmount * 12 * 100).toFixed(2)}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-800 text-sm font-medium mb-1">
              Commission Tier: {currentTier.tier}
            </div>
            <div className="text-blue-600 text-sm">
              {currentTier.description}
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Commission Tier Guide - Only visible to Sales Managers */}
      {canViewSensitiveData && (
        <Card>
        <CardHeader>
          <CardTitle>Commission Tier Guide (Based on Gross Margin)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {COMMISSION_TIERS.map((tier) => (
              <div
                key={tier.tier}
                className={`p-3 rounded-lg border-2 ${
                  tier.tier === currentTier.tier
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={tier.color}>{tier.tier}</Badge>
                  <div className="text-right">
                    <div className="font-medium">
                      {tier.commissionRate}% Commission
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tier.grossMarginThreshold}%+ gross margin
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{tier.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Sales Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Sales Tips - Time-Based Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {canViewSensitiveData && (
              <li>
                • Maintain 35%+ gross margin for maximum commission (EXCELLENT
                tier)
              </li>
            )}
            <li>
              • Time estimates are based on industry standards - adjust for
              property complexity
            </li>
            <li>• Always include pet surcharge when applicable (+$15)</li>
            {canViewSensitiveData && (
              <li>
                • Commission is calculated on gross profit, not total revenue
              </li>
            )}
            <li>
              • Weekly service gets 15% discount but builds recurring revenue
            </li>
            <li>• Factor in travel time for properties beyond 5 miles</li>
            <li>
              • Deep cleaning services have higher margins than regular cleaning
            </li>
            <li>
              • Office/retail spaces require more time and premium pricing
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Create Estimate Action */}
      {onCreateEstimate && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <ArrowRight className="mr-2 h-5 w-5" />
              Ready to Create an Estimate?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Final Price:</span>
                  <span className="font-medium">${finalPrice.toFixed(2)}</span>
                </div>
                {canViewSensitiveData && (
                  <div className="flex justify-between">
                    <span>Your Commission:</span>
                    <span className="font-medium text-green-600">
                      ${commissionAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center pt-2">
                <Button
                  onClick={() => {
                    console.log("🚀 Creating estimate with data:", {
                      basePrice,
                      quotedPrice,
                      serviceType,
                      squareFootage,
                      frequency,
                      finalPrice,
                      isPriceBelowBaseline,
                      discountFromBaseline,
                      commissionAmount,
                      commissionTier: currentTier.tier,
                    });
                    if (onCreateEstimate) {
                      onCreateEstimate({
                        basePrice,
                        quotedPrice,
                        serviceType,
                        squareFootage,
                        frequency,
                        finalPrice,
                        isPriceBelowBaseline,
                        discountFromBaseline,
                        commissionAmount,
                        commissionTier: currentTier.tier,
                      });
                    } else {
                      console.warn("⚠️ onCreateEstimate callback not provided");
                    }
                  }}
                  disabled={!isDiscountAllowed || needsManagerApproval}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  size="lg"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {needsManagerApproval
                    ? "Requires Manager Approval"
                    : "Create Estimate from This Calculation"}
                </Button>
              </div>

              {needsManagerApproval && (
                <p className="text-center text-sm text-red-600">
                  Price below baseline - please adjust price or get manager approval
                </p>
              )}
              
              {!isDiscountAllowed && (
                <p className="text-center text-sm text-red-600">
                  Please adjust pricing to create estimate
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discount Approval Dialog */}
      <DiscountApprovalDialog
        isOpen={isApprovalDialogOpen}
        onClose={() => setIsApprovalDialogOpen(false)}
        onApprovalRequested={() => {
          console.log("📨 Discount approval requested");
          // Optionally refresh discount budget data
        }}
        discountData={{
          discountAmount: discountFromBaseline,
          discountPercentage: 0, // Not used anymore, but keeping for compatibility
          basePrice,
          finalPrice,
          exceedsThreshold: isPriceBelowBaseline,
          exceedsBudget: wouldExceedBudget,
          budgetUsed: discountBudgetUsed,
          budgetLimit: discountBudgetLimit,
        }}
        customerInfo={{
          serviceType,
          squareFootage,
        }}
      />
      </div>
    </div>
  );
}
