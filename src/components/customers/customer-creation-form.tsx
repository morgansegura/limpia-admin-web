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
import { UserPlus, MapPin, Phone, Tag, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Customer } from "@/types/app.types";

interface CustomerCreationFormProps {
  onClose: () => void;
  onCustomerCreated?: (customer: Customer) => void;
}

const CUSTOMER_TYPES = [
  {
    value: "residential",
    name: "Residential",
    description: "Individual homeowner",
  },
  {
    value: "commercial",
    name: "Commercial",
    description: "Business or office",
  },
  {
    value: "realtor",
    name: "Realtor",
    description: "Real estate professional",
  },
  {
    value: "property_manager",
    name: "Property Manager",
    description: "Manages multiple properties",
  },
];

const LEAD_SOURCES = [
  { value: "website", name: "Website" },
  { value: "referral", name: "Referral" },
  { value: "social_media", name: "Social Media" },
  { value: "google_ads", name: "Google Ads" },
  { value: "facebook_ads", name: "Facebook Ads" },
  { value: "phone_call", name: "Phone Call" },
  { value: "walk_in", name: "Walk-in" },
  { value: "other", name: "Other" },
];

const SERVICE_PREFERENCES = [
  { value: "regular_cleaning", name: "Regular Cleaning" },
  { value: "deep_cleaning", name: "Deep Cleaning" },
  { value: "move_in_out", name: "Move In/Out" },
  { value: "post_construction", name: "Post Construction" },
  { value: "commercial", name: "Commercial Cleaning" },
];

