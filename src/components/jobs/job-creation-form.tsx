"use client";

import React, { useState } from "react";
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
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobCreationFormProps {
  onClose: () => void;
  onJobCreated?: (job: any) => void;
}

const SERVICE_TYPES = [
  { value: "regular_cleaning", name: "Regular House Cleaning", price: 120 },
  { value: "deep_clean_blue", name: "Deep Clean Blue", price: 220 },
  { value: "deep_clean_shine", name: "Deep Clean Shine", price: 280 },
  {
    value: "deep_clean_combo",
    name: "Deep Clean Blue + Shine Combo",
    price: 450,
  },
  { value: "move_in_out", name: "Move In/Out Cleaning", price: 350 },
  { value: "one_time", name: "One-Time Cleaning", price: 150 },
];

const FREQUENCIES = [
  { value: "one_time", name: "One-time", multiplier: 1.25 },
  { value: "weekly", name: "Weekly", multiplier: 1.0 },
  { value: "bi_weekly", name: "Bi-weekly", multiplier: 1.1 },
  { value: "monthly", name: "Monthly", multiplier: 1.15 },
];

const CREWS = [
  {
    value: "alpha",
    name: "Alpha Team",
    members: ["Maria S.", "Carlos R.", "Ana L."],
  },
  {
    value: "beta",
    name: "Beta Team",
    members: ["Jose M.", "Carmen V.", "Luis P."],
  },
  {
    value: "gamma",
    name: "Gamma Team",
    members: ["Sofia T.", "Miguel A.", "Rosa C."],
  },
  {
    value: "delta",
    name: "Delta Team",
    members: ["Pedro G.", "Elena R.", "David M."],
  },
];

const PRIORITIES = [
  { value: "low", name: "Low", color: "bg-gray-500" },
  { value: "normal", name: "Normal", color: "bg-blue-500" },
  { value: "high", name: "High", color: "bg-orange-500" },
  { value: "urgent", name: "Urgent", color: "bg-red-500" },
];

