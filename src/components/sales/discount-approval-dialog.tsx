"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Send, DollarSign, Percent } from "lucide-react";
import { salesApi } from "@/lib/api";

interface DiscountApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprovalRequested: () => void;
  discountData: {
    discountAmount: number;
    discountPercentage: number;
    basePrice: number;
    finalPrice: number;
    exceedsThreshold: boolean;
    exceedsBudget: boolean;
    budgetUsed: number;
    budgetLimit: number;
  };
  customerInfo?: {
    name?: string;
    email?: string;
    serviceType?: string;
    squareFootage?: string;
  };
}

export function DiscountApprovalDialog({
  isOpen,
  onClose,
  onApprovalRequested,
  discountData,
  customerInfo,
}: DiscountApprovalDialogProps) {
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitApproval = async () => {
    if (!justification.trim()) {
      // TODO: Replace with proper form validation UI
      console.warn("Justification required for discount approval");
      return;
    }

    console.log("📨 Submitting discount approval request:", {
      discountAmount: discountData.discountAmount,
      discountPercentage: discountData.discountPercentage,
      justification: justification.trim(),
      customerInfo: customerInfo || {},
    });

    setIsSubmitting(true);
    try {
      await salesApi.requestDiscountApproval({
        discountAmount: discountData.discountAmount,
        discountPercentage: discountData.discountPercentage,
        justification: justification.trim(),
        customerInfo: customerInfo || {},
      });

      console.log("✅ Discount approval request sent successfully");
      // TODO: Replace with toast notification
      onApprovalRequested();
      onClose();
      setJustification("");
    } catch (error: any) {
      console.error("❌ Failed to request discount approval:", error);
      
      // Handle authentication errors specifically
      if (error?.response?.status === 401 || error?.message?.includes('jwt expired')) {
        console.error("Session expired - user needs to refresh");
        // TODO: Replace with proper toast notification
      } else {
        console.error("Failed to send approval request:", error);
        // TODO: Replace with proper toast notification
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasons = [];
  if (discountData.exceedsThreshold) {
    reasons.push(
      `Discount exceeds ${discountData.discountPercentage > 20 ? "20%" : "$50"} threshold`
    );
  }
  if (discountData.exceedsBudget) {
    reasons.push("Would exceed monthly discount budget");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-yellow-700">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Request Manager Approval
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Discount Summary */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-yellow-800">Discount Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span className="font-medium">${discountData.basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Final Price:</span>
                <span className="font-medium">${discountData.finalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span className="flex items-center">
                  <Percent className="w-4 h-4 mr-1" />
                  Discount:
                </span>
                <span className="font-medium">
                  {discountData.discountPercentage}% (${discountData.discountAmount.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Budget Impact:
                </span>
                <span className="font-medium">
                  ${(discountData.budgetUsed + discountData.discountAmount).toFixed(2)} / ${discountData.budgetLimit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {customerInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-blue-800">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {customerInfo.name && (
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <div className="font-medium">{customerInfo.name}</div>
                  </div>
                )}
                {customerInfo.email && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{customerInfo.email}</div>
                  </div>
                )}
                {customerInfo.serviceType && (
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <div className="font-medium capitalize">{customerInfo.serviceType.replace(/_/g, " ")}</div>
                  </div>
                )}
                {customerInfo.squareFootage && (
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <div className="font-medium">{customerInfo.squareFootage} sq ft</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approval Reasons */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2">Approval Required Because:</h3>
            <ul className="space-y-1 text-sm text-red-700">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <Label htmlFor="justification">
              Justification for Discount <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="justification"
              placeholder="Explain why this discount is necessary (e.g., competitive pricing, customer retention, special circumstances)..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-gray-500">
              Provide a clear business justification for your sales manager to review.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitApproval} 
              disabled={!justification.trim() || isSubmitting}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Request Approval
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}