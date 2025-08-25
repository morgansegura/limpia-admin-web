"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paymentsApi } from "@/lib/api";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCcw,
  Receipt,
  Plus,
  Filter,
  Download,
  Search,
  Calendar,
  Loader2,
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { InvoiceCreationForm } from "./invoice-creation-form";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  amount: number;
  status:
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "refunded"
    | "disputed";
  paymentMethod: {
    type: "card" | "bank_transfer" | "cash" | "check";
    last4?: string;
    brand?: string;
  };
  createdAt: Date;
  processedAt?: Date;
  description: string;
  metadata: {
    jobId?: string;
    serviceType?: string;
    recurring?: boolean;
  };
  stripePaymentIntentId?: string;
  refundAmount?: number;
  fees: {
    stripe: number;
    processing: number;
    total: number;
  };
}

interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  status: "active" | "paused" | "cancelled" | "past_due";
  plan: {
    name: string;
    amount: number;
    interval: "weekly" | "monthly" | "quarterly";
  };
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextPaymentDate: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  totalRevenue: number;
  paymentFailures: number;
}

interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  paymentId?: string;
  notes?: string;
}

// Mock data
const mockPayments: Payment[] = [
  {
    id: "pay_1",
    customerId: "cus_1",
    customerName: "Sofia Martinez",
    invoiceId: "inv_001",
    amount: 350.0,
    status: "succeeded",
    paymentMethod: { type: "card", last4: "4242", brand: "visa" },
    createdAt: new Date(2024, 7, 16, 10, 30),
    processedAt: new Date(2024, 7, 16, 10, 32),
    description: "Deep Clean Blue Service",
    metadata: { jobId: "job-1", serviceType: "deep_clean" },
    stripePaymentIntentId: "pi_1234567890",
    fees: { stripe: 10.15, processing: 5.25, total: 15.4 },
  },
  {
    id: "pay_2",
    customerId: "cus_2",
    customerName: "Robert Kim",
    invoiceId: "inv_002",
    amount: 180.0,
    status: "pending",
    paymentMethod: { type: "card", last4: "1234", brand: "mastercard" },
    createdAt: new Date(2024, 7, 16, 14, 15),
    description: "Regular House Cleaning",
    metadata: { jobId: "job-2", serviceType: "regular_clean", recurring: true },
    fees: { stripe: 5.22, processing: 2.7, total: 7.92 },
  },
  {
    id: "pay_3",
    customerId: "cus_3",
    customerName: "Maria Rodriguez",
    invoiceId: "inv_003",
    amount: 450.0,
    status: "failed",
    paymentMethod: { type: "card", last4: "5678", brand: "amex" },
    createdAt: new Date(2024, 7, 15, 16, 45),
    description: "Move-out Deep Clean",
    metadata: { jobId: "job-3", serviceType: "move_out" },
    fees: { stripe: 13.05, processing: 6.75, total: 19.8 },
  },
];

