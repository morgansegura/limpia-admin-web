"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Send,
  Download,
  Printer,
  Plus,
  Edit,
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Copy,
  Settings,
  Zap,
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
}

interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  jobIds: string[];
  paymentTerms: "15_days" | "30_days" | "45_days" | "due_on_receipt";
  sentAt?: Date;
  viewedAt?: Date;
  paidAt?: Date;
  remindersSent: number;
  lastReminderSent?: Date;
  paymentUrl?: string;
  createdBy: string;
  template: "standard" | "service" | "recurring";
}

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  items: Omit<InvoiceItem, "id" | "amount">[];
  paymentTerms: Invoice["paymentTerms"];
  notes?: string;
  terms?: string;
  isDefault: boolean;
}

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    number: "INV-2024-001",
    customerId: "cus-1",
    customerName: "Sofia Martinez",
    customerEmail: "sofia@email.com",
    customerAddress: {
      street: "1200 Brickell Ave",
      city: "Miami",
      state: "FL",
      zip: "33131",
    },
    status: "paid",
    issueDate: new Date(2024, 7, 16),
    dueDate: new Date(2024, 7, 31),
    items: [
      {
        id: "item-1",
        description: "Deep Clean Blue Service - 3BR Apartment",
        quantity: 1,
        rate: 350,
        amount: 350,
        taxable: true,
      },
    ],
    subtotal: 350,
    taxRate: 8.5,
    taxAmount: 29.75,
    discountAmount: 0,
    total: 379.75,
    notes: "Thank you for your business!",
    terms: "Payment due within 15 days.",
    jobIds: ["job-1"],
    paymentTerms: "15_days",
    paidAt: new Date(2024, 7, 18),
    remindersSent: 0,
    paymentUrl: "https://pay.limpia.com/inv-001",
    createdBy: "system",
    template: "service",
  },
  {
    id: "inv-002",
    number: "INV-2024-002",
    customerId: "cus-2",
    customerName: "Robert Kim",
    customerEmail: "robert@email.com",
    customerAddress: {
      street: "500 Biscayne Blvd",
      city: "Miami",
      state: "FL",
      zip: "33132",
    },
    status: "sent",
    issueDate: new Date(2024, 7, 17),
    dueDate: new Date(2024, 8, 1),
    items: [
      {
        id: "item-1",
        description: "Regular House Cleaning",
        quantity: 1,
        rate: 180,
        amount: 180,
        taxable: true,
      },
    ],
    subtotal: 180,
    taxRate: 8.5,
    taxAmount: 15.3,
    discountAmount: 0,
    total: 195.3,
    jobIds: ["job-2"],
    paymentTerms: "15_days",
    sentAt: new Date(2024, 7, 17, 14, 30),
    remindersSent: 0,
    paymentUrl: "https://pay.limpia.com/inv-002",
    createdBy: "system",
    template: "service",
  },
  {
    id: "inv-003",
    number: "INV-2024-003",
    customerId: "cus-3",
    customerName: "Maria Rodriguez",
    customerEmail: "maria@email.com",
    customerAddress: {
      street: "850 Miami Ave",
      city: "Miami",
      state: "FL",
      zip: "33130",
    },
    status: "overdue",
    issueDate: new Date(2024, 7, 10),
    dueDate: new Date(2024, 7, 25),
    items: [
      {
        id: "item-1",
        description: "Move-out Deep Clean - 2BR Condo",
        quantity: 1,
        rate: 450,
        amount: 450,
        taxable: true,
      },
    ],
    subtotal: 450,
    taxRate: 8.5,
    taxAmount: 38.25,
    discountAmount: 0,
    total: 488.25,
    jobIds: ["job-3"],
    paymentTerms: "15_days",
    sentAt: new Date(2024, 7, 10, 16, 0),
    viewedAt: new Date(2024, 7, 12, 10, 30),
    remindersSent: 2,
    lastReminderSent: new Date(2024, 7, 26),
    paymentUrl: "https://pay.limpia.com/inv-003",
    createdBy: "system",
    template: "service",
  },
];

const mockTemplates: InvoiceTemplate[] = [
  {
    id: "template-1",
    name: "Standard Service",
    description: "Default template for regular cleaning services",
    items: [
      {
        description: "House Cleaning Service",
        quantity: 1,
        rate: 180,
        taxable: true,
      },
    ],
    paymentTerms: "15_days",
    notes: "Thank you for choosing Limpia!",
    terms: "Payment due within 15 days of invoice date.",
    isDefault: true,
  },
  {
    id: "template-2",
    name: "Deep Clean Service",
    description: "Template for deep cleaning services",
    items: [
      {
        description: "Deep Clean Service",
        quantity: 1,
        rate: 350,
        taxable: true,
      },
    ],
    paymentTerms: "15_days",
    notes: "Thank you for choosing our deep clean service!",
    terms: "Payment due within 15 days of invoice date.",
    isDefault: false,
  },
];