export function CustomerCreationForm({
  onClose,
  onCustomerCreated,
}: CustomerCreationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",

    // Address Information
    address: "",
    city: "",
    state: "FL",
    zipCode: "",
    propertyType: "house",
    squareFootage: "",

    // Customer Details
    customerType: "residential",
    leadSource: "",
    referredBy: "",

    // Service Preferences
    preferredServices: [] as string[],
    specialRequirements: "",
    petInfo: "",
    accessInstructions: "",

    // Communication Preferences
    preferredContactMethod: "phone",
    bestTimeToCall: "",
    marketingOptIn: true,
    smsOptIn: false,

    // Additional Notes
    notes: "",
    internalNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate customer ID
      const customerId = `CUST-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`;

      // Create customer object
      const newCustomer: Customer = {
        id: customerId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        status: "New" as const,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        totalBookings: 0,
        totalSpent: 0,
        joinedDate: new Date(),
        preferences: formData.preferredServices,
        preferredContactMethod: formData.preferredContactMethod as
          | "email"
          | "sms"
          | "phone",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVip: false,
        source: formData.leadSource,
        notes: formData.notes,
      };

      // In a real app, this would save to the backend
      console.log("Creating customer:", newCustomer);

      toast({
        title: "Customer Created Successfully",
        description: `Customer ${newCustomer.name} has been added to your database`,
      });

      if (onCustomerCreated) {
        onCustomerCreated(newCustomer);
      }

      onClose();
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServicePreferenceChange = (service: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredServices: checked
        ? [...prev.preferredServices, service]
        : prev.preferredServices.filter((s) => s !== service),
    }));
  };

  const selectedCustomerType = CUSTOMER_TYPES.find(
    (t) => t.value === formData.customerType,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto"
    >
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder="Sofia"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                placeholder="Martinez"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="sofia@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Primary Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1 (305) 555-0123"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="alternatePhone">Alternate Phone</Label>
            <Input
              id="alternatePhone"
              type="tel"
              value={formData.alternatePhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  alternatePhone: e.target.value,
                }))
              }
              placeholder="+1 (305) 555-0124"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="1200 Brickell Ave"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="Miami"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, state: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="GA">Georgia</SelectItem>
                  <SelectItem value="NC">North Carolina</SelectItem>
                  <SelectItem value="SC">South Carolina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
                }
                placeholder="33131"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, propertyType: value }))
                }
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
                  <SelectItem value="retail">Retail Space</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="squareFootage">Square Footage</Label>
              <Input
                id="squareFootage"
                type="number"
                value={formData.squareFootage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    squareFootage: e.target.value,
                  }))
                }
                placeholder="2000"
                min="500"
                max="50000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerType">Customer Type</Label>
              <Select
                value={formData.customerType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, customerType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="leadSource">How did they find us?</Label>
              <Select
                value={formData.leadSource}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, leadSource: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.leadSource === "referral" && (
            <div>
              <Label htmlFor="referredBy">Referred By</Label>
              <Input
                id="referredBy"
                value={formData.referredBy}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    referredBy: e.target.value,
                  }))
                }
                placeholder="Name of person who referred them"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Services (select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {SERVICE_PREFERENCES.map((service) => (
                <div
                  key={service.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`service-${service.value}`}
                    checked={formData.preferredServices.includes(service.value)}
                    onCheckedChange={(checked) =>
                      handleServicePreferenceChange(service.value, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`service-${service.value}`}
                    className="text-sm"
                  >
                    {service.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              value={formData.specialRequirements}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  specialRequirements: e.target.value,
                }))
              }
              placeholder="Eco-friendly products, fragile items, etc."
            />
          </div>

          <div>
            <Label htmlFor="petInfo">Pet Information</Label>
            <Input
              id="petInfo"
              value={formData.petInfo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, petInfo: e.target.value }))
              }
              placeholder="2 dogs, 1 cat - all friendly"
            />
          </div>

          <div>
            <Label htmlFor="accessInstructions">Access Instructions</Label>
            <Textarea
              id="accessInstructions"
              value={formData.accessInstructions}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  accessInstructions: e.target.value,
                }))
              }
              placeholder="Key location, gate code, parking instructions, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Phone className="mr-2 h-5 w-5" />
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferredContactMethod">
                Preferred Contact Method
              </Label>
              <Select
                value={formData.preferredContactMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    preferredContactMethod: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                  <SelectItem value="any">Any Method</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bestTimeToCall">Best Time to Call</Label>
              <Input
                id="bestTimeToCall"
                value={formData.bestTimeToCall}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bestTimeToCall: e.target.value,
                  }))
                }
                placeholder="9 AM - 5 PM weekdays"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketingOptIn"
                checked={formData.marketingOptIn}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    marketingOptIn: !!checked,
                  }))
                }
              />
              <Label htmlFor="marketingOptIn">
                Opt-in to marketing emails (service updates, promotions, tips)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsOptIn"
                checked={formData.smsOptIn}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, smsOptIn: !!checked }))
                }
              />
              <Label htmlFor="smsOptIn">
                Opt-in to SMS notifications (appointment reminders, service
                updates)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Customer Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional information about the customer..."
            />
          </div>

          <div>
            <Label htmlFor="internalNotes">
              Internal Notes (Customer won&apos;t see this)
            </Label>
            <Textarea
              id="internalNotes"
              value={formData.internalNotes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  internalNotes: e.target.value,
                }))
              }
              placeholder="Internal team notes, pricing considerations, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Summary */}
      {formData.firstName && formData.lastName && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Customer Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {formData.firstName}{" "}
                  {formData.lastName}
                </div>
                <div>
                  <strong>Type:</strong> {selectedCustomerType?.name}
                </div>
                <div>
                  <strong>Contact:</strong> {formData.phone} | {formData.email}
                </div>
                {formData.address && formData.city && (
                  <div>
                    <strong>Address:</strong> {formData.address},{" "}
                    {formData.city}, {formData.state}
                  </div>
                )}
                {formData.preferredServices.length > 0 && (
                  <div>
                    <strong>Interested In:</strong>{" "}
                    {formData.preferredServices
                      .map(
                        (s) =>
                          SERVICE_PREFERENCES.find((sp) => sp.value === s)
                            ?.name,
                      )
                      .join(", ")}
                  </div>
                )}
                {formData.leadSource && (
                  <div>
                    <strong>Found Us Via:</strong>{" "}
                    {
                      LEAD_SOURCES.find(
                        (ls) => ls.value === formData.leadSource,
                      )?.name
                    }
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading ||
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.phone ||
            !formData.address ||
            !formData.city ||
            !formData.zipCode
          }
        >
          {isLoading ? "Creating..." : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
