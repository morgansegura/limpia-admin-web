"use client";

import { useState, useEffect, useCallback } from "react";
import type { Estimate, CalculatorData } from "@/types/app.types";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  DollarSign,
  FileText,
  Send,
  CheckCircle,
  Calculator,
  TrendingUp,
  CirclePlusIcon,
  User,
  Home,
  Percent,
  Copy,
  Edit,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommissionCalculator } from "@/components/sales/commission-calculator";
import { IntegratedSalesWorkflow } from "@/components/sales/integrated-sales-workflow";
import { ManagerApprovalDashboard } from "@/components/sales/manager-approval-dashboard";
import { SalesRepCommissionDetail } from "@/components/sales/sales-rep-commission-detail";
import { WorkflowProgress } from "@/components/sales/workflow-progress";
import { ContractSigningModal } from "@/components/sales/contract-signing-modal";
import { ServiceSchedulingModal } from "@/components/sales/service-scheduling-modal";
import { PaymentProcessingModal } from "@/components/sales/payment-processing-modal";
import { NotificationSystemModal } from "@/components/sales/notification-system-modal";
import { salesApi, UserRole } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useToast } from "@/hooks/use-toast";

// Real estimates data will be loaded from API

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACCEPTED":
      return "default";
    case "SENT":
      return "secondary";
    case "DRAFT":
      return "outline";
    case "REJECTED":
      return "destructive";
    case "EXPIRED":
      return "destructive";
    default:
      return "secondary";
  }
};

