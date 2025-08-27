"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CrewFormProps {
  onClose: () => void;
}

const availableSpecializations = [
  "Residential",
  "Commercial",
  "Deep Clean",
  "Regular Cleaning",
  "Move-in/Move-out",
  "Post-Construction",
  "Carpet Cleaning",
  "Window Cleaning",
];

const availableAreas = [
  "Downtown Miami",
  "Miami Beach",
  "Coral Gables",
  "Coconut Grove",
  "Brickell",
  "Wynwood",
  "Little Havana",
  "Aventura",
];

export function CrewForm({ onClose }: CrewFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: 4,
    specializations: [] as string[],
    serviceAreas: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    console.log("Creating crew:", formData);
    onClose();
  };

  const addSpecialization = (spec: string) => {
    if (!formData.specializations.includes(spec)) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, spec],
      });
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter((s) => s !== spec),
    });
  };

  const addServiceArea = (area: string) => {
    if (!formData.serviceAreas.includes(area)) {
      setFormData({
        ...formData,
        serviceAreas: [...formData.serviceAreas, area],
      });
    }
  };

  const removeServiceArea = (area: string) => {
    setFormData({
      ...formData,
      serviceAreas: formData.serviceAreas.filter((a) => a !== area),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Crew Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Alpha Team"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Brief description of the crew..."
        />
      </div>

      <div>
        <Label htmlFor="maxMembers">Maximum Members</Label>
        <Select
          value={formData.maxMembers.toString()}
          onValueChange={(value) =>
            setFormData({ ...formData, maxMembers: parseInt(value) })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 members</SelectItem>
            <SelectItem value="3">3 members</SelectItem>
            <SelectItem value="4">4 members</SelectItem>
            <SelectItem value="5">5 members</SelectItem>
            <SelectItem value="6">6 members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Specializations</Label>
        <Select onValueChange={addSpecialization}>
          <SelectTrigger>
            <SelectValue placeholder="Add specialization..." />
          </SelectTrigger>
          <SelectContent>
            {availableSpecializations
              .filter((spec) => !formData.specializations.includes(spec))
              .map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.specializations.map((spec) => (
            <Badge key={spec} variant="secondary" className="text-xs">
              {spec}
              <button
                type="button"
                onClick={() => removeSpecialization(spec)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Service Areas</Label>
        <Select onValueChange={addServiceArea}>
          <SelectTrigger>
            <SelectValue placeholder="Add service area..." />
          </SelectTrigger>
          <SelectContent>
            {availableAreas
              .filter((area) => !formData.serviceAreas.includes(area))
              .map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.serviceAreas.map((area) => (
            <Badge key={area} variant="outline" className="text-xs">
              {area}
              <button
                type="button"
                onClick={() => removeServiceArea(area)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Crew</Button>
      </div>
    </form>
  );
}