export function JobCreationForm({
  onClose,
  onJobCreated,
}: JobCreationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    service: {
      type: "",
      frequency: "",
      squareFootage: "",
      specialRequirements: "",
    },
    scheduling: {
      date: "",
      startTime: "",
      estimatedDuration: "",
      priority: "normal",
      assignedCrew: "",
    },
    pricing: {
      basePrice: 0,
      totalPrice: 0,
      discountPercentage: 0,
      notes: "",
    },
  });

  // Calculate pricing when service details change
  const calculatePricing = () => {
    const service = SERVICE_TYPES.find(
      (s) => s.value === formData.service.type,
    );
    const frequency = FREQUENCIES.find(
      (f) => f.value === formData.service.frequency,
    );

    if (!service || !frequency) return { basePrice: 0, totalPrice: 0 };

    let basePrice = service.price;

    // Adjust for square footage (base calculation for 2000 sq ft)
    const sqft = parseInt(formData.service.squareFootage) || 2000;
    const sqftMultiplier = sqft / 2000;
    basePrice *= sqftMultiplier;

    // Apply frequency multiplier
    basePrice *= frequency.multiplier;

    // Apply discount
    const discountAmount =
      (basePrice * formData.pricing.discountPercentage) / 100;
    const totalPrice = basePrice - discountAmount;

    return {
      basePrice: Math.round(basePrice),
      totalPrice: Math.round(totalPrice),
    };
  };

  const updatePricing = () => {
    const pricing = calculatePricing();
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        basePrice: pricing.basePrice,
        totalPrice: pricing.totalPrice,
      },
    }));
  };

  // Update pricing when relevant fields change
  React.useEffect(() => {
    updatePricing();
  }, [
    formData.service.type,
    formData.service.frequency,
    formData.service.squareFootage,
    formData.pricing.discountPercentage,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate job ID
      const jobId = `JOB-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1,
      ).padStart(2, "0")}-${String(
        Math.floor(Math.random() * 9999) + 1,
      ).padStart(4, "0")}`;

      // Create job object
      const newJob = {
        id: jobId,
        customer: formData.customer.name,
        address: formData.customer.address,
        phone: formData.customer.phone,
        email: formData.customer.email,
        service:
          SERVICE_TYPES.find((s) => s.value === formData.service.type)?.name ||
          formData.service.type,
        crew:
          CREWS.find((c) => c.value === formData.scheduling.assignedCrew)
            ?.name || "Unassigned",
        status: "scheduled",
        priority: formData.scheduling.priority,
        scheduledStart: new Date(
          `${formData.scheduling.date}T${formData.scheduling.startTime}`,
        ),
        estimatedEnd: new Date(
          new Date(
            `${formData.scheduling.date}T${formData.scheduling.startTime}`,
          ).getTime() +
            (parseInt(formData.scheduling.estimatedDuration) || 3) *
              60 *
              60 *
              1000,
        ),
        actualStart: null,
        progress: 0,
        basePrice: formData.pricing.basePrice,
        totalPrice: formData.pricing.totalPrice,
        notes:
          `${formData.service.specialRequirements} ${formData.pricing.notes}`.trim(),
        createdAt: new Date(),
      };

      // In a real app, this would save to the backend
      console.log("Creating job:", newJob);

      toast({
        title: "Job Scheduled Successfully",
        description: `Job ${jobId} has been created and assigned to ${newJob.crew}`,
      });

      if (onJobCreated) {
        onJobCreated(newJob);
      }

      onClose();
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedService = SERVICE_TYPES.find(
    (s) => s.value === formData.service.type,
  );
  const selectedCrew = CREWS.find(
    (c) => c.value === formData.scheduling.assignedCrew,
  );
  const selectedPriority = PRIORITIES.find(
    (p) => p.value === formData.scheduling.priority,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto"
    >
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customer.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customer: { ...prev.customer, name: e.target.value },
                  }))
                }
                placeholder="e.g., Sofia Martinez"
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customer.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customer: { ...prev.customer, phone: e.target.value },
                  }))
                }
                placeholder="+1 (305) 555-0123"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="customerEmail">Email Address</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customer.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customer: { ...prev.customer, email: e.target.value },
                }))
              }
              placeholder="customer@example.com"
            />
          </div>
          <div>
            <Label htmlFor="customerAddress">Service Address *</Label>
            <Textarea
              id="customerAddress"
              value={formData.customer.address}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customer: { ...prev.customer, address: e.target.value },
                }))
              }
              placeholder="1200 Brickell Ave, Miami, FL 33131"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select
                value={formData.service.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    service: { ...prev.service, type: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{service.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ${service.price}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.service.frequency}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    service: { ...prev.service, frequency: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="squareFootage">Square Footage</Label>
            <Input
              id="squareFootage"
              type="number"
              value={formData.service.squareFootage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  service: { ...prev.service, squareFootage: e.target.value },
                }))
              }
              placeholder="2000"
              min="500"
              max="10000"
            />
          </div>

          <div>
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              value={formData.service.specialRequirements}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  service: {
                    ...prev.service,
                    specialRequirements: e.target.value,
                  },
                }))
              }
              placeholder="Pet-safe products, fragile items, access instructions..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="scheduleDate">Service Date *</Label>
              <Input
                id="scheduleDate"
                type="date"
                value={formData.scheduling.date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduling: { ...prev.scheduling, date: e.target.value },
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.scheduling.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduling: {
                      ...prev.scheduling,
                      startTime: e.target.value,
                    },
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Estimated Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.scheduling.estimatedDuration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduling: {
                      ...prev.scheduling,
                      estimatedDuration: e.target.value,
                    },
                  }))
                }
                placeholder="3"
                min="1"
                max="12"
                step="0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignedCrew">Assigned Crew</Label>
              <Select
                value={formData.scheduling.assignedCrew}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduling: { ...prev.scheduling, assignedCrew: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crew" />
                </SelectTrigger>
                <SelectContent>
                  {CREWS.map((crew) => (
                    <SelectItem key={crew.value} value={crew.value}>
                      <div>
                        <div className="font-medium">{crew.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {crew.members.join(", ")}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={formData.scheduling.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduling: { ...prev.scheduling, priority: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${priority.color}`}
                        />
                        {priority.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Pricing Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Base Price:</span>
                <span className="font-medium">
                  ${formData.pricing.basePrice}
                </span>
              </div>

              <div>
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.pricing.discountPercentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        discountPercentage: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="0"
                  min="0"
                  max="50"
                  step="1"
                />
              </div>

              {formData.pricing.discountPercentage > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span>
                    Discount ({formData.pricing.discountPercentage}%):
                  </span>
                  <span>
                    -$
                    {Math.round(
                      (formData.pricing.basePrice *
                        formData.pricing.discountPercentage) /
                        100,
                    )}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Price:</span>
                <span>${formData.pricing.totalPrice}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="pricingNotes">Pricing Notes</Label>
              <Textarea
                id="pricingNotes"
                value={formData.pricing.notes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: { ...prev.pricing, notes: e.target.value },
                  }))
                }
                placeholder="Special pricing considerations..."
              />
            </div>
          </div>

          {/* Job Summary */}
          {formData.service.type && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <AlertTriangle className="mr-1 h-4 w-4" />
                Job Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Service:</strong> {selectedService?.name}
                </div>
                <div>
                  <strong>Customer:</strong>{" "}
                  {formData.customer.name || "Not specified"}
                </div>
                {formData.scheduling.date && formData.scheduling.startTime && (
                  <div>
                    <strong>Scheduled:</strong>{" "}
                    {new Date(
                      `${formData.scheduling.date}T${formData.scheduling.startTime}`,
                    ).toLocaleString()}
                  </div>
                )}
                {selectedCrew && (
                  <div>
                    <strong>Crew:</strong> {selectedCrew.name} (
                    {selectedCrew.members.join(", ")})
                  </div>
                )}
                {selectedPriority && (
                  <div className="flex items-center">
                    <strong>Priority:</strong>
                    <Badge variant="outline" className="ml-2">
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${selectedPriority.color}`}
                      />
                      {selectedPriority.name}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading ||
            !formData.customer.name ||
            !formData.customer.phone ||
            !formData.customer.address ||
            !formData.service.type ||
            !formData.service.frequency ||
            !formData.scheduling.date ||
            !formData.scheduling.startTime
          }
        >
          {isLoading ? "Creating..." : "Schedule Job"}
        </Button>
      </div>
    </form>
  );
}
