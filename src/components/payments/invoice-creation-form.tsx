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
  Receipt,
  User,
  CalendarDays,
  DollarSign,
  Plus,
  Minus,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceCreationFormProps {
  onClose: () => void;
  onInvoiceCreated?: (invoice: any) => void;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const PAYMENT_TERMS = [
  { value: "net_15", name: "Net 15", days: 15 },
  { value: "net_30", name: "Net 30", days: 30 },
  { value: "due_on_receipt", name: "Due on Receipt", days: 0 },
  { value: "net_60", name: "Net 60", days: 60 },
];

const INVOICE_TEMPLATES = [
  { value: "standard", name: "Standard Cleaning Invoice" },
  { value: "recurring", name: "Recurring Service Invoice" },
  { value: "one_time", name: "One-Time Service Invoice" },
  { value: "commercial", name: "Commercial Service Invoice" },
];

const DEFAULT_LINE_ITEMS = [
  { description: "Regular House Cleaning", rate: 120 },
  { description: "Deep Clean Blue", rate: 220 },
  { description: "Deep Clean Shine", rate: 280 },
  { description: "Move In/Out Cleaning", rate: 350 },
  { description: "Post Construction Cleaning", rate: 400 },
];

export function InvoiceCreationForm({
  onClose,
  onInvoiceCreated,
}: InvoiceCreationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    billingAddress: "",

    // Invoice Details
    invoiceTemplate: "standard",
    dueDate: "",
    paymentTerms: "net_30",
    referenceNumber: "",
    notes: "",

    // Pricing
    taxRate: 8.5, // Default FL sales tax
    discountPercentage: 0,
    discountAmount: 0,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "Regular House Cleaning",
      quantity: 1,
      rate: 120,
      amount: 120,
    },
  ]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * formData.taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount =
      formData.discountAmount || (subtotal * formData.discountPercentage) / 100;
    return subtotal + tax - discount;
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: String(lineItems.length + 1),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1,
      ).padStart(2, "0")}-${String(
        Math.floor(Math.random() * 9999) + 1,
      ).padStart(4, "0")}`;

      // Calculate due date
      const selectedTerm = PAYMENT_TERMS.find(
        (t) => t.value === formData.paymentTerms,
      );
      const dueDate =
        formData.dueDate ||
        new Date(Date.now() + (selectedTerm?.days || 30) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

      // Create invoice object
      const newInvoice = {
        id: invoiceNumber,
        invoiceNumber,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        billingAddress: formData.billingAddress,
        template: formData.invoiceTemplate,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate,
        paymentTerms: selectedTerm?.name || "Net 30",
        referenceNumber: formData.referenceNumber,
        lineItems,
        subtotal: calculateSubtotal(),
        taxRate: formData.taxRate,
        taxAmount: calculateTax(),
        discountPercentage: formData.discountPercentage,
        discountAmount:
          formData.discountAmount ||
          (calculateSubtotal() * formData.discountPercentage) / 100,
        totalAmount: calculateTotal(),
        notes: formData.notes,
        status: "draft",
        createdAt: new Date(),
      };

      // In a real app, this would save to the backend
      console.log("Creating invoice:", newInvoice);

      toast({
        title: "Invoice Created Successfully",
        description: `Invoice ${invoiceNumber} has been created and saved as draft`,
      });

      if (onInvoiceCreated) {
        onInvoiceCreated(newInvoice);
      }

      onClose();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTemplate = INVOICE_TEMPLATES.find(
    (t) => t.value === formData.invoiceTemplate,
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
            <User className="mr-2 h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
                placeholder="Sofia Martinez"
                required
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerEmail: e.target.value,
                  }))
                }
                placeholder="sofia@example.com"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerPhone: e.target.value,
                  }))
                }
                placeholder="+1 (305) 555-0123"
              />
            </div>
            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    referenceNumber: e.target.value,
                  }))
                }
                placeholder="Job #123, Estimate #456"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="billingAddress">Billing Address *</Label>
            <Textarea
              id="billingAddress"
              value={formData.billingAddress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  billingAddress: e.target.value,
                }))
              }
              placeholder="1200 Brickell Ave, Miami, FL 33131"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceTemplate">Invoice Template</Label>
              <Select
                value={formData.invoiceTemplate}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, invoiceTemplate: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_TEMPLATES.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select
                value={formData.paymentTerms}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentTerms: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="dueDate">
              Due Date (optional - auto-calculated from terms)
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Line Items
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLineItem}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-12 md:col-span-5">
                <Label htmlFor={`description-${item.id}`}>Description</Label>
                <Select
                  value={item.description}
                  onValueChange={(value) => {
                    updateLineItem(item.id, "description", value);
                    const defaultItem = DEFAULT_LINE_ITEMS.find(
                      (d) => d.description === value,
                    );
                    if (defaultItem) {
                      updateLineItem(item.id, "rate", defaultItem.rate);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or type service" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_LINE_ITEMS.map((defaultItem, idx) => (
                      <SelectItem key={idx} value={defaultItem.description}>
                        <div className="flex justify-between w-full">
                          <span>{defaultItem.description}</span>
                          <span className="ml-4 text-sm text-muted-foreground">
                            ${defaultItem.rate}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4 md:col-span-2">
                <Label htmlFor={`quantity-${item.id}`}>Qty</Label>
                <Input
                  id={`quantity-${item.id}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateLineItem(
                      item.id,
                      "quantity",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  min="1"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <Label htmlFor={`rate-${item.id}`}>Rate</Label>
                <Input
                  id={`rate-${item.id}`}
                  type="number"
                  value={item.rate}
                  onChange={(e) =>
                    updateLineItem(
                      item.id,
                      "rate",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-3 md:col-span-2">
                <Label>Amount</Label>
                <div className="flex items-center h-10 px-3 bg-muted rounded-md">
                  ${item.amount.toFixed(2)}
                </div>
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taxRate: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  max="15"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountPercentage: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  max="50"
                  step="1"
                />
              </div>

              <div>
                <Label htmlFor="discountAmount">Or Discount Amount ($)</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Subtotal:</span>
                <span className="font-medium">
                  ${calculateSubtotal().toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Tax ({formData.taxRate}%):</span>
                <span className="font-medium">
                  ${calculateTax().toFixed(2)}
                </span>
              </div>

              {(formData.discountPercentage > 0 ||
                formData.discountAmount > 0) && (
                <div className="flex justify-between items-center text-red-600">
                  <span>
                    Discount{" "}
                    {formData.discountPercentage > 0
                      ? `(${formData.discountPercentage}%)`
                      : ""}
                    :
                  </span>
                  <span>
                    -$
                    {(
                      formData.discountAmount ||
                      (calculateSubtotal() * formData.discountPercentage) / 100
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">Notes & Terms</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Payment instructions, terms of service, thank you note..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview */}
      {formData.customerName &&
        lineItems.some((item) => item.description && item.amount > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="mr-1 h-4 w-4" />
                Invoice Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Template:</strong> {selectedTemplate?.name}
                  </div>
                  <div>
                    <strong>Customer:</strong> {formData.customerName}
                  </div>
                  <div>
                    <strong>Services:</strong>{" "}
                    {lineItems
                      .filter((item) => item.description)
                      .map((item) => item.description)
                      .join(", ")}
                  </div>
                  <div>
                    <strong>Total Amount:</strong> $
                    {calculateTotal().toFixed(2)}
                  </div>
                  <div>
                    <strong>Payment Terms:</strong>{" "}
                    {
                      PAYMENT_TERMS.find(
                        (t) => t.value === formData.paymentTerms,
                      )?.name
                    }
                  </div>
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
            !formData.customerName ||
            !formData.customerEmail ||
            !formData.billingAddress ||
            !lineItems.some((item) => item.description && item.amount > 0)
          }
        >
          {isLoading ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
