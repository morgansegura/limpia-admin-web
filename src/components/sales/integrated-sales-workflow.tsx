"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  DollarSign,
  User,
  Home,
  ArrowRight,
  ArrowLeft,
  Send,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { salesApi } from "@/lib/api";

// Form data interface
interface IntegratedWorkflowFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  serviceType: string;
  squareFootage: string;
  propertyType: string;
  frequency: string;
  pets: string[];
  isRealtor: boolean;
  isRushJob: boolean;
  discountPercentage: number;
  discountReason: string;
  notes: string;
}

interface CommissionTier {
  tier: string;
  color: string;
  commissionRate: number;
  description: string;
  discountRange: string;
}

interface PricingCalculation {
  basePrice: number;
  quotedPrice: number;
  discountAmount: number;
  finalPrice: number;
  commissionAmount: number;
  commissionTier: CommissionTier;
  isDiscountAllowed: boolean;
  minimumPrice: number;
}

// Pricing and commission data
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
  // Primary service types (matching Commission Calculator)
  recurring: { name: "Recurring Service (Monthly)", multiplier: 1.0 },
  deep_clean_combo: { name: "Deep Clean Blue + Shine Combo", multiplier: 3.0 },
  move_in_out: { name: "Move In/Out Cleaning", multiplier: 2.2 },
  one_time: { name: "One-Time Cleaning", multiplier: 1.2 },
  // Additional service types for flexibility
  regular_cleaning: { name: "Regular House Cleaning", multiplier: 1.0 },
  deep_clean_blue: { name: "Deep Clean Blue", multiplier: 2.0 },
  deep_clean_shine: { name: "Deep Clean Shine", multiplier: 2.5 },
};

const FREQUENCY_MULTIPLIERS = {
  weekly: { name: "Weekly", multiplier: 1.0 },
  bi_weekly: { name: "Bi-weekly", multiplier: 1.1 },
  monthly: { name: "Monthly", multiplier: 1.15 },
  one_time: { name: "One-time", multiplier: 1.25 },
};

const COMMISSION_TIERS = [
  {
    tier: "EXCELLENT",
    discountRange: "0-5%",
    commissionRate: 20,
    color: "bg-green-500 text-white",
    description: "Great work! Minimal discount with excellent commission rate.",
  },
  {
    tier: "GOOD",
    discountRange: "5-15%",
    commissionRate: 15,
    color: "bg-blue-500 text-white",
    description: "Good deal! Moderate discount with solid commission rate.",
  },
  {
    tier: "FAIR",
    discountRange: "15-25%",
    commissionRate: 10,
    color: "bg-yellow-500 text-white",
    description:
      "Fair deal. Higher discount reduces commission but still profitable.",
  },
  {
    tier: "POOR",
    discountRange: "25%+",
    commissionRate: 5,
    color: "bg-red-500 text-white",
    description:
      "Large discount significantly reduces commission. Consider justification.",
  },
];

interface IntegratedSalesWorkflowProps {
  onClose: () => void;
  onComplete?: () => void;
  initialCalculatorData?: {
    basePrice: number;
    quotedPrice: number;
    serviceType: string;
    squareFootage: string;
    frequency: string;
    discountPercentage: number;
    finalPrice: number;
    discountAmount: number;
    commissionAmount: number;
    commissionTier: string;
  } | null;
}