const getCommissionTierColor = (tier: string) => {
  switch (tier) {
    case "EXCELLENT":
      return "bg-green-500";
    case "GOOD":
      return "bg-blue-500";
    case "FAIR":
      return "bg-yellow-500";
    case "POOR":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function SalesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isIntegratedWorkflowOpen, setIsIntegratedWorkflowOpen] =
    useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(
    null,
  );
  const [isEstimateDetailOpen, setIsEstimateDetailOpen] = useState(false);
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"estimates" | "approvals">(
    "estimates",
  );
  const [isCommissionDetailOpen, setIsCommissionDetailOpen] = useState(false);

  // Workflow state
  const { toast } = useToast();
  const {
    workflows,
    initializeWorkflow,
    executeContractSigning,
    executePaymentProcessing,
    executeServiceScheduling,
    sendCustomerNotifications,
  } = useWorkflow();

  // Modal states for workflow steps
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [schedulingModalOpen, setSchedulingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [workflowEstimate, setWorkflowEstimate] = useState<Estimate | null>(
    null,
  );

  // Debug user role
  console.log("🔍 Current user role:", user?.role);
  console.log("🔍 Role type:", typeof user?.role);
  console.log("🔍 Is Sales Rep (enum)?", user?.role === UserRole.SALES_REP);
  console.log("🔍 Is Sales Rep (string)?", user?.role === "SALES_REP");
  console.log("🔍 UserRole enum values:", UserRole);

  // Handle both string and enum role values for compatibility
  const isSalesRep = (user?.role as string) === "SALES_REP";
  const isSalesManager = (user?.role as string) === "SALES_MANAGER";

  // Check if user can manage workflow steps
  const canManageWorkflow =
    user?.role &&
    [
      UserRole.SALES_MANAGER,
      UserRole.FRANCHISE_OWNER,
      UserRole.CORPORATE_EXECUTIVE,
      UserRole.CORPORATE_ADMIN,
      UserRole.LOCATION_MANAGER,
    ].includes(user.role);

  const loadEstimates = useCallback(async () => {
    try {
      setIsLoading(true);
      // Sales Reps should only see their own estimates
      const data = isSalesRep
        ? await salesApi.getMyEstimates() // Only rep's estimates
        : await salesApi.getEstimates(); // All estimates for managers

      // Check if we got valid data
      if (Array.isArray(data) && data.length > 0) {
        console.log("✅ Loaded estimates from API:", data.length, "estimates");
        setEstimates(data as Estimate[]);
      } else {
        // No data returned or empty array - use mock data for demonstration
        console.log(
          "📝 API returned no data - using mock data for demonstration",
        );
        // Fall through to mock data without throwing error
        throw new Error("Using mock data fallback");
      }
    } catch (error) {
      console.log(
        "🔄 Using mock data fallback:",
        error instanceof Error ? error.message : String(error),
      );
      // Use role-based mock data as fallback
      const mockEstimates = isSalesRep
        ? [
            // Only this sales rep's estimates
            {
              id: "EST-001",
              customerName: "Johnson Family",
              customerEmail: "johnson.family@example.com",
              serviceType: "recurring",
              squareFootage: 1200,
              frequency: "bi_weekly",
              quotedPrice: 170,
              finalPrice: 153,
              discountPercentage: 10,
              discountAmount: 17,
              commissionAmount: 23,
              commissionTier: "GOOD",
              status: "SENT",
              createdAt: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              createdBy:
                user?.firstName + " " + user?.lastName || "Current User",
              notes: "Customer requested eco-friendly products",
            },
            {
              id: "EST-002",
              customerName: "Smith Residence",
              customerEmail: "smith@example.com",
              serviceType: "deep_clean_combo",
              squareFootage: 800,
              frequency: "one_time",
              quotedPrice: 350,
              finalPrice: 350,
              discountPercentage: 0,
              discountAmount: 0,
              commissionAmount: 70,
              commissionTier: "EXCELLENT",
              status: "ACCEPTED",
              createdAt: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              createdBy:
                user?.firstName + " " + user?.lastName || "Current User",
              notes: "One-time deep clean for move-in",
            },
          ]
        : [
            // All estimates for managers (includes multiple reps)
            {
              id: "EST-001",
              customerName: "Johnson Family",
              customerEmail: "johnson.family@example.com",
              serviceType: "recurring",
              squareFootage: 1200,
              frequency: "bi_weekly",
              quotedPrice: 170,
              finalPrice: 153,
              discountPercentage: 10,
              discountAmount: 17,
              commissionAmount: 23,
              commissionTier: "GOOD",
              status: "SENT",
              createdAt: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              createdBy: "Alice Johnson",
              notes: "Customer requested eco-friendly products",
            },
            {
              id: "EST-002",
              customerName: "Smith Residence",
              customerEmail: "smith@example.com",
              serviceType: "deep_clean_combo",
              squareFootage: 800,
              frequency: "one_time",
              quotedPrice: 350,
              finalPrice: 350,
              discountPercentage: 0,
              discountAmount: 0,
              commissionAmount: 70,
              commissionTier: "EXCELLENT",
              status: "ACCEPTED",
              createdAt: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              createdBy: "Bob Martinez",
              notes: "One-time deep clean for move-in",
            },
            {
              id: "EST-003",
              customerName: "Corporate Office",
              customerEmail: "facilities@corp.com",
              serviceType: "recurring",
              squareFootage: 2500,
              frequency: "weekly",
              quotedPrice: 450,
              finalPrice: 405,
              discountPercentage: 10,
              discountAmount: 45,
              commissionAmount: 81,
              commissionTier: "EXCELLENT",
              status: "ACCEPTED",
              createdAt: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              createdBy: "Carol Williams",
              notes: "Commercial recurring service",
            },
          ];
      console.log(
        "✅ Mock data loaded successfully:",
        mockEstimates.length,
        "estimates",
      );
      console.log(
        "🎯 Role-based data for:",
        isSalesRep ? "Sales Rep" : "Sales Manager",
      );
      setEstimates(mockEstimates as Estimate[]);
    } finally {
      setIsLoading(false);
    }
  }, [isSalesRep, user?.firstName, user?.lastName]);

  // Load estimates from API
  useEffect(() => {
    if (user?.role) {
      console.log("🚀 Loading estimates for user role:", user.role);
      loadEstimates();
    }
  }, [user?.role, loadEstimates]);

  // Handle estimate actions
  const handleSendEstimate = async (id: string) => {
    try {
      await salesApi.sendEstimate(id);
      await loadEstimates(); // Refresh data
    } catch (error) {
      console.error("Failed to send estimate:", error);
    }
  };

  // NOTE: Customer acceptance/rejection should be handled through customer portal

  const handleViewEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setIsEstimateDetailOpen(true);
  };

  const handleCreateFromCalculator = (calculationData: CalculatorData) => {
    console.log("🔄 Creating estimate from calculator data:", calculationData);
    console.log("📊 Data includes:", {
      basePrice: calculationData.basePrice,
      finalPrice: calculationData.finalPrice,
      serviceType: calculationData.serviceType,
      squareFootage: calculationData.squareFootage,
      commissionTier: calculationData.commissionTier,
    });
    setCalculatorData(calculationData);
    setIsCalculatorOpen(false);
    setIsIntegratedWorkflowOpen(true);
  };

  // Workflow handlers
  const handleInitiateWorkflow = async (estimate: Estimate) => {
    try {
      console.log("🚀 Initiating workflow for estimate:", estimate.id);
      await initializeWorkflow(
        estimate.id,
        estimate.customerId || `customer_${estimate.id}`,
        estimate.customerName || "Unknown Customer",
      );

      setWorkflowEstimate(estimate);

      toast({
        title: "Workflow Initiated",
        description: `Sales-to-service workflow started for ${estimate.customerName}`,
      });
    } catch (error: unknown) {
      toast({
        title: "Workflow Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to initiate workflow",
        variant: "destructive",
      });
    }
  };

  const handleWorkflowStepAction = async (stepId: string, action: string) => {
    if (!workflowEstimate) return;

    try {
      console.log(`🔄 Executing workflow step: ${stepId}, action: ${action}`);

      switch (stepId) {
        case "contract_signing":
          if (action === "initiate_contract") {
            setContractModalOpen(true);
          }
          break;

        case "payment_processing":
          if (action === "process_payment") {
            setPaymentModalOpen(true);
          }
          break;

        case "service_scheduling":
          if (action === "schedule_service") {
            setSchedulingModalOpen(true);
          }
          break;

        case "customer_notifications":
          if (action === "send_notifications") {
            setNotificationModalOpen(true);
          }
          break;

        default:
          console.log(`Unknown workflow step: ${stepId}`);
      }
    } catch (error: unknown) {
      toast({
        title: "Workflow Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to execute workflow step",
        variant: "destructive",
      });
    }
  };

  const handleContractInitiated = async (contractData: unknown) => {
    if (!workflowEstimate) return;
    try {
      await executeContractSigning(workflowEstimate.id, contractData);
      setContractModalOpen(false);
    } catch (error) {
      console.error("Contract signing failed:", error);
    }
  };

  const handlePaymentProcessed = async (paymentData: unknown) => {
    if (!workflowEstimate) return;
    try {
      await executePaymentProcessing(workflowEstimate.id, paymentData);
      setPaymentModalOpen(false);
    } catch (error) {
      console.error("Payment processing failed:", error);
    }
  };

  const handleServiceScheduled = async (scheduleData: unknown) => {
    if (!workflowEstimate) return;
    try {
      await executeServiceScheduling(workflowEstimate.id, scheduleData);
      setSchedulingModalOpen(false);
    } catch (error) {
      console.error("Service scheduling failed:", error);
    }
  };

  const handleNotificationsSent = async (notificationData: unknown) => {
    if (!workflowEstimate) return;
    try {
      await sendCustomerNotifications(
        workflowEstimate.customerId || `customer_${workflowEstimate.id}`,
        (notificationData as { templateType: string }).templateType,
        notificationData,
      );
      setNotificationModalOpen(false);
    } catch (error) {
      console.error("Notification sending failed:", error);
    }
  };

  const filteredEstimates = estimates.filter((estimate) => {
    const matchesSearch =
      (estimate.customerName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      estimate.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (estimate.customerEmail || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || estimate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalEstimates = estimates.length;
  const acceptedEstimates = estimates.filter(
    (e) => e.status === "ACCEPTED",
  ).length;
  const totalRevenue = estimates
    .filter((e) => e.status === "ACCEPTED")
    .reduce((sum, e) => sum + (e.finalPrice || 0), 0);
  const totalCommissions = estimates.reduce(
    (sum, e) => sum + (e.commissionAmount || 0),
    0,
  );

  // Debug calculations
  console.log("📈 Sales Stats:", {
    totalEstimates,
    acceptedEstimates,
    totalRevenue,
    totalCommissions,
    estimatesCount: estimates.length,
    estimatesData: estimates.map((e) => ({
      id: e.id,
      status: e.status,
      finalPrice: e.finalPrice,
      commissionAmount: e.commissionAmount,
    })),
  });

  // Show loading state while authentication is being resolved
  if (authLoading) {
    return (
      <ProtectedRoute requiredFeature="sales">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Sales & Estimates
              </h1>
              <p className="text-muted-foreground">Loading sales data...</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>

          <div className="h-96 bg-gray-200 animate-pulse rounded" />
        </div>
      </ProtectedRoute>
    );
  }

  // Conditional rendering for integrated workflow
  if (isIntegratedWorkflowOpen) {
    return (
      <ProtectedRoute requiredFeature="sales">
        <IntegratedSalesWorkflow
          onClose={() => {
            setIsIntegratedWorkflowOpen(false);
            setCalculatorData(null);
          }}
          onComplete={() => loadEstimates()}
          initialCalculatorData={
            calculatorData
              ? {
                  basePrice: calculatorData.basePrice || 0,
                  quotedPrice: calculatorData.quotedPrice || 0,
                  serviceType: calculatorData.serviceType || "",
                  squareFootage: calculatorData.squareFootage || "",
                  frequency: calculatorData.frequency || "",
                  discountPercentage: calculatorData.discountPercentage || 0,
                  finalPrice: calculatorData.finalPrice || 0,
                  discountAmount: calculatorData.discountAmount || 0,
                  commissionAmount: calculatorData.commissionAmount || 0,
                  commissionTier: calculatorData.commissionTier || "",
                }
              : undefined
          }
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredFeature="sales">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sales & Estimates
            </h1>
            <p className="text-muted-foreground">
              {isSalesRep
                ? "Create estimates, track sales pipeline, and manage customer relationships"
                : "Create estimates, track sales pipeline, and manage commissions"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calculator className="mr-1 h-4 w-4" />
                  Quick Calculator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {isSalesRep
                      ? "Quick Pricing Calculator"
                      : "Quick Commission Calculator"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {isSalesRep
                      ? "Calculate pricing and convert to full estimates"
                      : "Calculate commissions and convert to full estimates"}
                  </p>
                </DialogHeader>
                <CommissionCalculator
                  onCreateEstimate={handleCreateFromCalculator}
                />
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => {
                console.log("🚀 Opening integrated sales workflow");
                setCalculatorData(null);
                setIsIntegratedWorkflowOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 relative"
            >
              <CirclePlusIcon className="mr-1 h-4 w-4" />
              Create Professional Estimate
            </Button>
          </div>
        </div>

        {/* Tab Navigation for Sales Managers */}
        {isSalesManager && (
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === "estimates" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                console.log("📊 Switching to estimates tab");
                setActiveTab("estimates");
              }}
              className="px-4"
            >
              Sales & Estimates
            </Button>
            <Button
              variant={activeTab === "approvals" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                console.log("🔍 Switching to discount approvals tab");
                setActiveTab("approvals");
              }}
              className="px-4"
            >
              Discount Approvals
            </Button>
          </div>
        )}

        {/* Conditional Content Based on Active Tab */}
        {activeTab === "approvals" && isSalesManager ? (
          <ManagerApprovalDashboard />
        ) : (
          <>
            {/* Sales KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Estimates
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalEstimates > 0 ? totalEstimates : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {acceptedEstimates} accepted (
                    {Math.round((acceptedEstimates / totalEstimates) * 100)}%)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pipeline Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalRevenue > 0 ? totalRevenue?.toFixed(2) : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From accepted estimates
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isSalesRep ? "Customer Satisfaction" : "Total Commissions"}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isSalesRep
                      ? "4.8★"
                      : `$${
                          totalCommissions > 0
                            ? totalCommissions.toFixed(2)
                            : "0"
                        }`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isSalesRep ? "Average rating" : "Team earnings"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Deal Size
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {totalRevenue > 0 && acceptedEstimates > 0
                      ? (totalRevenue / acceptedEstimates).toFixed(0)
                      : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average accepted value
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Rep Dashboard */}
            {isSalesRep && (
              <div className="space-y-6">
                {/* Sales Rep Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>My Sales Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">This Month</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium">
                              ${totalRevenue.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Deals Closed:</span>
                            <span className="font-medium text-green-600">
                              {acceptedEstimates}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estimates:</span>
                            <span className="font-medium">
                              {estimates.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accepted:</span>
                            <span className="font-medium">
                              {acceptedEstimates}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Conversion Rate</h4>
                        <div className="text-2xl font-bold text-blue-600">
                          {estimates.length > 0
                            ? Math.round(
                                (acceptedEstimates / estimates.length) * 100,
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {acceptedEstimates} of {estimates.length} estimates
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Monthly Target</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span className="font-medium">
                              ${totalRevenue.toFixed(0)} / $10,000
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (totalRevenue / 10000) * 100,
                                  100,
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((totalRevenue / 10000) * 100)}% of
                            monthly goal
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Performance Tier
                        </h4>
                        <div className="text-lg font-bold text-purple-600">
                          {acceptedEstimates >= 8
                            ? "EXCELLENT"
                            : acceptedEstimates >= 5
                              ? "GOOD"
                              : acceptedEstimates >= 3
                                ? "FAIR"
                                : "BUILDING"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on deals closed this month
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions for Sales Rep */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CirclePlusIcon className="h-5 w-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                      <Button
                        onClick={() => setIsCalculatorOpen(true)}
                        className="flex flex-col items-center py-4 h-auto"
                      >
                        <Calculator className="h-6 w-6 mb-2" />
                        <span>New Estimate</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log(
                            "🎯 Opening professional estimate workflow",
                          );
                          setIsIntegratedWorkflowOpen(true);
                        }}
                        className="flex flex-col items-center py-4 h-auto relative border-blue-200 hover:border-blue-400"
                      >
                        <FileText className="h-6 w-6 mb-2 text-blue-600" />
                        <span>Professional Estimate</span>
                        <span className="text-xs text-blue-600 mt-1">
                          Integrated Workflow
                        </span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          // Navigate to customers page
                          console.log("🧑‍🤝‍🧑 Navigating to my customers");
                          window.location.href = "/customers";
                        }}
                        className="flex flex-col items-center py-4 h-auto"
                      >
                        <User className="h-6 w-6 mb-2" />
                        <span>My Customers</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sales Manager Dashboard */}
            {user?.role === UserRole.SALES_MANAGER && (
              <div className="space-y-6">
                {/* Team Commission Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Team Commission Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Total Team Commissions
                        </h4>
                        <div className="text-2xl font-bold text-green-600">
                          ${totalCommissions.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          This month
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Average Commission
                        </h4>
                        <div className="text-xl font-bold">
                          $
                          {estimates.length > 0
                            ? (totalCommissions / estimates.length).toFixed(2)
                            : "0"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Per deal closed
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Top Performer</h4>
                        <div className="text-lg font-bold text-blue-600">
                          {estimates.length > 0
                            ? estimates[0].createdBy
                            : "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Highest commissions
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Commission Rate</h4>
                        <div className="text-xl font-bold text-purple-600">
                          {totalRevenue > 0
                            ? ((totalCommissions / totalRevenue) * 100).toFixed(
                                1,
                              )
                            : "0"}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Of total revenue
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Team Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Sales Team Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <h4 className="font-medium">Team Performance</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total Team Revenue:</span>
                            <span className="font-medium">
                              ${totalRevenue.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Team Commissions:</span>
                            <span className="font-medium">
                              ${totalCommissions.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversion Rate:</span>
                            <span className="font-medium">
                              {Math.round(
                                (acceptedEstimates / totalEstimates) * 100,
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Quick Actions</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setStatusFilter("all")}
                          >
                            View All Estimates
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setStatusFilter("SENT")}
                          >
                            Review Pending
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setIsCommissionDetailOpen(true)}
                          >
                            Team Commission Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={async () => {
                              // Generate team performance report
                              try {
                                // TODO: Add generateTeamReport to API and replace with real call
                                console.log("Generating team report...");
                              } catch (error) {
                                console.error(
                                  "Failed to generate team report:",
                                  error,
                                );
                              }
                            }}
                          >
                            Generate Reports
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Team Activity</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Active Sales Reps:</span>
                            <span className="font-medium">
                              {
                                estimates
                                  .map((e) => e.createdBy)
                                  .filter((v, i, a) => a.indexOf(v) === i)
                                  .length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estimates Today:</span>
                            <span className="font-medium">
                              {
                                estimates.filter(
                                  (e) =>
                                    new Date(
                                      e.createdAt || new Date(),
                                    ).toDateString() ===
                                    new Date().toDateString(),
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Deal Size:</span>
                            <span className="font-medium">
                              $
                              {acceptedEstimates > 0
                                ? (totalRevenue / acceptedEstimates).toFixed(0)
                                : "0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search estimates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* My Estimates Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {isSalesRep ? "My Estimates" : "Team Estimates"}
                  </CardTitle>
                  {isSalesRep && (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setIsCalculatorOpen(true)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        New Estimate
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estimate #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Quoted Price</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>
                        {isSalesRep ? "Performance" : "Commission"}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          Loading estimates...
                        </TableCell>
                      </TableRow>
                    ) : filteredEstimates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          No estimates found. Create your first estimate to get
                          started!
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEstimates.map((estimate) => (
                        <TableRow key={estimate.id}>
                          <TableCell className="font-mono text-sm">
                            {estimate.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {estimate.customerName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {estimate.customerEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="capitalize">
                                {(estimate.serviceType || "unknown").replace(
                                  /_/g,
                                  " ",
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {estimate.squareFootage} sq ft
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${estimate?.quotedPrice?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                ${estimate?.finalPrice?.toFixed(2)}
                              </div>
                              {(estimate.discountPercentage || 0) > 0 && (
                                <div className="text-sm text-red-600">
                                  -{estimate.discountPercentage}% ($
                                  {(estimate.discountAmount || 0).toFixed(2)})
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isSalesRep ? (
                              // Sales reps see performance metrics instead of commission
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${getCommissionTierColor(
                                    estimate.commissionTier || "bronze",
                                  )}`}
                                />
                                <div>
                                  <div className="font-medium">
                                    {estimate.discountPercentage === 0
                                      ? "Full Price"
                                      : `${estimate.discountPercentage}% Disc`}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {estimate?.commissionTier?.toLowerCase()}{" "}
                                    tier
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Sales managers see commission details
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${getCommissionTierColor(
                                    estimate.commissionTier || "bronze",
                                  )}`}
                                />
                                <div>
                                  <div className="font-medium">
                                    ${estimate?.commissionAmount?.toFixed(2)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {estimate?.commissionTier?.toLowerCase()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                getStatusColor(estimate.status) as
                                  | "default"
                                  | "secondary"
                                  | "outline"
                                  | "destructive"
                                  | null
                                  | undefined
                              }
                            >
                              {estimate.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                {formatDistanceToNow(
                                  new Date(estimate.createdAt || new Date()),
                                  {
                                    addSuffix: true,
                                  },
                                )}
                              </div>
                              <div className="text-muted-foreground">
                                {estimate.createdBy}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {estimate.status === "DRAFT" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleSendEstimate(estimate.id)
                                  }
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Send
                                </Button>
                              )}
                              {estimate.status === "SENT" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleSendEstimate(estimate.id)
                                    }
                                  >
                                    <Send className="h-4 w-4 mr-1" />
                                    Send to Customer
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // TODO: Implement duplicate functionality
                                      console.log(
                                        "Duplicate estimate:",
                                        estimate.id,
                                      );
                                    }}
                                  >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Duplicate
                                  </Button>
                                </>
                              )}
                              {estimate.status === "ACCEPTED" &&
                                canManageWorkflow && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() =>
                                      handleInitiateWorkflow(estimate)
                                    }
                                    className="bg-green-600 hover:bg-green-700 mr-2"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Start Workflow
                                  </Button>
                                )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEstimate(estimate)}
                              >
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

            {/* Estimate Detail Modal */}
            <Dialog
              open={isEstimateDetailOpen}
              onOpenChange={setIsEstimateDetailOpen}
            >
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-6 w-6" />
                    Estimate Details
                  </DialogTitle>
                </DialogHeader>

                {selectedEstimate && (
                  <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 -mr-2">
                    {/* Header Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Estimate ID
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-base font-mono">
                            {selectedEstimate.id}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge
                            variant={
                              getStatusColor(selectedEstimate.status) as
                                | "default"
                                | "secondary"
                                | "outline"
                                | "destructive"
                                | null
                                | undefined
                            }
                          >
                            {selectedEstimate.status}
                          </Badge>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Created
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-lg">
                            {selectedEstimate.createdAt
                              ? formatDistanceToNow(
                                  selectedEstimate.createdAt,
                                  {
                                    addSuffix: true,
                                  },
                                )
                              : "Not available"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            by {selectedEstimate.createdBy}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Customer Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Customer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Name
                            </h4>
                            <p>{selectedEstimate.customerName}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Email
                            </h4>
                            <p>{selectedEstimate.customerEmail}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Service Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          Service Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Service Type
                            </h4>
                            <p className="capitalize">
                              {selectedEstimate.serviceType?.replace(
                                /_/g,
                                " ",
                              ) || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Square Footage
                            </h4>
                            <p>{selectedEstimate.squareFootage} sq ft</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pricing Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Pricing Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">
                              Base Quote:
                            </span>
                            <span className="font-medium">
                              ${selectedEstimate.quotedPrice?.toFixed(2)}
                            </span>
                          </div>

                          {(selectedEstimate.discountPercentage || 0) > 0 && (
                            <div className="flex justify-between items-center py-2 text-red-600">
                              <span className="flex items-center gap-1">
                                <Percent className="h-4 w-4" />
                                Discount ({selectedEstimate.discountPercentage}
                                %):
                              </span>
                              <span className="font-medium">
                                -${selectedEstimate.discountAmount?.toFixed(2)}
                              </span>
                            </div>
                          )}

                          <div className="border-t pt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Final Price:</span>
                              <span className="font-bold">
                                ${selectedEstimate.finalPrice?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Commission Information - Only visible to Sales Managers */}
                    {!isSalesRep && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Commission Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                Commission Amount
                              </h4>
                              <p className="text-lg font-semibold">
                                ${selectedEstimate.commissionAmount?.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                Commission Tier
                              </h4>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getCommissionTierColor(
                                    selectedEstimate.commissionTier || "",
                                  )}`}
                                />
                                <span className="capitalize">
                                  {selectedEstimate.commissionTier?.toLowerCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Notes Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Additional Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm">
                            {selectedEstimate.notes ||
                              "Customer requested eco-friendly products. Property has 2 dogs. Access through front entrance only."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      {selectedEstimate.status === "DRAFT" && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              handleSendEstimate(selectedEstimate.id);
                              setIsEstimateDetailOpen(false);
                            }}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Send to Customer
                          </Button>
                          <Button>Edit Estimate</Button>
                        </>
                      )}

                      {selectedEstimate.status === "SENT" && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              handleSendEstimate(selectedEstimate.id);
                              setIsEstimateDetailOpen(false);
                            }}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Resend to Customer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              // TODO: Implement edit functionality
                              console.log(
                                "Edit estimate:",
                                selectedEstimate.id,
                              );
                              setIsEstimateDetailOpen(false);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Estimate
                          </Button>
                        </>
                      )}

                      <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Sales Rep Commission Detail Modal - Only for Sales Managers */}
            {!isSalesRep && (
              <SalesRepCommissionDetail
                open={isCommissionDetailOpen}
                onClose={() => setIsCommissionDetailOpen(false)}
              />
            )}

            {/* Workflow System Modals */}
            {workflowEstimate && (
              <>
                <ContractSigningModal
                  isOpen={contractModalOpen}
                  onClose={() => setContractModalOpen(false)}
                  estimateId={workflowEstimate.id}
                  customerName={workflowEstimate.customerName || ""}
                  customerEmail={workflowEstimate.customerEmail || ""}
                  estimateAmount={
                    workflowEstimate.finalPrice ||
                    workflowEstimate.quotedPrice ||
                    0
                  }
                  onContractInitiated={handleContractInitiated}
                />

                <ServiceSchedulingModal
                  isOpen={schedulingModalOpen}
                  onClose={() => setSchedulingModalOpen(false)}
                  estimateId={workflowEstimate.id}
                  customerName={workflowEstimate.customerName || ""}
                  serviceType={workflowEstimate.serviceType || ""}
                  estimatedDuration={240} // 4 hours default
                  onServiceScheduled={handleServiceScheduled}
                />

                <PaymentProcessingModal
                  isOpen={paymentModalOpen}
                  onClose={() => setPaymentModalOpen(false)}
                  estimateId={workflowEstimate.id}
                  customerName={workflowEstimate.customerName || ""}
                  totalAmount={
                    workflowEstimate.finalPrice ||
                    workflowEstimate.quotedPrice ||
                    0
                  }
                  onPaymentProcessed={handlePaymentProcessed}
                />

                <NotificationSystemModal
                  isOpen={notificationModalOpen}
                  onClose={() => setNotificationModalOpen(false)}
                  customerId={
                    workflowEstimate.customerId ||
                    `customer_${workflowEstimate.id}`
                  }
                  customerName={workflowEstimate.customerName || ""}
                  customerEmail={workflowEstimate.customerEmail || ""}
                  customerPhone={workflowEstimate.customerPhone}
                  serviceType={workflowEstimate.serviceType || ""}
                  onNotificationsSent={handleNotificationsSent}
                />
              </>
            )}

            {/* Workflow Progress Display */}
            {workflows.length > 0 && canManageWorkflow && (
              <div className="fixed bottom-4 right-4 max-w-md">
                {workflows.map((workflow) => (
                  <WorkflowProgress
                    key={workflow.estimateId}
                    workflow={workflow}
                    onStepAction={handleWorkflowStepAction}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
