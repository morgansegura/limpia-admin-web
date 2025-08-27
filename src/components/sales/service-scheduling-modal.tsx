"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Note: Using HTML date input instead of calendar component
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWorkflow } from "@/hooks/useWorkflow";

interface ServiceSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: string;
  customerName: string;
  serviceType: string;
  estimatedDuration: number;
  onServiceScheduled: (scheduleData: unknown) => void;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  crewId?: string;
  crewName?: string;
  isPreferred?: boolean;
}

const SERVICE_DURATIONS = {
  deep_cleaning: 240, // 4 hours
  recurring_cleaning: 120, // 2 hours
  one_time_cleaning: 180, // 3 hours
  move_in_out: 360, // 6 hours
  post_construction: 480, // 8 hours
};

const TIME_PREFERENCES = [
  { value: "morning", label: "Morning (8am - 12pm)", icon: "🌅" },
  { value: "afternoon", label: "Afternoon (12pm - 5pm)", icon: "☀️" },
  { value: "evening", label: "Evening (5pm - 8pm)", icon: "🌆" },
];

export function ServiceSchedulingModal({
  isOpen,
  onClose,
  estimateId,
  customerName,
  serviceType,
  estimatedDuration,
  onServiceScheduled,
}: ServiceSchedulingModalProps) {
  const { toast } = useToast();
  const { getAvailableSlots, loading } = useWorkflow();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    preferredTime: "",
    specialInstructions: "",
    accessInstructions: "",
    petInstructions: "",
    preferredCrew: "",
    frequencyType: "one_time",
    recurringDays: [] as string[],
  });

  const duration =
    SERVICE_DURATIONS[serviceType as keyof typeof SERVICE_DURATIONS] ||
    estimatedDuration;

  // Load available slots (moved after loadAvailableSlots declaration)

  const loadAvailableSlots = useCallback(async () => {
    if (!selectedDate) return;

    setIsLoadingSlots(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const slots = await getAvailableSlots(dateStr, serviceType);
      setAvailableSlots((slots as TimeSlot[]) || generateMockSlots());
    } catch (error) {
      console.warn("Failed to load slots, using mock data:", error);
      setAvailableSlots(generateMockSlots());
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDate, serviceType, getAvailableSlots]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, serviceType, loadAvailableSlots]);

  const generateMockSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const times = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

    times.forEach((time, index) => {
      slots.push({
        id: `slot-${index}`,
        time,
        available: Math.random() > 0.3, // 70% availability
        crewId: `crew-${Math.floor(Math.random() * 3) + 1}`,
        crewName: `Crew ${Math.floor(Math.random() * 3) + 1}`,
        isPreferred: index < 3, // Morning slots preferred
      });
    });

    return slots;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedSlot) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time slot",
        variant: "destructive",
      });
      return;
    }

    const selectedSlotData = availableSlots.find(
      (slot) => slot.id === selectedSlot,
    );

    try {
      const scheduleData = {
        estimateId,
        scheduledDate: selectedDate.toISOString(),
        timeSlot: selectedSlotData?.time,
        crewId: selectedSlotData?.crewId,
        duration,
        serviceType,
        ...formData,
        metadata: {
          customerName,
          estimatedDuration: duration,
          createdAt: new Date().toISOString(),
        },
      };

      await onServiceScheduled(scheduleData);

      toast({
        title: "Service Scheduled",
        description: `Service scheduled for ${selectedDate.toLocaleDateString()} at ${selectedSlotData?.time}`,
      });

      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to schedule service";
      toast({
        title: "Scheduling Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Date validation is now handled by the min attribute on the input

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Schedule Service - {customerName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Service Date</Label>
                  <div className="mt-2">
                    <Input
                      type="date"
                      value={
                        selectedDate
                          ? selectedDate.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        handleDateSelect(date);
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full"
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <Label>Available Time Slots</Label>
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-4">
                          <Clock className="w-4 h-4 animate-spin mr-2" />
                          Loading available slots...
                        </div>
                      ) : availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                              !slot.available
                                ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-50"
                                : selectedSlot === slot.id
                                  ? "bg-blue-50 border-blue-300"
                                  : "hover:bg-gray-50"
                            }`}
                            onClick={() =>
                              slot.available && setSelectedSlot(slot.id)
                            }
                          >
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4" />
                              <div>
                                <div className="font-medium">{slot.time}</div>
                                {slot.crewName && (
                                  <div className="text-sm text-gray-600">
                                    {slot.crewName}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {slot.isPreferred && (
                                <Badge variant="secondary" className="text-xs">
                                  Preferred
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  slot.available ? "default" : "secondary"
                                }
                              >
                                {slot.available ? "Available" : "Booked"}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                          No available slots for this date
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Service Type</Label>
                      <Input
                        value={serviceType.replace("_", " ")}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label>Estimated Duration</Label>
                      <Input
                        value={`${Math.floor(duration / 60)}h ${duration % 60}m`}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preferredTime">Time Preference</Label>
                    <Select
                      value={formData.preferredTime}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          preferredTime: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred time of day" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_PREFERENCES.map((pref) => (
                          <SelectItem key={pref.value} value={pref.value}>
                            <div className="flex items-center gap-2">
                              <span>{pref.icon}</span>
                              <span>{pref.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="frequencyType">Service Frequency</Label>
                    <Select
                      value={formData.frequencyType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          frequencyType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">
                          One-Time Service
                        </SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Service Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="accessInstructions">
                      Access Instructions
                    </Label>
                    <Textarea
                      id="accessInstructions"
                      value={formData.accessInstructions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accessInstructions: e.target.value,
                        }))
                      }
                      placeholder="How should the crew access the property? (keys, codes, etc.)"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="petInstructions">Pet Information</Label>
                    <Textarea
                      id="petInstructions"
                      value={formData.petInstructions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          petInstructions: e.target.value,
                        }))
                      }
                      placeholder="Any pets at the property? Special considerations?"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialInstructions">
                      Special Instructions
                    </Label>
                    <Textarea
                      id="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          specialInstructions: e.target.value,
                        }))
                      }
                      placeholder="Any specific cleaning requests or areas to focus on?"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedDate && selectedSlot && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    Scheduled for {selectedDate.toLocaleDateString()} at{" "}
                    {availableSlots.find((s) => s.id === selectedSlot)?.time}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedDate || !selectedSlot}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4" />
                    Schedule Service
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
