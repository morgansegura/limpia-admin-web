"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  Award,
  Target,
  Star,
  Gift,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Settings,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Calculator,
  CreditCard,
  Wallet,
  Coins,
  Banknote,
  Receipt,
  FileText,
} from "lucide-react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

interface Worker {
  id: string;
  name: string;
  email: string;
  role: "lead" | "cleaner" | "trainee" | "sales" | "manager";
  department: "operations" | "sales" | "management";
  hireDate: Date;
  status: "active" | "inactive" | "on_leave";
  payStructure: {
    type: "hourly" | "salary" | "commission" | "mixed";
    baseRate: number;
    commissionRate?: number;
    bonusStructure?: string[];
  };
  performance: {
    rating: number;
    completedJobs: number;
    customerRating: number;
    efficiency: number;
  };
}

interface EarningsRecord {
  id: string;
  workerId: string;
  period: Date;
  type: "regular" | "overtime" | "commission" | "bonus" | "tip" | "adjustment";
  description: string;
  hoursWorked?: number;
  rate?: number;
  amount: number;
  jobId?: string;
  customerName?: string;
  status: "pending" | "approved" | "paid" | "disputed";
  createdAt: Date;
  paidAt?: Date;
  taxable: boolean;
}

interface PayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  status: "open" | "processing" | "paid" | "closed";
  totalPay: number;
  totalHours: number;
  workerCount: number;
}

interface EarningsSummary {
  workerId: string;
  period: string;
  totalEarnings: number;
  regularPay: number;
  overtimePay: number;
  commissions: number;
  bonuses: number;
  tips: number;
  hoursWorked: number;
  jobsCompleted: number;
  avgHourlyRate: number;
  yearToDate: number;
}

// Mock data
const mockWorkers: Worker[] = [
  {
    id: "worker-1",
    name: "Maria Santos",
    email: "maria@limpia.com",
    role: "lead",
    department: "operations",
    hireDate: new Date(2023, 5, 15),
    status: "active",
    payStructure: {
      type: "hourly",
      baseRate: 22.5,
      bonusStructure: [
        "Quality bonus: $50/week for 4.8+ rating",
        "Team lead bonus: $100/month",
      ],
    },
    performance: {
      rating: 4.8,
      completedJobs: 234,
      customerRating: 4.9,
      efficiency: 92,
    },
  },
  {
    id: "worker-2",
    name: "Carlos Rodriguez",
    email: "carlos@limpia.com",
    role: "cleaner",
    department: "operations",
    hireDate: new Date(2023, 8, 10),
    status: "active",
    payStructure: {
      type: "hourly",
      baseRate: 18.75,
      bonusStructure: ["Efficiency bonus: $25/week for 90%+ efficiency"],
    },
    performance: {
      rating: 4.6,
      completedJobs: 187,
      customerRating: 4.7,
      efficiency: 88,
    },
  },
  {
    id: "worker-3",
    name: "Ana Gutierrez",
    email: "ana@limpia.com",
    role: "cleaner",
    department: "operations",
    hireDate: new Date(2024, 1, 20),
    status: "active",
    payStructure: {
      type: "hourly",
      baseRate: 19.25,
      bonusStructure: ["Customer satisfaction bonus: $30/week for 4.8+ rating"],
    },
    performance: {
      rating: 4.9,
      completedJobs: 156,
      customerRating: 4.8,
      efficiency: 94,
    },
  },
  {
    id: "worker-4",
    name: "Sofia Martinez",
    email: "sofia@limpia.com",
    role: "sales",
    department: "sales",
    hireDate: new Date(2023, 3, 1),
    status: "active",
    payStructure: {
      type: "mixed",
      baseRate: 45000, // annual salary
      commissionRate: 5, // 5% of sales
      bonusStructure: [
        "Monthly quota bonus: $500 for 100%+ quota",
        "New customer bonus: $25 per new customer",
      ],
    },
    performance: {
      rating: 4.7,
      completedJobs: 89, // sales calls/deals
      customerRating: 4.6,
      efficiency: 87,
    },
  },
];

