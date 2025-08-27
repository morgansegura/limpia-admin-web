"use client";

import { useState } from "react";
import {
  CreditCard,
  DollarSign,
  Shield,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: string;
  customerName: string;
  totalAmount: number;
  onPaymentProcessed: (paymentData: unknown) => void;
}

const PAYMENT_METHODS = [
  { id: "credit_card", name: "Credit Card", icon: "💳", fee: 2.9 },
  { id: "bank_transfer", name: "Bank Transfer (ACH)", icon: "🏦", fee: 0.8 },
  { id: "check", name: "Check", icon: "📝", fee: 0 },
  { id: "cash", name: "Cash", icon: "💵", fee: 0 },
];

const PAYMENT_SCHEDULES = [
  {
    id: "full_upfront",
    name: "Full Payment Upfront",
    description: "Pay total amount now",
  },
  {
    id: "deposit_balance",
    name: "Deposit + Balance",
    description: "50% now, 50% on completion",
  },
  {
    id: "monthly",
    name: "Monthly Payments",
    description: "Split into monthly installments",
  },
  {
    id: "service_payment",
    name: "Pay Per Service",
    description: "Pay after each service",
  },
];

export function PaymentProcessingModal({
  isOpen,
  onClose,
  estimateId,
  customerName,
  totalAmount,
  onPaymentProcessed,
}: PaymentProcessingModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "setup" | "processing" | "complete"
  >("setup");
  const [formData, setFormData] = useState({
    paymentMethod: "",
    paymentSchedule: "full_upfront",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    bankAccount: {
      routingNumber: "",
      accountNumber: "",
      accountType: "checking",
    },
    savePaymentMethod: false,
    autoPayEnabled: false,
    tipAmount: 0,
    discountCode: "",
  });

  const selectedMethod = PAYMENT_METHODS.find(
    (m) => m.id === formData.paymentMethod,
  );
  const processingFee = selectedMethod
    ? (totalAmount * selectedMethod.fee) / 100
    : 0;
  const finalAmount = totalAmount + processingFee + formData.tipAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPaymentStep("processing");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const paymentData = {
        estimateId,
        paymentMethod: formData.paymentMethod,
        paymentSchedule: formData.paymentSchedule,
        amount: finalAmount,
        processingFee,
        tipAmount: formData.tipAmount,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          customerName,
          originalAmount: totalAmount,
          processingFee,
          paymentMethodName: selectedMethod?.name,
          createdAt: new Date().toISOString(),
        },
      };

      await onPaymentProcessed(paymentData);

      setPaymentStep("complete");

      setTimeout(() => {
        toast({
          title: "Payment Successful",
          description: `Payment of $${finalAmount.toFixed(2)} processed successfully`,
        });
        onClose();
      }, 2000);
    } catch (error: unknown) {
      setPaymentStep("setup");
      const errorMessage =
        error instanceof Error ? error.message : "Payment processing failed";
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentForm = () => {
    switch (formData.paymentMethod) {
      case "credit_card":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cardNumber: e.target.value,
                  }))
                }
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  value={formData.cvv}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cvv: e.target.value }))
                  }
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                value={formData.cardholderName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cardholderName: e.target.value,
                  }))
                }
                placeholder="John Doe"
                required
              />
            </div>
          </div>
        );

      case "bank_transfer":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="routingNumber">Routing Number *</Label>
              <Input
                id="routingNumber"
                value={formData.bankAccount.routingNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bankAccount: {
                      ...prev.bankAccount,
                      routingNumber: e.target.value,
                    },
                  }))
                }
                placeholder="123456789"
                maxLength={9}
                required
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.bankAccount.accountNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bankAccount: {
                      ...prev.bankAccount,
                      accountNumber: e.target.value,
                    },
                  }))
                }
                placeholder="Account number"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={formData.bankAccount.accountType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, accountType: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Select a payment method to continue
          </div>
        );
    }
  };

  if (paymentStep === "processing") {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600">
              Please wait while we process your payment...
            </p>
            <div className="mt-4">
              <Badge>Amount: ${finalAmount.toFixed(2)}</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (paymentStep === "complete") {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-gray-600">
              Your payment has been processed successfully.
            </p>
            <div className="mt-4">
              <Badge variant="default">Paid: ${finalAmount.toFixed(2)}</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Process Payment - {customerName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Service Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                {formData.tipAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span>${formData.tipAmount.toFixed(2)}</span>
                  </div>
                )}
                {processingFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing Fee ({selectedMethod?.fee}%):</span>
                    <span>${processingFee.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>${finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.paymentMethod === method.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: method.id,
                      }))
                    }
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{method.icon}</div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">
                        {method.fee > 0 ? `${method.fee}% fee` : "No fee"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="paymentSchedule">Payment Schedule</Label>
                <Select
                  value={formData.paymentSchedule}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, paymentSchedule: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_SCHEDULES.map((schedule) => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        <div>
                          <div className="font-medium">{schedule.name}</div>
                          <div className="text-sm text-gray-500">
                            {schedule.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {formData.paymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPaymentForm()}

                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="tipAmount">Add Tip (Optional)</Label>
                    <Input
                      id="tipAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.tipAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tipAmount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="savePaymentMethod"
                      checked={formData.savePaymentMethod}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          savePaymentMethod: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="savePaymentMethod" className="text-sm">
                      Save payment method for future use
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoPayEnabled"
                      checked={formData.autoPayEnabled}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          autoPayEnabled: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="autoPayEnabled" className="text-sm">
                      Enable automatic payments for recurring services
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.paymentMethod}
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Process ${finalAmount.toFixed(2)}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
