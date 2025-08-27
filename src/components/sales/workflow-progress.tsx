"use client";

import { useState } from "react";
import {
  Check,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  CreditCard,
  Calendar,
  Users,
  Bell,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EstimateWorkflow, WorkflowStep } from "@/hooks/useWorkflow";
import { UserRole } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface WorkflowProgressProps {
  workflow: EstimateWorkflow;
  onStepAction?: (stepId: string, action: string, data?: unknown) => void;
}

const STEP_ICONS = {
  estimate_accepted: Check,
  contract_signing: FileText,
  payment_processing: CreditCard,
  service_scheduling: Calendar,
  crew_assignment: Users,
  customer_notifications: Bell,
  service_preparation: Wrench,
};

const STEP_COLORS = {
  pending: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-600",
  failed: "bg-red-100 text-red-600",
};

export function WorkflowProgress({
  workflow,
  onStepAction,
}: WorkflowProgressProps) {
  const { user } = useAuth();
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canManageWorkflow =
    user?.role === UserRole.SALES_MANAGER ||
    user?.role === UserRole.FRANCHISE_OWNER ||
    user?.role === UserRole.CORPORATE_EXECUTIVE;

  const getStepIcon = (stepId: string, status: WorkflowStep["status"]) => {
    const IconComponent =
      STEP_ICONS[stepId as keyof typeof STEP_ICONS] || Clock;

    if (status === "in_progress") {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (status === "failed") {
      return <AlertCircle className="w-4 h-4" />;
    }
    if (status === "completed") {
      return <Check className="w-4 h-4" />;
    }

    return <IconComponent className="w-4 h-4" />;
  };

  const handleStepClick = (step: WorkflowStep) => {
    if (canManageWorkflow && step.status !== "completed") {
      setSelectedStep(step);
      setIsDialogOpen(true);
    }
  };

  const handleStepAction = (action: string, data?: unknown) => {
    if (selectedStep && onStepAction) {
      onStepAction(selectedStep.id, action, data);
      setIsDialogOpen(false);
      setSelectedStep(null);
    }
  };

  const renderStepActions = (step: WorkflowStep) => {
    if (!canManageWorkflow) return null;

    switch (step.id) {
      case "contract_signing":
        return (
          <div className="space-y-2">
            <Button
              onClick={() => handleStepAction("initiate_contract")}
              className="w-full"
              disabled={step.status === "completed"}
            >
              Send Contract for Signature
            </Button>
            {(step.data as { signatureUrl?: string })?.signatureUrl && (
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    (step.data as { signatureUrl: string }).signatureUrl,
                    "_blank",
                  )
                }
                className="w-full"
              >
                View Contract Status
              </Button>
            )}
          </div>
        );

      case "payment_processing":
        return (
          <div className="space-y-2">
            <Button
              onClick={() => handleStepAction("process_payment")}
              className="w-full"
              disabled={step.status === "completed"}
            >
              Process Payment
            </Button>
            {(step.data as { paymentId?: string })?.paymentId && (
              <p className="text-sm text-gray-600">
                Payment ID: {(step.data as { paymentId: string }).paymentId}
              </p>
            )}
          </div>
        );

      case "service_scheduling":
        return (
          <div className="space-y-2">
            <Button
              onClick={() => handleStepAction("schedule_service")}
              className="w-full"
              disabled={step.status === "completed"}
            >
              Schedule Service
            </Button>
            {(step.data as { scheduledDate?: string })?.scheduledDate && (
              <p className="text-sm text-gray-600">
                Scheduled:{" "}
                {new Date(
                  (step.data as { scheduledDate: string }).scheduledDate,
                ).toLocaleDateString()}
              </p>
            )}
          </div>
        );

      case "crew_assignment":
        return (
          <div className="space-y-2">
            <Button
              onClick={() => handleStepAction("assign_crew")}
              className="w-full"
              disabled={step.status === "completed"}
            >
              Assign Crew
            </Button>
            {(step.data as { crewId?: string })?.crewId && (
              <p className="text-sm text-gray-600">
                Crew:{" "}
                {(step.data as { crewName?: string; crewId: string })
                  .crewName ||
                  (step.data as { crewName?: string; crewId: string }).crewId}
              </p>
            )}
          </div>
        );

      case "customer_notifications":
        return (
          <div className="space-y-2">
            <Button
              onClick={() => handleStepAction("send_notifications")}
              className="w-full"
              disabled={step.status === "completed"}
            >
              Send Notifications
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStepAction("preview_notifications")}
              className="w-full"
            >
              Preview Messages
            </Button>
          </div>
        );

      case "service_preparation":
        return (
          <div className="space-y-2">
            <Button
              onClick={() => handleStepAction("prepare_service")}
              className="w-full"
              disabled={step.status === "completed"}
            >
              Mark Prepared
            </Button>
            {(step.data as { equipmentChecked?: boolean })
              ?.equipmentChecked && (
              <p className="text-sm text-green-600">✓ Equipment checked</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Workflow Progress</span>
          <Badge variant={workflow.isActive ? "default" : "secondary"}>
            {workflow.isActive ? "Active" : "Completed"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Customer: {workflow.customerName}</span>
            <span>
              Step {workflow.currentStep + 1} of {workflow.steps.length}
            </span>
          </div>

          <div className="space-y-3">
            {workflow.steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  index <= workflow.currentStep
                    ? "border-blue-200"
                    : "border-gray-200"
                } ${canManageWorkflow && step.status !== "completed" ? "cursor-pointer hover:bg-gray-50" : ""}`}
                onClick={() => handleStepClick(step)}
              >
                <div className={`p-2 rounded-full ${STEP_COLORS[step.status]}`}>
                  {getStepIcon(step.id, step.status)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{step.name}</h4>
                    <Badge
                      variant={
                        step.status === "completed" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {step.status.replace("_", " ")}
                    </Badge>
                  </div>

                  {step.error && (
                    <p className="text-sm text-red-600 mt-1">{step.error}</p>
                  )}

                  {step.data !== null && step.status === "completed" && (
                    <p className="text-sm text-gray-600 mt-1">
                      Completed:{" "}
                      {new Date(
                        (step.data as { completedAt?: string }).completedAt ||
                          Date.now(),
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {workflow.isActive && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Next Step:</strong>{" "}
                {workflow.steps[workflow.currentStep]?.name ||
                  "Workflow Complete"}
              </p>
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedStep?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedStep && renderStepActions(selectedStep)}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