const mockEarnings: EarningsRecord[] = [
  {
    id: "earn-1",
    workerId: "worker-1",
    period: new Date(2024, 7, 16),
    type: "regular",
    description: "Regular hours - Week ending 8/16",
    hoursWorked: 40,
    rate: 22.5,
    amount: 900,
    status: "approved",
    createdAt: new Date(2024, 7, 16),
    taxable: true,
  },
  {
    id: "earn-2",
    workerId: "worker-1",
    period: new Date(2024, 7, 16),
    type: "bonus",
    description: "Quality bonus - 4.8+ rating",
    amount: 50,
    status: "approved",
    createdAt: new Date(2024, 7, 16),
    taxable: true,
  },
  {
    id: "earn-3",
    workerId: "worker-1",
    period: new Date(2024, 7, 16),
    type: "tip",
    description: "Customer tip - Sofia Martinez job",
    amount: 25,
    jobId: "job-1",
    customerName: "Sofia Martinez",
    status: "paid",
    createdAt: new Date(2024, 7, 15),
    paidAt: new Date(2024, 7, 16),
    taxable: true,
  },
  {
    id: "earn-4",
    workerId: "worker-2",
    period: new Date(2024, 7, 16),
    type: "regular",
    description: "Regular hours - Week ending 8/16",
    hoursWorked: 38,
    rate: 18.75,
    amount: 712.5,
    status: "approved",
    createdAt: new Date(2024, 7, 16),
    taxable: true,
  },
  {
    id: "earn-5",
    workerId: "worker-4",
    period: new Date(2024, 7, 16),
    type: "commission",
    description: "Sales commission - July 2024",
    amount: 1247.5,
    status: "approved",
    createdAt: new Date(2024, 7, 16),
    taxable: true,
  },
  {
    id: "earn-6",
    workerId: "worker-4",
    period: new Date(2024, 7, 16),
    type: "bonus",
    description: "Monthly quota bonus - 110% of target",
    amount: 500,
    status: "pending",
    createdAt: new Date(2024, 7, 16),
    taxable: true,
  },
];

const currentPayPeriod: PayPeriod = {
  id: "pp-current",
  startDate: startOfWeek(new Date()),
  endDate: endOfWeek(new Date()),
  status: "open",
  totalPay: 8947.5,
  totalHours: 456,
  workerCount: 12,
};

