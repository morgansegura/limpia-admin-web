"use client";

import { useState } from "react";
import { Phone, User, Save, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PhoneCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  onCallLogged: (callData: {
    duration: number;
    notes: string;
    outcome: string;
    followUpRequired: boolean;
  }) => void;
}

const CALL_OUTCOMES = [
  {
    value: "connected",
    label: "Connected - Spoke with customer",
    color: "bg-green-500",
  },
  { value: "voicemail", label: "Left voicemail", color: "bg-yellow-500" },
  { value: "no_answer", label: "No answer", color: "bg-gray-500" },
  { value: "busy", label: "Line busy", color: "bg-orange-500" },
  {
    value: "disconnected",
    label: "Disconnected/Invalid number",
    color: "bg-red-500",
  },
  {
    value: "callback_requested",
    label: "Customer requested callback",
    color: "bg-blue-500",
  },
];

const CALL_PURPOSES = [
  "Service inquiry",
  "Estimate follow-up",
  "Appointment confirmation",
  "Service feedback",
  "Payment inquiry",
  "General support",
  "Sales outreach",
  "Quality check",
  "Complaint resolution",
  "Other",
];

export function PhoneCallModal({
  isOpen,
  onClose,
  customer,
  onCallLogged,
}: PhoneCallModalProps) {
  const { toast } = useToast();
  const [callState, setCallState] = useState<
    "ready" | "calling" | "connected" | "completed"
  >("ready");
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [formData, setFormData] = useState({
    purpose: "",
    outcome: "",
    notes: "",
    followUpRequired: false,
    followUpDate: "",
    nextAction: "",
    customerMood: "neutral",
    issueResolved: false,
  });

  const startCall = () => {
    setCallState("calling");
    setCallStartTime(new Date());

    // Simulate calling process
    setTimeout(() => {
      setCallState("connected");
      toast({
        title: "Call Connected",
        description: `Connected to ${customer.name}`,
      });
    }, 2000);
  };

  const endCall = () => {
    if (callStartTime) {
      const duration = Math.floor(
        (new Date().getTime() - callStartTime.getTime()) / 1000,
      );
      setCallDuration(duration);
    }
    setCallState("completed");
  };

  const saveCallLog = async () => {
    const callData = {
      customerId: customer.id,
      customerName: customer.name,
      phoneNumber: customer.phone,
      startTime: callStartTime?.toISOString(),
      duration: callDuration,
      purpose: formData.purpose,
      outcome: formData.outcome,
      notes: formData.notes,
      followUpRequired: formData.followUpRequired,
      followUpDate: formData.followUpDate,
      nextAction: formData.nextAction,
      customerMood: formData.customerMood,
      issueResolved: formData.issueResolved,
      createdAt: new Date().toISOString(),
    };

    try {
      await onCallLogged(callData);

      toast({
        title: "Call Logged",
        description: `Call with ${customer.name} has been logged successfully`,
      });

      onClose();

      // Reset form
      setCallState("ready");
      setCallStartTime(null);
      setCallDuration(0);
      setFormData({
        purpose: "",
        outcome: "",
        notes: "",
        followUpRequired: false,
        followUpDate: "",
        nextAction: "",
        customerMood: "neutral",
        issueResolved: false,
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to log call",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Phone Call - {customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      callState === "connected" ? "default" : "secondary"
                    }
                  >
                    {callState.replace("_", " ").toUpperCase()}
                  </Badge>
                  {callState === "connected" && callStartTime && (
                    <div className="text-sm text-gray-600 mt-1">
                      Duration:{" "}
                      {formatDuration(
                        Math.floor(
                          (Date.now() - callStartTime.getTime()) / 1000,
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Controls */}
          {callState === "ready" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Initiate Call</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="purpose">Call Purpose</Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, purpose: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select call purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALL_PURPOSES.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={startCall}
                  className="w-full"
                  disabled={!formData.purpose}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Start Call to {customer.phone}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Calling State */}
          {callState === "calling" && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="animate-pulse">
                    <Phone className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium">
                    Calling {customer.name}...
                  </h3>
                  <p className="text-gray-600">{customer.phone}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connected State */}
          {callState === "connected" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Call In Progress</span>
                  <Button onClick={endCall} variant="destructive">
                    <X className="w-4 h-4 mr-2" />
                    End Call
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="liveNotes">Call Notes</Label>
                  <Textarea
                    id="liveNotes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Take notes during the call..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call Completed - Log Details */}
          {callState === "completed" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Log Call Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Call Duration</Label>
                    <div className="text-lg font-medium">
                      {formatDuration(callDuration)}
                    </div>
                  </div>
                  <div>
                    <Label>Call Time</Label>
                    <div className="text-sm text-gray-600">
                      {callStartTime?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="outcome">Call Outcome *</Label>
                  <Select
                    value={formData.outcome}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, outcome: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select call outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALL_OUTCOMES.map((outcome) => (
                        <SelectItem key={outcome.value} value={outcome.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${outcome.color}`}
                            />
                            <span>{outcome.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="callNotes">Call Notes</Label>
                  <Textarea
                    id="callNotes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Detailed notes about the call..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="customerMood">Customer Mood</Label>
                  <Select
                    value={formData.customerMood}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, customerMood: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">😊 Happy</SelectItem>
                      <SelectItem value="satisfied">🙂 Satisfied</SelectItem>
                      <SelectItem value="neutral">😐 Neutral</SelectItem>
                      <SelectItem value="concerned">😟 Concerned</SelectItem>
                      <SelectItem value="frustrated">😠 Frustrated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="followUpRequired"
                    checked={formData.followUpRequired}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        followUpRequired: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="followUpRequired">Follow-up required</Label>
                </div>

                {formData.followUpRequired && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="followUpDate">Follow-up Date</Label>
                      <Input
                        id="followUpDate"
                        type="date"
                        value={formData.followUpDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            followUpDate: e.target.value,
                          }))
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nextAction">Next Action</Label>
                      <Input
                        id="nextAction"
                        value={formData.nextAction}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nextAction: e.target.value,
                          }))
                        }
                        placeholder="e.g., Send estimate, Schedule visit"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={saveCallLog} disabled={!formData.outcome}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Call Log
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