export function IntegratedSalesWorkflow({
  onClose,
  onComplete,
  initialCalculatorData,
}: IntegratedSalesWorkflowProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(initialCalculatorData ? 2 : 1);
  const [isLoading, setIsLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",

    // Service Details (pre-populate from calculator if available)
    serviceType: initialCalculatorData?.serviceType || "",
    squareFootage: initialCalculatorData?.squareFootage || "",
    propertyType: "house" as string,
    frequency: initialCalculatorData?.frequency || ("bi_weekly" as string),
    pets: [] as string[],
    isRealtor: false,
    isRushJob: false,

    // Pricing & Commission (pre-populate from calculator if available)
    discountPercentage: initialCalculatorData?.discountPercentage || 0,
    discountReason: "",
    notes: initialCalculatorData
      ? `Pre-calculated pricing: Base $${initialCalculatorData.basePrice.toFixed(2)} → Final $${initialCalculatorData.finalPrice.toFixed(2)} (${initialCalculatorData.commissionTier} commission tier)`
      : "",
  });

  // Calculate pricing and commission
  const pricingCalculation = useMemo((): PricingCalculation => {
    // If we have pre-calculated data from the commission calculator, use it
    if (
      initialCalculatorData &&
      formData.serviceType === initialCalculatorData.serviceType &&
      formData.squareFootage === initialCalculatorData.squareFootage &&
      formData.frequency === initialCalculatorData.frequency &&
      formData.discountPercentage === initialCalculatorData.discountPercentage
    ) {
      console.log("🔗 Using pre-calculated data from commission calculator");

      // Use the exact data from the commission calculator
      const calculatorTier =
        COMMISSION_TIERS.find(
          (t) => t.tier === initialCalculatorData.commissionTier,
        ) || COMMISSION_TIERS[0];

      return {
        basePrice: initialCalculatorData.basePrice,
        quotedPrice: initialCalculatorData.quotedPrice,
        discountAmount: initialCalculatorData.discountAmount,
        finalPrice: initialCalculatorData.finalPrice,
        commissionAmount: initialCalculatorData.commissionAmount,
        commissionTier: calculatorTier,
        isDiscountAllowed: true, // Calculator already validated this
        minimumPrice: initialCalculatorData.finalPrice * 0.7, // Conservative minimum
      };
    }

    // Fallback to integrated workflow calculation for new data
    console.log(
      "🔢 Using integrated workflow calculation (fallback or modified data)",
    );

    if (
      !formData.squareFootage ||
      !formData.serviceType ||
      !formData.frequency
    ) {
      return {
        basePrice: 0,
        quotedPrice: 0,
        discountAmount: 0,
        finalPrice: 0,
        commissionAmount: 0,
        commissionTier: COMMISSION_TIERS[0],
        isDiscountAllowed: true,
        minimumPrice: 0,
      };
    }

    const sqft = parseInt(formData.squareFootage);
    const basePriceData = SQUARE_FOOTAGE_PRICING.find(
      (range) => sqft >= range.min && sqft <= range.max,
    );

    if (!basePriceData)
      return {
        basePrice: 0,
        quotedPrice: 0,
        discountAmount: 0,
        finalPrice: 0,
        commissionAmount: 0,
        commissionTier: COMMISSION_TIERS[0],
        isDiscountAllowed: true,
        minimumPrice: 0,
      };

    const basePrice = basePriceData.price;
    const serviceMultiplier =
      SERVICE_MULTIPLIERS[
        formData.serviceType as keyof typeof SERVICE_MULTIPLIERS
      ]?.multiplier || 1;
    const frequencyMultiplier =
      FREQUENCY_MULTIPLIERS[
        formData.frequency as keyof typeof FREQUENCY_MULTIPLIERS
      ]?.multiplier || 1;

    const quotedPrice = basePrice * serviceMultiplier * frequencyMultiplier;
    const discountAmount = (quotedPrice * formData.discountPercentage) / 100;
    const finalPrice = quotedPrice - discountAmount;
    const minimumPrice = quotedPrice * 0.7; // 30% minimum margin

    // Determine commission tier
    let currentTier = COMMISSION_TIERS[0];
    if (formData.discountPercentage >= 25) {
      currentTier = COMMISSION_TIERS[3];
    } else if (formData.discountPercentage >= 15) {
      currentTier = COMMISSION_TIERS[2];
    } else if (formData.discountPercentage >= 5) {
      currentTier = COMMISSION_TIERS[1];
    }

    const commissionAmount = (finalPrice * currentTier.commissionRate) / 100;
    const isDiscountAllowed = finalPrice >= minimumPrice;

    return {
      basePrice,
      quotedPrice,
      discountAmount,
      finalPrice,
      commissionAmount,
      commissionTier: currentTier,
      isDiscountAllowed,
      minimumPrice,
    };
  }, [formData, initialCalculatorData]);

  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePetChange = useCallback((petType: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      pets: checked
        ? [...prev.pets, petType]
        : prev.pets.filter((p) => p !== petType),
    }));
  }, []);

  const canProceedToStep = useCallback(
    (step: number) => {
      switch (step) {
        case 2:
          return (
            formData.customerName &&
            formData.customerEmail &&
            formData.customerAddress
          );
        case 3:
          return (
            formData.serviceType && formData.squareFootage && formData.frequency
          );
        case 4:
          return (
            pricingCalculation.quotedPrice > 0 &&
            pricingCalculation.isDiscountAllowed
          );
        default:
          return true;
      }
    },
    [formData, pricingCalculation],
  );

  const handleSubmitEstimate = async () => {
    try {
      setIsLoading(true);

      const estimateData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        serviceType: formData.serviceType,
        squareFootage: parseInt(formData.squareFootage),
        propertyType: formData.propertyType,
        frequency: formData.frequency,
        pets: formData.pets,
        isRealtor: formData.isRealtor,
        isRushJob: formData.isRushJob,
        quotedPrice: pricingCalculation.quotedPrice,
        discountPercentage: formData.discountPercentage,
        discountAmount: pricingCalculation.discountAmount,
        discountReason: formData.discountReason,
        finalPrice: pricingCalculation.finalPrice,
        commissionAmount: pricingCalculation.commissionAmount,
        commissionTier: pricingCalculation.commissionTier.tier,
        notes: formData.notes,
      };

      await salesApi.createEstimate(estimateData);

      toast({
        title: "Estimate Created Successfully!",
        description: `Estimate for ${formData.customerName} has been created with ${pricingCalculation.commissionTier.tier.toLowerCase()} commission tier.`,
      });

      onComplete?.();
      onClose();
    } catch (error) {
      console.error("Error creating estimate:", error);
      toast({
        title: "Failed to Create Estimate",
        description:
          "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            initialCalculatorData={initialCalculatorData}
            onStepSelect={setCurrentStep}
          />
        );
      case 2:
        return (
          <CustomerInfoStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <ServiceDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            handlePetChange={handlePetChange}
          />
        );
      case 4:
        return (
          <PricingCommissionStep
            formData={formData}
            updateFormData={updateFormData}
            pricingCalculation={pricingCalculation}
            initialCalculatorData={initialCalculatorData ?? undefined}
          />
        );
      case 5:
        return (
          <ReviewFinalizeStep
            formData={formData}
            pricingCalculation={pricingCalculation}
            updateFormData={updateFormData}
            onSubmit={handleSubmitEstimate}
            isLoading={isLoading}
          />
        );
      default:
        return <WelcomeStep onStepSelect={setCurrentStep} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Sales Workflow</h1>
              <p className="text-muted-foreground">
                Integrated commission calculator and estimate creation
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of 5
            </Badge>
          </div>

          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((currentStep / 5) * 100)}%
              </span>
            </div>
            <Progress value={(currentStep / 5) * 100} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {currentStep < 5 ? (
                <Button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={!canProceedToStep(currentStep + 1) || isLoading}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitEstimate}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Creating..." : "Create Estimate"}
                  <CheckCircle className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step Components
interface WelcomeStepProps {
  initialCalculatorData?: {
    basePrice: number;
    quotedPrice: number;
    serviceType: string;
    squareFootage: string;
    frequency: string;
    discountPercentage: number;
    finalPrice: number;
    commissionAmount: number;
    commissionTier: string;
  } | null;
  onStepSelect?: (step: number) => void;
}

function WelcomeStep({
  initialCalculatorData,
  onStepSelect,
}: WelcomeStepProps) {
  if (initialCalculatorData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>Calculator Data Imported</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              Great! Your calculations are ready to become an estimate
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We&apos;ve imported your commission calculations. Now let&apos;s
              gather customer information and service details to create a
              professional estimate.
            </p>

            {/* Show imported calculation summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto mb-6">
              <h3 className="font-medium text-green-800 mb-2">
                Imported Calculation
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span className="font-medium">
                    ${initialCalculatorData.basePrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Final Price:</span>
                  <span className="font-medium">
                    ${initialCalculatorData.finalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Commission:</span>
                  <span className="font-medium text-green-600">
                    ${initialCalculatorData.commissionAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Square Footage:</span>
                  <span className="font-medium">
                    {initialCalculatorData.squareFootage} sq ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Frequency:</span>
                  <span className="font-medium">
                    {initialCalculatorData.frequency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">
                    {SERVICE_MULTIPLIERS[
                      initialCalculatorData.serviceType as keyof typeof SERVICE_MULTIPLIERS
                    ]?.name || initialCalculatorData.serviceType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tier:</span>
                  <Badge
                    className={
                      COMMISSION_TIERS.find(
                        (t) => t.tier === initialCalculatorData.commissionTier,
                      )?.color
                    }
                  >
                    {initialCalculatorData.commissionTier}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => onStepSelect?.(2)}
                className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left cursor-pointer hover:shadow-md group"
              >
                <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Next: Customer Info</h3>
                <p className="text-sm text-muted-foreground">
                  Collect customer details and property information
                </p>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Click to jump to step →
                </div>
              </button>

              <button
                onClick={() => onStepSelect?.(3)}
                className="p-4 border rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left cursor-pointer hover:shadow-md group"
              >
                <Home className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Then: Service Details</h3>
                <p className="text-sm text-muted-foreground">
                  Finalize services and create the estimate
                </p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  Click to jump to step →
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <span>Welcome to the Sales Workflow</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-4">
            Create Professional Estimates with Integrated Commission
            Calculations
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            This workflow guides you through creating accurate estimates while
            automatically calculating your commission based on discount levels.
            Everything is integrated to help you close deals faster and maximize
            earnings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <button
              onClick={() => onStepSelect?.(2)}
              className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left group cursor-pointer hover:shadow-md"
            >
              <User className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium mb-1">Customer Info</h3>
              <p className="text-sm text-muted-foreground">
                Collect customer details and property information
              </p>
              <div className="mt-2 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Click to jump to step →
              </div>
            </button>

            <button
              onClick={() => onStepSelect?.(3)}
              className="p-4 border rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left group cursor-pointer hover:shadow-md"
            >
              <Home className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium mb-1">Service Details</h3>
              <p className="text-sm text-muted-foreground">
                Select services, pricing, and special requirements
              </p>
              <div className="mt-2 text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Click to jump to step →
              </div>
            </button>

            <button
              onClick={() => onStepSelect?.(4)}
              className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left group cursor-pointer hover:shadow-md"
            >
              <Calculator className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium mb-1">Commission & Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Real-time commission calculations and discount optimization
              </p>
              <div className="mt-2 text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Click to jump to step →
              </div>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CustomerInfoStepProps {
  formData: IntegratedWorkflowFormData;
  updateFormData: (updates: Partial<IntegratedWorkflowFormData>) => void;
}

function CustomerInfoStep({ formData, updateFormData }: CustomerInfoStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Customer Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => updateFormData({ customerName: e.target.value })}
              placeholder="John Smith"
            />
          </div>

          <div>
            <Label htmlFor="customerEmail">Email Address *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) =>
                updateFormData({ customerEmail: e.target.value })
              }
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) =>
                updateFormData({ customerPhone: e.target.value })
              }
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select
              value={formData.propertyType}
              onValueChange={(value) => updateFormData({ propertyType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="customerAddress">Property Address *</Label>
          <Textarea
            id="customerAddress"
            value={formData.customerAddress}
            onChange={(e) =>
              updateFormData({ customerAddress: e.target.value })
            }
            placeholder="123 Main Street, City, State, ZIP"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface ServiceDetailsStepProps {
  formData: IntegratedWorkflowFormData;
  updateFormData: (updates: Partial<IntegratedWorkflowFormData>) => void;
  handlePetChange: (petType: string, checked: boolean) => void;
}

function ServiceDetailsStep({
  formData,
  updateFormData,
  handlePetChange,
}: ServiceDetailsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Home className="w-5 h-5" />
          <span>Service Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => updateFormData({ serviceType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SERVICE_MULTIPLIERS).map(([key, service]) => (
                  <SelectItem key={key} value={key}>
                    {service.name} ({service.multiplier}x)
                  </SelectItem>
                ))}
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
                updateFormData({ squareFootage: e.target.value })
              }
              placeholder="1200"
              min="500"
              max="10000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="frequency">Cleaning Frequency *</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => updateFormData({ frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FREQUENCY_MULTIPLIERS).map(([key, freq]) => (
                <SelectItem key={key} value={key}>
                  {freq.name} ({freq.multiplier}x)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Special Considerations</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRealtor"
                checked={formData.isRealtor}
                onCheckedChange={(checked) =>
                  updateFormData({ isRealtor: checked === true })
                }
              />
              <Label htmlFor="isRealtor">Realtor referral</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRushJob"
                checked={formData.isRushJob}
                onCheckedChange={(checked) =>
                  updateFormData({ isRushJob: checked === true })
                }
              />
              <Label htmlFor="isRushJob">Rush job (24hr notice)</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Pets in Home</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Dogs", "Cats", "Birds", "Other"].map((pet) => (
              <div key={pet} className="flex items-center space-x-2">
                <Checkbox
                  id={pet.toLowerCase()}
                  checked={formData.pets.includes(pet)}
                  onCheckedChange={(checked) =>
                    handlePetChange(pet, checked as boolean)
                  }
                />
                <Label htmlFor={pet.toLowerCase()}>{pet}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PricingCommissionStepProps {
  formData: IntegratedWorkflowFormData;
  updateFormData: (updates: Partial<IntegratedWorkflowFormData>) => void;
  pricingCalculation: PricingCalculation;
  initialCalculatorData?: {
    basePrice: number;
    quotedPrice: number;
    discountAmount: number;
    finalPrice: number;
    commissionAmount: number;
    commissionTier: string;
    serviceType: string;
    squareFootage: string;
    frequency: string;
    discountPercentage: number;
  };
}

function PricingCommissionStep({
  formData,
  updateFormData,
  pricingCalculation,
  initialCalculatorData,
}: PricingCommissionStepProps) {
  return (
    <div className="space-y-6">
      {/* Calculator Data Indicator */}
      {initialCalculatorData && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Using Pre-Calculated Data from Quick Calculator
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your pricing and commission calculations have been imported. You
              can adjust the discount if needed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Live Commission Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>
              {initialCalculatorData
                ? "Pricing Review & Adjustment"
                : "Live Commission Calculator"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="discountPercentage">
                  Discount Percentage (%)
                </Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    updateFormData({
                      discountPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="50"
                  step="0.1"
                />
              </div>

              {formData.discountPercentage > 0 && (
                <div>
                  <Label htmlFor="discountReason">Discount Reason</Label>
                  <Textarea
                    id="discountReason"
                    value={formData.discountReason}
                    onChange={(e) =>
                      updateFormData({ discountReason: e.target.value })
                    }
                    placeholder="Explain why discount is justified..."
                    rows={2}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base Quote:</span>
                <span className="font-medium">
                  ${(pricingCalculation.quotedPrice || 0).toFixed(2)}
                </span>
              </div>

              {(pricingCalculation.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>
                    -${(pricingCalculation.discountAmount || 0).toFixed(2)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Final Price:</span>
                <span>${(pricingCalculation.finalPrice || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>
                  Commission (
                  {pricingCalculation.commissionTier?.commissionRate || 0}
                  %):
                </span>
                <span className="font-medium text-green-600">
                  ${(pricingCalculation.commissionAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Commission Tier Display */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Commission Tier:</span>
              <Badge className={pricingCalculation.commissionTier?.color || ""}>
                {pricingCalculation.commissionTier?.tier || ""}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {pricingCalculation.commissionTier?.description || ""}
            </p>
          </div>

          {!pricingCalculation.isDiscountAllowed && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">
                  Discount Exceeds Maximum
                </div>
                <div className="text-sm text-red-600">
                  This discount reduces the margin below the 30% minimum
                  threshold. Minimum allowed price: $
                  {(pricingCalculation.minimumPrice || 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Tier Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Tier Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMMISSION_TIERS.map((tier) => (
              <div
                key={tier.tier}
                className={`p-3 rounded-lg border-2 ${
                  tier.tier === pricingCalculation.commissionTier?.tier
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={tier.color}>{tier.tier}</Badge>
                  <div className="text-right">
                    <div className="font-medium">{tier.commissionRate}%</div>
                    <div className="text-xs text-muted-foreground">
                      {tier.discountRange}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{tier.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReviewFinalizeStepProps {
  formData: IntegratedWorkflowFormData;
  pricingCalculation: PricingCalculation;
  updateFormData: (updates: Partial<IntegratedWorkflowFormData>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

function ReviewFinalizeStep({
  formData,
  pricingCalculation,
  updateFormData,
  onSubmit,
  isLoading,
}: ReviewFinalizeStepProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="font-medium">{formData.customerName}</div>
              <div className="text-sm text-muted-foreground">
                {formData.customerEmail}
              </div>
              <div className="text-sm text-muted-foreground">
                {formData.customerPhone}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="font-medium">
                {
                  SERVICE_MULTIPLIERS[
                    formData.serviceType as keyof typeof SERVICE_MULTIPLIERS
                  ]?.name
                }
              </div>
              <div className="text-sm text-muted-foreground">
                {formData.squareFootage} sq ft •{" "}
                {
                  FREQUENCY_MULTIPLIERS[
                    formData.frequency as keyof typeof FREQUENCY_MULTIPLIERS
                  ]?.name
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="font-medium text-green-600">
                ${(pricingCalculation.commissionAmount || 0).toFixed(2)}
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  className={pricingCalculation.commissionTier?.color || ""}
                >
                  {pricingCalculation.commissionTier?.tier || ""}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {pricingCalculation.commissionTier?.commissionRate || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Final Pricing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Base Quote:</span>
              <span className="font-medium">
                ${(pricingCalculation.quotedPrice || 0).toFixed(2)}
              </span>
            </div>

            {(pricingCalculation.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({formData.discountPercentage}%):</span>
                <span>
                  -${(pricingCalculation.discountAmount || 0).toFixed(2)}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-xl font-bold">
              <span>Final Price:</span>
              <span>${(pricingCalculation.finalPrice || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>Your Commission:</span>
              <span className="font-semibold">
                ${(pricingCalculation.commissionAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            placeholder="Any additional notes for this estimate..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onSubmit}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>

            <Button
              size="lg"
              onClick={onSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? "Creating..." : "Create & Send Estimate"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