const mockSubscriptions: Subscription[] = [
  {
    id: "sub_1",
    customerId: "cus_2",
    customerName: "Robert Kim",
    status: "active",
    plan: { name: "Monthly Cleaning", amount: 180, interval: "monthly" },
    currentPeriodStart: new Date(2024, 7, 1),
    currentPeriodEnd: new Date(2024, 7, 31),
    nextPaymentDate: new Date(2024, 8, 1),
    cancelAtPeriodEnd: false,
    totalRevenue: 1080,
    paymentFailures: 0,
  },
  {
    id: "sub_2",
    customerId: "cus_4",
    customerName: "Jennifer Wilson",
    status: "past_due",
    plan: { name: "Weekly Cleaning", amount: 120, interval: "weekly" },
    currentPeriodStart: new Date(2024, 7, 10),
    currentPeriodEnd: new Date(2024, 7, 17),
    nextPaymentDate: new Date(2024, 7, 17),
    cancelAtPeriodEnd: false,
    totalRevenue: 1440,
    paymentFailures: 2,
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "inv_001",
    customerId: "cus_1",
    customerName: "Sofia Martinez",
    amount: 350.0,
    status: "paid",
    dueDate: new Date(2024, 7, 20),
    createdAt: new Date(2024, 7, 16),
    paidAt: new Date(2024, 7, 16, 10, 32),
    items: [
      {
        description: "Deep Clean Blue - 3BR Apartment",
        quantity: 1,
        rate: 350,
        amount: 350,
      },
    ],
    paymentId: "pay_1",
  },
  {
    id: "inv_002",
    customerId: "cus_2",
    customerName: "Robert Kim",
    amount: 180.0,
    status: "sent",
    dueDate: new Date(2024, 7, 25),
    createdAt: new Date(2024, 7, 16),
    items: [
      {
        description: "Regular House Cleaning",
        quantity: 1,
        rate: 180,
        amount: 180,
      },
    ],
  },
  {
    id: "inv_003",
    customerId: "cus_3",
    customerName: "Maria Rodriguez",
    amount: 450.0,
    status: "overdue",
    dueDate: new Date(2024, 7, 18),
    createdAt: new Date(2024, 7, 15),
    items: [
      {
        description: "Move-out Deep Clean - 2BR Condo",
        quantity: 1,
        rate: 450,
        amount: 450,
      },
    ],
  },
];

