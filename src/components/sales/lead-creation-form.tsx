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
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Star,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeadCreationFormProps {
  onClose: () => void;
  onLeadCreated?: (lead: any) => void;
}

const LEAD_SOURCES = [
  { value: "website", name: "Website Form" },
  { value: "phone", name: "Phone Inquiry" },
  { value: "referral", name: "Customer Referral" },
  { value: "social_media", name: "Social Media" },
  { value: "google_ads", name: "Google Ads" },
  { value: "facebook_ads", name: "Facebook Ads" },
  { value: "yelp", name: "Yelp" },
  { value: "nextdoor", name: "Nextdoor" },
  { value: "walk_in", name: "Walk-in" },
  { value: "other", name: "Other" },
];

const SERVICE_INTERESTS = [
  { value: "regular_cleaning", name: "Regular Cleaning" },
  { value: "deep_clean_blue", name: "Deep Clean Blue" },
  { value: "deep_clean_shine", name: "Deep Clean Shine" },
  { value: "deep_clean_combo", name: "Deep Clean Combo" },
  { value: "move_in_out", name: "Move In/Out" },
  { value: "post_construction", name: "Post Construction" },
  { value: "commercial", name: "Commercial Cleaning" },
  { value: "one_time", name: "One-Time Service" },
];

const LEAD_PRIORITIES = [
  { value: "low", name: "Low Priority" },
  { value: "medium", name: "Medium Priority" },
  { value: "high", name: "High Priority" },
  { value: "urgent", name: "Urgent" },
];

export function LeadCreationForm({
  onClose,
  onLeadCreated,
}: LeadCreationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Contact Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // Address Information
    address: "",
    city: "",
    state: "FL",
    zipCode: "",
    propertyType: "house",

    // Lead Details
    leadSource: "",
    referredBy: "",
    serviceInterest: [] as string[],
    estimatedValue: "",
    priority: "medium",

    // Communication
    preferredContactMethod: "phone",
    bestTimeToCall: "",
    urgency: "no_rush",

    // Additional Information
    notes: "",
    specialRequirements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate lead ID
      const leadId = `LEAD-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1,
      ).padStart(2, "0")}-${String(
        Math.floor(Math.random() * 9999) + 1,
      ).padStart(4, "0")}`;

      // Create lead object
      const newLead = {
        id: leadId,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address:
          `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim(),
        fullAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        propertyType: formData.propertyType,
        leadSource: formData.leadSource,
        referredBy: formData.referredBy,
        serviceInterest: formData.serviceInterest,
        estimatedValue: formData.estimatedValue
          ? parseFloat(formData.estimatedValue)
          : 0,
        priority: formData.priority,
        preferredContactMethod: formData.preferredContactMethod,
        bestTimeToCall: formData.bestTimeToCall,
        urgency: formData.urgency,
        notes: formData.notes,
        specialRequirements: formData.specialRequirements,
        status: "new",
        score: 0,
        followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        createdAt: new Date(),
        lastContact: null,
        nextAction: "Initial Contact",
      };

      // In a real app, this would save to the backend
      console.log("Creating lead:", newLead);

      toast({
        title: "Lead Created Successfully",
        description: `Lead ${leadId} has been added to your pipeline`,
      });

      if (onLeadCreated) {
        onLeadCreated(newLead);
      }

      onClose();
    } catch (error) {
      console.error("Error creating lead:", error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceInterestChange = (service: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      serviceInterest: checked
        ? [...prev.serviceInterest, service]
        : prev.serviceInterest.filter((s) => s !== service),
    }));
  };

  const selectedPriority = LEAD_PRIORITIES.find(
    (p) => p.value === formData.priority,
  );
  const selectedSource = LEAD_SOURCES.find(
    (s) => s.value === formData.leadSource,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto"
    >
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Contact Information
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
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="sofia@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+1 (305) 555-0123"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Property Address *</Label>
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
              <Label htmlFor="state">State</Label>
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
        </CardContent>
      </Card>

      {/* Lead Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Lead Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.name}
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

          <div>
            <Label>Services of Interest</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {SERVICE_INTERESTS.map((service) => (
                <div
                  key={service.value}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id={`service-${service.value}`}
                    checked={formData.serviceInterest.includes(service.value)}
                    onChange={(e) =>
                      handleServiceInterestChange(
                        service.value,
                        e.target.checked,
                      )
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
            <Label htmlFor="estimatedValue">Estimated Project Value ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedValue: e.target.value,
                  }))
                }
                placeholder="0"
                className="pl-10"
                min="0"
                step="50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication Preferences</CardTitle>
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
              <Label htmlFor="urgency">Timeline</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, urgency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">ASAP</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="no_rush">No Rush</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              placeholder="Eco-friendly products, pet considerations, access instructions..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Lead Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional information about this lead..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Lead Summary */}
      {formData.firstName && formData.lastName && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="mr-1 h-4 w-4" />
              Lead Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Contact:</strong> {formData.firstName}{" "}
                  {formData.lastName}
                </div>
                <div>
                  <strong>Phone:</strong> {formData.phone}
                </div>
                <div>
                  <strong>Email:</strong> {formData.email}
                </div>
                {formData.address && formData.city && (
                  <div>
                    <strong>Property:</strong> {formData.address},{" "}
                    {formData.city}, {formData.state}
                  </div>
                )}
                {selectedPriority && (
                  <div className="flex items-center">
                    <strong>Priority:</strong>
                    <Badge variant="outline" className="ml-2">
                      {selectedPriority.name}
                    </Badge>
                  </div>
                )}
                {formData.serviceInterest.length > 0 && (
                  <div>
                    <strong>Interested In:</strong>{" "}
                    {formData.serviceInterest
                      .map(
                        (s) =>
                          SERVICE_INTERESTS.find((si) => si.value === s)?.name,
                      )
                      .join(", ")}
                  </div>
                )}
                {selectedSource && (
                  <div>
                    <strong>Lead Source:</strong> {selectedSource.name}
                  </div>
                )}
                {formData.estimatedValue && (
                  <div>
                    <strong>Est. Value:</strong> ${formData.estimatedValue}
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
          {isLoading ? "Creating..." : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