export function WorkerEarnings() {
  const [workers] = useState<Worker[]>(mockWorkers);
  const [earnings] = useState<EarningsRecord[]>(mockEarnings);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isEarningsDetailOpen, setIsEarningsDetailOpen] = useState(false);
  const [isPayrollSummaryOpen, setIsPayrollSummaryOpen] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("current_week");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Filter workers
  const filteredWorkers = useMemo(() => {
    let filtered = workers;

    if (filterDepartment !== "all") {
      filtered = filtered.filter(
        (worker) => worker.department === filterDepartment,
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (worker) =>
          worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [workers, filterDepartment, searchTerm]);

  const handleExportPayroll = useCallback(async () => {
    try {
      // Generate CSV data for payroll export
      const csvData = [
        ["Employee Name", "Department", "Role", "Base Rate", "Total Earnings", "Hours Worked", "Pay Period"],
        ...filteredWorkers.map(worker => {
          const workerEarnings = earnings.filter(e => e.workerId === worker.id);
          const totalEarnings = workerEarnings.reduce((sum, e) => sum + e.amount, 0);
          const totalHours = workerEarnings.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);
          return [
            worker.name,
            worker.department,
            worker.role,
            worker.payStructure.baseRate,
            totalEarnings,
            totalHours,
            filterPeriod.replace('_', ' ')
          ];
        })
      ];

      // Convert to CSV string
      const csvContent = csvData.map(row => row.join(",")).join("\\n");
      
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payroll-export-${filterPeriod}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Payroll data exported successfully for ${filterPeriod.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error("Error exporting payroll:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export payroll data. Please try again.",
        variant: "destructive",
      });
    }
  }, [filteredWorkers, earnings, filterPeriod, toast]);

  // Calculate earnings summaries
  const earningsSummaries = useMemo(() => {
    return workers.map((worker) => {
      const workerEarnings = earnings.filter((e) => e.workerId === worker.id);

      const totalEarnings = workerEarnings.reduce(
        (sum, e) => sum + e.amount,
        0,
      );
      const regularPay = workerEarnings
        .filter((e) => e.type === "regular")
        .reduce((sum, e) => sum + e.amount, 0);
      const overtimePay = workerEarnings
        .filter((e) => e.type === "overtime")
        .reduce((sum, e) => sum + e.amount, 0);
      const commissions = workerEarnings
        .filter((e) => e.type === "commission")
        .reduce((sum, e) => sum + e.amount, 0);
      const bonuses = workerEarnings
        .filter((e) => e.type === "bonus")
        .reduce((sum, e) => sum + e.amount, 0);
      const tips = workerEarnings
        .filter((e) => e.type === "tip")
        .reduce((sum, e) => sum + e.amount, 0);

      const hoursWorked = workerEarnings
        .filter((e) => e.hoursWorked)
        .reduce((sum, e) => sum + (e.hoursWorked || 0), 0);

      const avgHourlyRate =
        hoursWorked > 0 ? (regularPay + overtimePay) / hoursWorked : 0;

      return {
        workerId: worker.id,
        period: "Current Week",
        totalEarnings,
        regularPay,
        overtimePay,
        commissions,
        bonuses,
        tips,
        hoursWorked,
        jobsCompleted: worker.performance.completedJobs,
        avgHourlyRate,
        yearToDate: totalEarnings * 52, // Mock YTD calculation
      };
    });
  }, [workers, earnings]);

  // Calculate payroll statistics
  const payrollStats = useMemo(() => {
    const totalWorkers = workers.length;
    const activeWorkers = workers.filter((w) => w.status === "active").length;
    const totalPay = earningsSummaries.reduce(
      (sum, e) => sum + e.totalEarnings,
      0,
    );
    const totalHours = earningsSummaries.reduce(
      (sum, e) => sum + e.hoursWorked,
      0,
    );
    const avgPay = totalWorkers > 0 ? totalPay / totalWorkers : 0;
    const avgHourlyRate = totalHours > 0 ? totalPay / totalHours : 0;

    const pendingApprovals = earnings.filter(
      (e) => e.status === "pending",
    ).length;
    const totalCommissions = earningsSummaries.reduce(
      (sum, e) => sum + e.commissions,
      0,
    );

    return {
      totalWorkers,
      activeWorkers,
      totalPay,
      totalHours,
      avgPay,
      avgHourlyRate,
      pendingApprovals,
      totalCommissions,
    };
  }, [workers, earningsSummaries, earnings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "approved":
        return "bg-blue-500";
      case "paid":
        return "bg-green-500";
      case "disputed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEarningTypeIcon = (type: string) => {
    switch (type) {
      case "regular":
        return Clock;
      case "overtime":
        return TrendingUp;
      case "commission":
        return Target;
      case "bonus":
        return Award;
      case "tip":
        return Gift;
      case "adjustment":
        return Calculator;
      default:
        return DollarSign;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "lead":
        return Star;
      case "sales":
        return Target;
      case "manager":
        return Users;
      default:
        return Users;
    }
  };

  const handleViewWorkerDetails = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsEarningsDetailOpen(true);
  };

  const handleApproveEarning = (earningId: string) => {
    console.log("Approving earning:", earningId);
  };

  const handleProcessPayroll = () => {
    console.log("Processing payroll for current period");
  };

  const WorkerEarningsCard = ({ worker }: { worker: Worker }) => {
    const summary = earningsSummaries.find((s) => s.workerId === worker.id);
    const RoleIcon = getRoleIcon(worker.role);

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleViewWorkerDetails(worker)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RoleIcon className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                {worker.name}
              </CardTitle>
            </div>
            <Badge
              variant={worker.status === "active" ? "default" : "secondary"}
            >
              {worker.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Earnings</div>
              <div className="font-bold text-lg">
                ${summary?.totalEarnings.toFixed(2) || "0.00"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Hours</div>
              <div className="font-bold">{summary?.hoursWorked || 0}h</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Hourly Rate</div>
              <div className="font-medium">
                ${worker.payStructure.baseRate.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Performance</div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{worker.performance.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {worker.role} • {worker.department}
            </span>
            <span>{summary?.jobsCompleted || 0} jobs</span>
          </div>

          {summary && summary.commissions > 0 && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              Commission: ${summary.commissions.toFixed(2)}
            </div>
          )}

          {summary && summary.bonuses > 0 && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              Bonuses: ${summary.bonuses.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const EarningsBreakdownCard = ({ summary }: { summary: EarningsSummary }) => {
    const worker = workers.find((w) => w.id === summary.workerId);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {worker?.name} - Earnings Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Regular Pay:
                </span>
                <span className="font-medium">
                  ${summary.regularPay.toFixed(2)}
                </span>
              </div>
              {summary.overtimePay > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Overtime:
                  </span>
                  <span className="font-medium">
                    ${summary.overtimePay.toFixed(2)}
                  </span>
                </div>
              )}
              {summary.commissions > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Commission:
                  </span>
                  <span className="font-medium">
                    ${summary.commissions.toFixed(2)}
                  </span>
                </div>
              )}
              {summary.bonuses > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Bonuses:
                  </span>
                  <span className="font-medium">
                    ${summary.bonuses.toFixed(2)}
                  </span>
                </div>
              )}
              {summary.tips > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tips:</span>
                  <span className="font-medium">
                    ${summary.tips.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Hours Worked:
                </span>
                <span className="font-medium">{summary.hoursWorked}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg Hourly:
                </span>
                <span className="font-medium">
                  ${summary.avgHourlyRate.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Jobs Completed:
                </span>
                <span className="font-medium">{summary.jobsCompleted}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Earnings:</span>
              <span>${summary.totalEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Year to Date:</span>
              <span>${summary.yearToDate.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Worker Earnings</h1>
          <p className="text-muted-foreground">
            Track and manage employee compensation and payroll
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPayroll}>
            <Download className="mr-1 h-4 w-4" />
            Export Payroll
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPayrollSummaryOpen(true)}
          >
            <FileText className="mr-1 h-4 w-4" />
            Payroll Summary
          </Button>
          <Button onClick={handleProcessPayroll}>
            <CreditCard className="mr-1 h-4 w-4" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payrollStats.totalPay.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollStats.activeWorkers}
            </div>
            <p className="text-xs text-muted-foreground">
              {payrollStats.totalWorkers} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Hourly Rate
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payrollStats.avgHourlyRate.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payrollStats.totalHours} total hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollStats.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">Need review</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Pay Period Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Pay Period</CardTitle>
            <Badge
              className={`${
                currentPayPeriod.status === "open"
                  ? "bg-green-500"
                  : "bg-gray-500"
              } text-white`}
            >
              {currentPayPeriod.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Period</div>
              <div className="font-medium">
                {format(currentPayPeriod.startDate, "MMM dd")} -{" "}
                {format(currentPayPeriod.endDate, "MMM dd, yyyy")}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Pay</div>
              <div className="font-bold">
                ${currentPayPeriod.totalPay.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Hours</div>
              <div className="font-bold">{currentPayPeriod.totalHours}h</div>
            </div>
            <div>
              <div className="text-muted-foreground">Workers</div>
              <div className="font-bold">{currentPayPeriod.workerCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workers">Worker Earnings</TabsTrigger>
          <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Top Earners This Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {earningsSummaries
                  .sort((a, b) => b.totalEarnings - a.totalEarnings)
                  .slice(0, 5)
                  .map((summary) => {
                    const worker = workers.find(
                      (w) => w.id === summary.workerId,
                    );
                    return (
                      <div
                        key={summary.workerId}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <div className="font-medium">{worker?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {worker?.role}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            ${summary.totalEarnings.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {summary.hoursWorked}h
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Department Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["operations", "sales", "management"].map((dept) => {
                  const deptWorkers = workers.filter(
                    (w) => w.department === dept,
                  );
                  const deptEarnings = earningsSummaries
                    .filter((s) => deptWorkers.some((w) => w.id === s.workerId))
                    .reduce((sum, s) => sum + s.totalEarnings, 0);

                  return (
                    <div
                      key={dept}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium capitalize">{dept}</div>
                        <div className="text-sm text-muted-foreground">
                          {deptWorkers.length} workers
                        </div>
                      </div>
                      <div className="font-bold">
                        ${deptEarnings.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search workers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={filterDepartment}
                  onValueChange={setFilterDepartment}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_week">Current Week</SelectItem>
                    <SelectItem value="last_week">Last Week</SelectItem>
                    <SelectItem value="current_month">Current Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Workers Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((worker) => (
              <WorkerEarningsCard key={worker.id} worker={worker} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {earningsSummaries.map((summary) => (
              <EarningsBreakdownCard key={summary.workerId} summary={summary} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Earnings Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {earnings
                  .filter((e) => e.status === "pending")
                  .map((earning) => {
                    const worker = workers.find(
                      (w) => w.id === earning.workerId,
                    );
                    const TypeIcon = getEarningTypeIcon(earning.type);

                    return (
                      <div
                        key={earning.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-3">
                          <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{worker?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {earning.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(earning.createdAt, "MMM dd, yyyy")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold">
                              ${earning.amount.toFixed(2)}
                            </div>
                            <Badge
                              className={`${getStatusColor(
                                earning.status,
                              )} text-white`}
                            >
                              {earning.status}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleApproveEarning(earning.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Worker Earnings Detail Dialog */}
      <Dialog
        open={isEarningsDetailOpen}
        onOpenChange={setIsEarningsDetailOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Worker Earnings Details - {selectedWorker?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedWorker && (
            <div className="space-y-6">
              {/* Worker Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Worker Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedWorker.name}
                    </div>
                    <div>
                      <strong>Role:</strong> {selectedWorker.role}
                    </div>
                    <div>
                      <strong>Department:</strong> {selectedWorker.department}
                    </div>
                    <div>
                      <strong>Hire Date:</strong>{" "}
                      {format(selectedWorker.hireDate, "PPP")}
                    </div>
                    <div>
                      <strong>Status:</strong> {selectedWorker.status}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Pay Structure</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Type:</strong> {selectedWorker.payStructure.type}
                    </div>
                    <div>
                      <strong>Base Rate:</strong> $
                      {selectedWorker.payStructure.baseRate.toFixed(2)}
                    </div>
                    {selectedWorker.payStructure.commissionRate && (
                      <div>
                        <strong>Commission:</strong>{" "}
                        {selectedWorker.payStructure.commissionRate}%
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="font-semibold mb-3">Performance</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Rating</div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">
                        {selectedWorker.performance.rating}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Jobs Completed</div>
                    <div className="font-bold">
                      {selectedWorker.performance.completedJobs}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Customer Rating</div>
                    <div className="font-bold">
                      {selectedWorker.performance.customerRating}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Efficiency</div>
                    <div className="font-bold">
                      {selectedWorker.performance.efficiency}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings History */}
              <div>
                <h3 className="font-semibold mb-3">Recent Earnings</h3>
                <div className="space-y-2">
                  {earnings
                    .filter((e) => e.workerId === selectedWorker.id)
                    .map((earning) => {
                      const TypeIcon = getEarningTypeIcon(earning.type);

                      return (
                        <div
                          key={earning.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center gap-2">
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">
                                {earning.description}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(earning.createdAt, "MMM dd, yyyy")}
                                {earning.hoursWorked &&
                                  ` • ${earning.hoursWorked}h`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              ${earning.amount.toFixed(2)}
                            </div>
                            <Badge
                              className={`${getStatusColor(
                                earning.status,
                              )} text-white text-xs`}
                            >
                              {earning.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Bonus Structure */}
              {selectedWorker.payStructure.bonusStructure && (
                <div>
                  <h3 className="font-semibold mb-3">Bonus Structure</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedWorker.payStructure.bonusStructure.map(
                      (bonus, idx) => (
                        <li key={idx}>{bonus}</li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="outline">
                  <Download className="mr-1 h-4 w-4" />
                  Export Details
                </Button>
                <Button variant="outline">
                  <Calculator className="mr-1 h-4 w-4" />
                  Calculate Pay
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEarningsDetailOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payroll Summary Dialog */}
      <Dialog
        open={isPayrollSummaryOpen}
        onOpenChange={setIsPayrollSummaryOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payroll Summary</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded">
                <div className="text-2xl font-bold">
                  ${payrollStats.totalPay.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Payroll
                </div>
              </div>
              <div className="p-4 border rounded">
                <div className="text-2xl font-bold">
                  {payrollStats.totalHours}h
                </div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </div>
              <div className="p-4 border rounded">
                <div className="text-2xl font-bold">
                  {payrollStats.activeWorkers}
                </div>
                <div className="text-sm text-muted-foreground">Workers</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Department Summary</h3>
              <div className="space-y-2">
                {["operations", "sales", "management"].map((dept) => {
                  const deptWorkers = workers.filter(
                    (w) => w.department === dept,
                  );
                  const deptEarnings = earningsSummaries
                    .filter((s) => deptWorkers.some((w) => w.id === s.workerId))
                    .reduce((sum, s) => sum + s.totalEarnings, 0);
                  const deptHours = earningsSummaries
                    .filter((s) => deptWorkers.some((w) => w.id === s.workerId))
                    .reduce((sum, s) => sum + s.hoursWorked, 0);

                  return (
                    <div
                      key={dept}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <div className="font-medium capitalize">{dept}</div>
                        <div className="text-sm text-muted-foreground">
                          {deptWorkers.length} workers • {deptHours}h
                        </div>
                      </div>
                      <div className="font-bold">
                        ${deptEarnings.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleProcessPayroll}>
                <CreditCard className="mr-1 h-4 w-4" />
                Process Payroll
              </Button>
              <Button variant="outline">
                <Download className="mr-1 h-4 w-4" />
                Export Summary
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPayrollSummaryOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