export function PaymentProcessor() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("7days");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load payment data from API
  useEffect(() => {
    loadPaymentData();
  }, []);

  // Helper function for safe API calls with fallback
  const fetchWithFallback = async (fetchFn: () => Promise<any>, fallbackData: any) => {
    try {
      return await fetchFn();
    } catch (error) {
      console.warn('API endpoint failed, using fallback data:', error);
      return fallbackData;
    }
  };

  const loadPaymentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use individual fallbacks for each API call to prevent one failure from breaking everything
      const [paymentsData, subscriptionsData, invoicesData] = await Promise.all([
        fetchWithFallback(() => paymentsApi.getAll(), mockPayments),
        fetchWithFallback(() => paymentsApi.getSubscriptions(), mockSubscriptions),
        fetchWithFallback(() => paymentsApi.getInvoices(), mockInvoices),
      ]);

      setPayments(paymentsData);
      setSubscriptions(subscriptionsData);
      setInvoices(invoicesData);
      
      // Only show success if we got real data
      const hasRealData = (
        paymentsData !== mockPayments || 
        subscriptionsData !== mockSubscriptions || 
        invoicesData !== mockInvoices
      );
      
      if (!hasRealData) {
        console.log("Using demo data - API endpoints not available");
        toast({
          title: "Demo Mode",
          description: "API not available. Showing demo data for development.",
        });
      }
      
    } catch (error) {
      console.error("Error loading payment data:", error);
      setError("Failed to load payment data");
      // Use mock data as final fallback
      setPayments(mockPayments);
      setSubscriptions(mockSubscriptions);
      setInvoices(mockInvoices);
      
      toast({
        title: "Connection Issue",
        description: "Using demo data. Check your connection and refresh to load live data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter payments based on current filters
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((payment) => payment.status === filterStatus);
    }

    // Date range filter
    const now = new Date();
    const dateRanges = {
      "7days": subDays(now, 7),
      "30days": subDays(now, 30),
      "90days": subDays(now, 90),
    };

    if (
      filterDateRange !== "all" &&
      dateRanges[filterDateRange as keyof typeof dateRanges]
    ) {
      const rangeStart = dateRanges[filterDateRange as keyof typeof dateRanges];
      filtered = filtered.filter((payment) =>
        isAfter(payment.createdAt, rangeStart),
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [payments, filterStatus, filterDateRange, searchTerm]);

  // Calculate payment statistics
  const paymentStats = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalFees = payments
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + p.fees.total, 0);

    const pendingAmount = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

    const failedAmount = payments
      .filter((p) => p.status === "failed")
      .reduce((sum, p) => sum + p.amount, 0);

    const successRate =
      payments.length > 0
        ? (payments.filter((p) => p.status === "succeeded").length /
            payments.length) *
          100
        : 0;

    const recurringRevenue = subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.plan.amount, 0);

    return {
      totalRevenue,
      totalFees,
      pendingAmount,
      failedAmount,
      successRate,
      recurringRevenue,
    };
  }, [payments, subscriptions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
      case "paid":
      case "active":
        return "bg-green-500";
      case "pending":
      case "processing":
      case "sent":
        return "bg-yellow-500";
      case "failed":
      case "overdue":
      case "past_due":
        return "bg-red-500";
      case "refunded":
      case "cancelled":
        return "bg-gray-500";
      case "disputed":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
      case "paid":
        return CheckCircle;
      case "pending":
      case "processing":
        return Clock;
      case "failed":
      case "overdue":
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const handleRefund = useCallback(
    async (paymentId: string, amount?: number, reason?: string) => {
      if (processingActions.has(paymentId)) return;
      
      try {
        setProcessingActions(prev => new Set([...prev, paymentId]));
        
        const refundReason = reason || "Customer request";
        const payment = payments.find(p => p.id === paymentId);
        if (!payment) return;
        
        const refundAmount = amount || payment.amount;
        
        const result = await paymentsApi.processRefund(
          paymentId,
          refundAmount,
          refundReason,
        );

        // Update local state to reflect the refund
        setPayments((prev) =>
          prev.map((payment) =>
            payment.id === paymentId
              ? {
                  ...payment,
                  status: "refunded",
                  refundAmount: refundAmount,
                }
              : payment,
          ),
        );

        toast({
          title: "Refund Processed",
          description: `Refund of $${refundAmount.toFixed(2)} processed successfully`,
        });
        
        setSelectedPayment(null);
      } catch (error) {
        console.error("Error processing refund:", error);
        toast({
          title: "Refund Failed",
          description: "Failed to process refund. Please try again or contact support.",
          variant: "destructive",
        });
      } finally {
        setProcessingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(paymentId);
          return newSet;
        });
      }
    },
    [payments, processingActions, toast],
  );

  const handleRetryPayment = useCallback(async (paymentId: string) => {
    if (processingActions.has(paymentId)) return;
    
    try {
      setProcessingActions(prev => new Set([...prev, paymentId]));
      
      const result = await paymentsApi.retryPayment(paymentId);

      // Update local state to reflect retry
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId
            ? { ...payment, status: "processing" }
            : payment,
        ),
      );

      toast({
        title: "Payment Retry Initiated",
        description: `Payment retry successful! New payment ID: ${result.newPaymentId}`,
      });
      
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error retrying payment:", error);
      toast({
        title: "Payment Retry Failed",
        description: "Failed to retry payment. Please check the payment method or try again later.",
        variant: "destructive",
      });
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    }
  }, [processingActions, toast]);

  // Subscription management handlers
  const handleCancelSubscription = useCallback(
    async (subscriptionId: string, reason?: string) => {
      if (processingActions.has(subscriptionId)) return;
      
      try {
        setProcessingActions(prev => new Set([...prev, subscriptionId]));
        
        const cancellationReason = reason || "Customer request";
        await paymentsApi.cancelSubscription(subscriptionId, cancellationReason);

        // Update local state
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === subscriptionId
              ? { ...sub, status: "cancelled", cancelAtPeriodEnd: true }
              : sub,
          ),
        );

        toast({
          title: "Subscription Cancelled",
          description: "Subscription cancelled successfully",
        });
        
        setSelectedSubscription(null);
      } catch (error) {
        console.error("Error cancelling subscription:", error);
        toast({
          title: "Cancellation Failed",
          description: "Failed to cancel subscription. Please try again.",
          variant: "destructive",
        });
      } finally {
        setProcessingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(subscriptionId);
          return newSet;
        });
      }
    },
    [processingActions, toast],
  );

  const handlePauseSubscription = useCallback(
    async (subscriptionId: string) => {
      if (processingActions.has(subscriptionId)) return;
      
      try {
        setProcessingActions(prev => new Set([...prev, subscriptionId]));
        
        await paymentsApi.pauseSubscription(subscriptionId);

        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === subscriptionId ? { ...sub, status: "paused" } : sub,
          ),
        );

        toast({
          title: "Subscription Paused",
          description: "Subscription paused successfully",
        });
        
        setSelectedSubscription(null);
      } catch (error) {
        console.error("Error pausing subscription:", error);
        toast({
          title: "Pause Failed",
          description: "Failed to pause subscription. Please try again.",
          variant: "destructive",
        });
      } finally {
        setProcessingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(subscriptionId);
          return newSet;
        });
      }
    },
    [processingActions, toast],
  );

  const handleResumeSubscription = useCallback(
    async (subscriptionId: string) => {
      if (processingActions.has(subscriptionId)) return;
      
      try {
        setProcessingActions(prev => new Set([...prev, subscriptionId]));
        
        await paymentsApi.resumeSubscription(subscriptionId);

        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === subscriptionId ? { ...sub, status: "active" } : sub,
          ),
        );

        toast({
          title: "Subscription Resumed",
          description: "Subscription resumed successfully",
        });
        
        setSelectedSubscription(null);
      } catch (error) {
        console.error("Error resuming subscription:", error);
        toast({
          title: "Resume Failed",
          description: "Failed to resume subscription. Please try again.",
          variant: "destructive",
        });
      } finally {
        setProcessingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(subscriptionId);
          return newSet;
        });
      }
    },
    [processingActions, toast],
  );

  const handleInvoiceCreated = (newInvoice: any) => {
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const [partialRefundAmount, setPartialRefundAmount] = useState("");
  const [isPartialRefundDialogOpen, setIsPartialRefundDialogOpen] = useState(false);
  const [refundingPayment, setRefundingPayment] = useState<Payment | null>(null);

  const handlePartialRefund = () => {
    if (!selectedPayment || !partialRefundAmount) return;
    
    const amount = parseFloat(partialRefundAmount);
    if (amount <= 0 || amount > selectedPayment.amount) {
      toast({
        title: "Invalid Amount",
        description: "Refund amount must be between $0.01 and the payment amount",
        variant: "destructive",
      });
      return;
    }
    
    setRefundingPayment(selectedPayment);
    handleRefund(selectedPayment.id, amount);
    setPartialRefundAmount("");
    setIsPartialRefundDialogOpen(false);
  };

  const openPartialRefundDialog = (payment: Payment) => {
    setRefundingPayment(payment);
    setPartialRefundAmount("");
    setIsPartialRefundDialogOpen(true);
  };

  const handleExportPayments = useCallback(async () => {
    try {
      const filters = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        dateRange: filterDateRange,
        search: searchTerm || undefined,
      };

      const blob = await paymentsApi.exportPayments(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: "Payment data exported successfully",
      });
    } catch (error) {
      console.error("Error exporting payments:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export payments. Please try again.",
        variant: "destructive",
      });
    }
  }, [filterStatus, filterDateRange, searchTerm, toast]);

  const PaymentCard = ({ payment }: { payment: Payment }) => {
    const StatusIcon = getStatusIcon(payment.status);

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedPayment(payment)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {payment.customerName}
            </CardTitle>
            <Badge className={`${getStatusColor(payment.status)} text-white`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {payment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              ${payment.amount.toFixed(2)}
            </span>
            <div className="text-right text-sm text-muted-foreground">
              <div>
                {payment.paymentMethod.brand?.toUpperCase()} ••••{" "}
                {payment.paymentMethod.last4}
              </div>
              <div>{format(payment.createdAt, "MMM dd, yyyy")}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {payment.description}
          </div>
          {payment.fees && (
            <div className="text-xs text-muted-foreground">
              Fees: ${payment.fees.total.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const SubscriptionCard = ({
    subscription,
  }: {
    subscription: Subscription;
  }) => {
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedSubscription(subscription)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {subscription.customerName}
            </CardTitle>
            <Badge
              className={`${getStatusColor(subscription.status)} text-white`}
            >
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              ${subscription.plan.amount}/mo
            </span>
            <div className="text-right text-sm text-muted-foreground">
              <div>{subscription.plan.name}</div>
              <div>Next: {format(subscription.nextPaymentDate, "MMM dd")}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Total Revenue: ${subscription.totalRevenue.toFixed(2)}
          </div>
          {subscription.paymentFailures > 0 && (
            <div className="text-xs text-red-600">
              {subscription.paymentFailures} failed payment
              {subscription.paymentFailures > 1 ? "s" : ""}
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
            Payment Processing
          </h1>
          <p className="text-muted-foreground">
            Manage payments, subscriptions, and invoices with Stripe integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPayments}>
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsInvoiceFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${paymentStats.totalRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${paymentStats.pendingAmount.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "pending").length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${paymentStats.failedAmount.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "failed").length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentStats.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Above 95% target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing Fees
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${paymentStats.totalFees.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              2.9% + $0.30 per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recurring Revenue
            </CardTitle>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${paymentStats.recurringRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Monthly recurring</p>
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
                placeholder="Search payments..."
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
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No payments found</p>
                <p className="text-muted-foreground">
                  {payments.length === 0 
                    ? "No payments have been processed yet" 
                    : "Try adjusting your filters to see more results"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <RefreshCcw className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No subscriptions found</p>
                <p className="text-muted-foreground">
                  No recurring payment subscriptions have been set up yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-8 bg-muted rounded w-20 animate-pulse"></div></TableCell>
                      </TableRow>
                    ))
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">No invoices found</p>
                        <p className="text-muted-foreground">
                          Create your first invoice to get started
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.id}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${getStatusColor(
                              invoice.status,
                            )} text-white`}
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(invoice.dueDate, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Receipt className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Details Dialog */}
      <Dialog
        open={!!selectedPayment}
        onOpenChange={() => setSelectedPayment(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-lg">{selectedPayment.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-bold">
                    ${selectedPayment.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    className={`${getStatusColor(
                      selectedPayment.status,
                    )} text-white mt-1`}
                  >
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <p>
                    {selectedPayment.paymentMethod.brand?.toUpperCase()} ••••{" "}
                    {selectedPayment.paymentMethod.last4}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p>{selectedPayment.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{format(selectedPayment.createdAt, "PPpp")}</p>
                </div>
                {selectedPayment.processedAt && (
                  <div>
                    <Label className="text-sm font-medium">Processed</Label>
                    <p>{format(selectedPayment.processedAt, "PPpp")}</p>
                  </div>
                )}
              </div>

              {selectedPayment.fees && (
                <div>
                  <Label className="text-sm font-medium">Fees Breakdown</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>Stripe: ${selectedPayment.fees.stripe.toFixed(2)}</div>
                    <div>
                      Processing: ${selectedPayment.fees.processing.toFixed(2)}
                    </div>
                    <div>Total: ${selectedPayment.fees.total.toFixed(2)}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t">
                {selectedPayment.status === "succeeded" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleRefund(selectedPayment.id)}
                      disabled={processingActions.has(selectedPayment.id)}
                    >
                      {processingActions.has(selectedPayment.id) ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="mr-1 h-4 w-4" />
                      )}
                      Full Refund
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => openPartialRefundDialog(selectedPayment)}
                      disabled={processingActions.has(selectedPayment.id)}
                    >
                      <RefreshCcw className="mr-1 h-4 w-4" />
                      Partial Refund
                    </Button>
                  </>
                )}
                {selectedPayment.status === "failed" && (
                  <Button
                    onClick={() => handleRetryPayment(selectedPayment.id)}
                    disabled={processingActions.has(selectedPayment.id)}
                  >
                    {processingActions.has(selectedPayment.id) ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="mr-1 h-4 w-4" />
                    )}
                    Retry Payment
                  </Button>
                )}
                <div className="flex-1" />
                <Button variant="outline">
                  <Receipt className="mr-1 h-4 w-4" />
                  View Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscription Details Dialog */}
      <Dialog
        open={!!selectedSubscription}
        onOpenChange={() => setSelectedSubscription(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5" />
              Subscription Details
            </DialogTitle>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-lg">{selectedSubscription.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <p className="text-lg">{selectedSubscription.plan.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-bold">
                    ${selectedSubscription.plan.amount}/
                    {selectedSubscription.plan.interval}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    className={`${getStatusColor(
                      selectedSubscription.status,
                    )} text-white mt-1`}
                  >
                    {selectedSubscription.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Current Period</Label>
                  <p>
                    {format(selectedSubscription.currentPeriodStart, "MMM dd")}{" "}
                    -{" "}
                    {format(
                      selectedSubscription.currentPeriodEnd,
                      "MMM dd, yyyy",
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Next Payment</Label>
                  <p>
                    {format(
                      selectedSubscription.nextPaymentDate,
                      "MMM dd, yyyy",
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total Revenue</Label>
                  <p className="text-lg font-semibold">
                    ${selectedSubscription.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Payment Failures
                  </Label>
                  <p
                    className={
                      selectedSubscription.paymentFailures > 0
                        ? "text-red-600"
                        : ""
                    }
                  >
                    {selectedSubscription.paymentFailures}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="outline">
                  <Calendar className="mr-1 h-4 w-4" />
                  Update Schedule
                </Button>
                <Button variant="outline">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Change Plan
                </Button>
                <div className="flex-1" />
                {selectedSubscription.status === "active" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      handlePauseSubscription(selectedSubscription.id)
                    }
                    disabled={processingActions.has(selectedSubscription.id)}
                  >
                    {processingActions.has(selectedSubscription.id) ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      "Pause Subscription"
                    )}
                  </Button>
                )}
                {selectedSubscription.status === "paused" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleResumeSubscription(selectedSubscription.id)
                    }
                    disabled={processingActions.has(selectedSubscription.id)}
                  >
                    {processingActions.has(selectedSubscription.id) ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      "Resume Subscription"
                    )}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() =>
                    handleCancelSubscription(selectedSubscription.id)
                  }
                  disabled={processingActions.has(selectedSubscription.id)}
                >
                  {processingActions.has(selectedSubscription.id) ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    "Cancel Subscription"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Creation Dialog */}
      <Dialog open={isInvoiceFormOpen} onOpenChange={setIsInvoiceFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create New Invoice
            </DialogTitle>
          </DialogHeader>
          <InvoiceCreationForm
            onClose={() => setIsInvoiceFormOpen(false)}
            onInvoiceCreated={handleInvoiceCreated}
          />
        </DialogContent>
      </Dialog>

      {/* Partial Refund Dialog */}
      <Dialog open={isPartialRefundDialogOpen} onOpenChange={setIsPartialRefundDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Partial Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Refund Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="number"
                  value={partialRefundAmount}
                  onChange={(e) => setPartialRefundAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  min="0.01"
                  max={refundingPayment?.amount || 0}
                  step="0.01"
                />
              </div>
              {refundingPayment && (
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum: ${refundingPayment.amount.toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsPartialRefundDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePartialRefund}
                disabled={!partialRefundAmount || parseFloat(partialRefundAmount) <= 0}
              >
                Process Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