export function InvoiceGenerator() {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [templates] = useState<InvoiceTemplate[]>(mockTemplates);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    items: [],
    taxRate: 8.5,
    paymentTerms: "15_days",
    template: "standard",
  });

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    if (filterStatus !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customerEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    return filtered.sort(
      (a, b) => b.issueDate.getTime() - a.issueDate.getTime(),
    );
  }, [invoices, filterStatus, searchTerm]);

  // Calculate statistics
  const invoiceStats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((inv) => inv.status === "paid").length;
    const overdue = invoices.filter((inv) => inv.status === "overdue").length;
    const pending = invoices.filter((inv) =>
      ["sent", "viewed"].includes(inv.status),
    ).length;

    const totalRevenue = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0);

    const outstandingAmount = invoices
      .filter((inv) => !["paid", "cancelled"].includes(inv.status))
      .reduce((sum, inv) => sum + inv.total, 0);

    const avgInvoiceValue = total > 0 ? totalRevenue / paid : 0;
    const paymentRate = total > 0 ? (paid / total) * 100 : 0;

    return {
      total,
      paid,
      overdue,
      pending,
      totalRevenue,
      outstandingAmount,
      avgInvoiceValue,
      paymentRate,
    };
  }, [invoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "sent":
      case "viewed":
        return "bg-blue-500";
      case "draft":
        return "bg-gray-500";
      case "overdue":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return CheckCircle;
      case "overdue":
        return AlertTriangle;
      case "sent":
      case "viewed":
        return Clock;
      default:
        return FileText;
    }
  };

  const getDaysOverdue = (invoice: Invoice) => {
    if (invoice.status !== "overdue") return 0;
    return differenceInDays(new Date(), invoice.dueDate);
  };

  const handleCreateInvoice = () => {
    console.log("Creating new invoice:", newInvoice);
    setIsCreateOpen(false);
    setNewInvoice({
      items: [],
      taxRate: 8.5,
      paymentTerms: "15_days",
      template: "standard",
    });
  };

  const handleSendInvoice = (invoiceId: string) => {
    console.log("Sending invoice:", invoiceId);
    // In real implementation, send email and update status
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log("Downloading invoice:", invoiceId);
    // In real implementation, generate PDF
  };

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => {
    const StatusIcon = getStatusIcon(invoice.status);
    const daysOverdue = getDaysOverdue(invoice);

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedInvoice(invoice);
          setIsPreviewOpen(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {invoice.number}
            </CardTitle>
            <Badge className={`${getStatusColor(invoice.status)} text-white`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {invoice.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{invoice.customerName}</div>
              <div className="text-sm text-muted-foreground">
                {invoice.customerEmail}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                ${invoice.total.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Due {format(invoice.dueDate, "MMM dd")}
              </div>
            </div>
          </div>

          {daysOverdue > 0 && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue
            </div>
          )}

          {invoice.status === "sent" && invoice.sentAt && (
            <div className="text-xs text-muted-foreground">
              Sent {format(invoice.sentAt, "MMM dd, HH:mm")}
            </div>
          )}

          {invoice.viewedAt && (
            <div className="text-xs text-green-600">
              Viewed {format(invoice.viewedAt, "MMM dd, HH:mm")}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Invoice Management
          </h1>
          <p className="text-muted-foreground">
            Automated invoice generation and payment tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-1 h-4 w-4" />
            Templates
          </Button>
          <Button variant="outline" size="sm">
            <Zap className="mr-1 h-4 w-4" />
            Auto Rules
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoiceStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {invoiceStats.pending} pending payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoiceStats.totalRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoiceStats.paid} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoiceStats.outstandingAmount.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoiceStats.overdue} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoiceStats.paymentRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ${invoiceStats.avgInvoiceValue.toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredInvoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cus-1">Sofia Martinez</SelectItem>
                    <SelectItem value="cus-2">Robert Kim</SelectItem>
                    <SelectItem value="cus-3">Maria Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="template">Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input type="date" value={format(new Date(), "yyyy-MM-dd")} />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  type="date"
                  value={format(addDays(new Date(), 15), "yyyy-MM-dd")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                placeholder="Add any notes for the customer..."
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleCreateInvoice}>Create Invoice</Button>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Preview - {selectedInvoice?.number}
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex items-start justify-between p-6 bg-muted rounded-lg">
                <div>
                  <h2 className="text-2xl font-bold">INVOICE</h2>
                  <p className="text-muted-foreground">
                    {selectedInvoice.number}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    Issue Date
                  </div>
                  <div className="font-medium">
                    {format(selectedInvoice.issueDate, "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Due Date
                  </div>
                  <div className="font-medium">
                    {format(selectedInvoice.dueDate, "MMM dd, yyyy")}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <div className="text-sm">
                    <div className="font-medium">
                      {selectedInvoice.customerName}
                    </div>
                    <div>{selectedInvoice.customerAddress.street}</div>
                    <div>
                      {selectedInvoice.customerAddress.city},{" "}
                      {selectedInvoice.customerAddress.state}{" "}
                      {selectedInvoice.customerAddress.zip}
                    </div>
                    <div className="mt-1">{selectedInvoice.customerEmail}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">From:</h3>
                  <div className="text-sm">
                    <div className="font-medium">Limpia Cleaning Services</div>
                    <div>1000 NW 7th St</div>
                    <div>Miami, FL 33136</div>
                    <div className="mt-1">contact@limpia.com</div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="space-y-4">
                <h3 className="font-semibold">Services</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.rate.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-${selectedInvoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax ({selectedInvoice.taxRate}%):</span>
                    <span>${selectedInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {(selectedInvoice.notes || selectedInvoice.terms) && (
                <div className="space-y-4">
                  {selectedInvoice.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedInvoice.notes}
                      </p>
                    </div>
                  )}
                  {selectedInvoice.terms && (
                    <div>
                      <h4 className="font-medium mb-2">Terms & Conditions</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedInvoice.terms}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleSendInvoice(selectedInvoice.id)}
                  disabled={selectedInvoice.status === "paid"}
                >
                  <Send className="mr-1 h-4 w-4" />
                  Send Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadInvoice(selectedInvoice.id)}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Printer className="mr-1 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline">
                  <Copy className="mr-1 h-4 w-4" />
                  Copy Link
                </Button>
                <div className="flex-1" />
                <Button variant="outline">
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
