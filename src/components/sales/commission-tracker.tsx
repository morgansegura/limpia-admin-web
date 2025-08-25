"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Award,
  Star,
  BarChart3,
  PieChart,
  LineChart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Eye,
  Settings,
  Phone,
  Mail,
  UserPlus,
  Handshake,
  CreditCard,
  Receipt,
  Percent,
  Trophy,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, addMonths } from "date-fns";

interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  territory: string;
  startDate: Date;
  status: "active" | "inactive" | "on_leave";
  commissionStructure: {
    baseRate: number; // percentage
    tierRates: {
      threshold: number;
      rate: number;
    }[];
    bonusStructure: {
      type: "quota_achievement" | "new_customer" | "retention" | "upsell";
      amount: number;
      criteria: string;
    }[];
  };
  quotas: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  manager: string;
}

interface Sale {
  id: string;
  salesRepId: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  saleDate: Date;
  closedDate: Date;
  status: "pending" | "approved" | "paid" | "disputed";
  leadSource: "referral" | "online" | "cold_call" | "repeat" | "marketing";
  isNewCustomer: boolean;
  contractLength: number; // months
  recurringValue: number;
  jobs: string[];
  notes?: string;
}

interface Commission {
  id: string;
  salesRepId: string;
  saleId: string;
  type:
    | "base_commission"
    | "tier_bonus"
    | "quota_bonus"
    | "new_customer_bonus"
    | "retention_bonus";
  amount: number;
  rate: number;
  calculatedOn: number; // base amount
  period: Date;
  status: "pending" | "approved" | "paid" | "disputed";
  paidDate?: Date;
  notes?: string;
}

interface SalesTarget {
  id: string;
  salesRepId: string;
  period: "monthly" | "quarterly" | "yearly";
  startDate: Date;
  endDate: Date;
  target: number;
  current: number;
  achievement: number; // percentage
  bonusEligible: boolean;
  bonusAmount?: number;
}

interface LeaderboardEntry {
  salesRepId: string;
  rank: number;
  totalSales: number;
  totalCommissions: number;
  newCustomers: number;
  quotaAchievement: number;
  trend: "up" | "down" | "same";
}

// Mock data
const mockSalesReps: SalesRep[] = [
  {
    id: "sales-1",
    name: "Sofia Martinez",
    email: "sofia.martinez@limpia.com",
    phone: "+1 (305) 555-0201",
    employeeId: "SALES-001",
    territory: "Miami-Dade County",
    startDate: new Date(2023, 3, 1),
    status: "active",
    commissionStructure: {
      baseRate: 5, // 5%
      tierRates: [
        { threshold: 10000, rate: 5 },
        { threshold: 25000, rate: 7 },
        { threshold: 50000, rate: 10 },
      ],
      bonusStructure: [
        {
          type: "quota_achievement",
          amount: 1000,
          criteria: "100% monthly quota",
        },
        {
          type: "new_customer",
          amount: 100,
          criteria: "Per new customer acquired",
        },
        {
          type: "retention",
          amount: 500,
          criteria: "95% customer retention rate",
        },
      ],
    },
    quotas: {
      monthly: 30000,
      quarterly: 90000,
      yearly: 360000,
    },
    manager: "Jennifer Rodriguez",
  },
  {
    id: "sales-2",
    name: "David Chen",
    email: "david.chen@limpia.com",
    phone: "+1 (305) 555-0202",
    employeeId: "SALES-002",
    territory: "Broward County",
    startDate: new Date(2023, 8, 15),
    status: "active",
    commissionStructure: {
      baseRate: 5,
      tierRates: [
        { threshold: 8000, rate: 5 },
        { threshold: 20000, rate: 7 },
        { threshold: 40000, rate: 9 },
      ],
      bonusStructure: [
        {
          type: "quota_achievement",
          amount: 750,
          criteria: "100% monthly quota",
        },
        {
          type: "new_customer",
          amount: 75,
          criteria: "Per new customer acquired",
        },
      ],
    },
    quotas: {
      monthly: 25000,
      quarterly: 75000,
      yearly: 300000,
    },
    manager: "Jennifer Rodriguez",
  },
];

const mockSales: Sale[] = [
  {
    id: "sale-1",
    salesRepId: "sales-1",
    customerId: "cus-1",
    customerName: "Elite Towers Miami",
    serviceType: "Commercial Deep Clean Package",
    amount: 8500,
    commissionRate: 7,
    commissionAmount: 595,
    saleDate: new Date(2024, 7, 10),
    closedDate: new Date(2024, 7, 12),
    status: "approved",
    leadSource: "referral",
    isNewCustomer: true,
    contractLength: 12,
    recurringValue: 2000,
    jobs: ["job-1", "job-2"],
  },
  {
    id: "sale-2",
    salesRepId: "sales-1",
    customerId: "cus-2",
    customerName: "Miami Beach Resort",
    serviceType: "Recurring Weekly Service",
    amount: 12000,
    commissionRate: 5,
    commissionAmount: 600,
    saleDate: new Date(2024, 7, 15),
    closedDate: new Date(2024, 7, 16),
    status: "paid",
    leadSource: "online",
    isNewCustomer: false,
    contractLength: 6,
    recurringValue: 2000,
    jobs: ["job-3"],
  },
  {
    id: "sale-3",
    salesRepId: "sales-2",
    customerId: "cus-3",
    customerName: "Sunrise Office Complex",
    serviceType: "Office Cleaning Contract",
    amount: 15000,
    commissionRate: 7,
    commissionAmount: 1050,
    saleDate: new Date(2024, 7, 8),
    closedDate: new Date(2024, 7, 10),
    status: "approved",
    leadSource: "cold_call",
    isNewCustomer: true,
    contractLength: 24,
    recurringValue: 1500,
    jobs: ["job-4", "job-5"],
  },
];

const mockCommissions: Commission[] = [
  {
    id: "comm-1",
    salesRepId: "sales-1",
    saleId: "sale-1",
    type: "base_commission",
    amount: 595,
    rate: 7,
    calculatedOn: 8500,
    period: new Date(2024, 7, 1),
    status: "approved",
  },
  {
    id: "comm-2",
    salesRepId: "sales-1",
    saleId: "sale-1",
    type: "new_customer_bonus",
    amount: 100,
    rate: 0,
    calculatedOn: 8500,
    period: new Date(2024, 7, 1),
    status: "pending",
  },
  {
    id: "comm-3",
    salesRepId: "sales-1",
    saleId: "sale-2",
    type: "base_commission",
    amount: 600,
    rate: 5,
    calculatedOn: 12000,
    period: new Date(2024, 7, 1),
    status: "paid",
    paidDate: new Date(2024, 7, 20),
  },
];

const mockTargets: SalesTarget[] = [
  {
    id: "target-1",
    salesRepId: "sales-1",
    period: "monthly",
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    target: 30000,
    current: 20500,
    achievement: 68.3,
    bonusEligible: false,
  },
  {
    id: "target-2",
    salesRepId: "sales-2",
    period: "monthly",
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    target: 25000,
    current: 15000,
    achievement: 60.0,
    bonusEligible: false,
  },
];

export function CommissionTracker() {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isRepDetailOpen, setIsRepDetailOpen] = useState(false);
  const [isSaleDetailOpen, setIsSaleDetailOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<string>("current_month");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isCommissionRulesOpen, setIsCommissionRulesOpen] = useState(false);
  const { user, isLoading } = useAuth();

  // Handle both string and enum role values for compatibility
  const isSalesRep = (user?.role as string) === "SALES_REP";
  const isSalesManager = (user?.role as string) === "SALES_MANAGER";

  // Load commission data
  useEffect(() => {
    if (user?.role) {
      console.log("🚀 Loading commission data for user role:", user.role);
      loadCommissionData();
    }
  }, [user?.role]);

  // Redirect sales reps away from restricted tabs
  useEffect(() => {
    if (isSalesRep && (activeTab === "reps" || activeTab === "leaderboard")) {
      setActiveTab("overview");
    }
  }, [isSalesRep, activeTab]);

  const loadCommissionData = async () => {
    try {
      setDataLoading(true);
      
      // Try to load from API (these will fail since no backend is running)
      const [salesData, commissionsData, targetsData, repsData] = await Promise.all([
        // salesApi.getSales(),
        // commissionsApi.getCommissions(), 
        // targetsApi.getTargets(),
        // salesApi.getSalesReps(),
        Promise.reject("No API"), // Simulate API failure
        Promise.reject("No API"),
        Promise.reject("No API"), 
        Promise.reject("No API"),
      ]);

      // If we get here, set the real API data
      setSales(salesData || []);
      setCommissions(commissionsData || []);
      setTargets(targetsData || []);
      setSalesReps(repsData || []);
      
    } catch (error) {
      console.log("📡 API failed, using mock commission data:", error);
      
      // Filter data based on user role for realistic experience
      // Use consistent data that matches the sales page for sales reps
      const salesRepConsistentData = isSalesRep ? {
        sales: [
          {
            id: "sale-sr-1",
            salesRepId: "sales-1",
            customerId: "cus-sr-1", 
            customerName: "Johnson Family",
            serviceType: "Recurring Service",
            amount: 153, // Matches sales page final price
            commissionRate: 15, // 23/153 = ~15%
            commissionAmount: 23, // Matches sales page
            saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            closedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            status: "approved" as const,
            leadSource: "referral" as const,
            isNewCustomer: true,
            contractLength: 12,
            recurringValue: 153,
            jobs: ["job-sr-1"],
          },
          {
            id: "sale-sr-2", 
            salesRepId: "sales-1",
            customerId: "cus-sr-2",
            customerName: "Smith Residence",
            serviceType: "Deep Clean Combo",
            amount: 350, // Matches sales page final price  
            commissionRate: 20, // 70/350 = 20%
            commissionAmount: 70, // Matches sales page
            saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            closedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: "paid" as const,
            leadSource: "online" as const,
            isNewCustomer: true,
            contractLength: 1,
            recurringValue: 0,
            jobs: ["job-sr-2"],
          }
        ],
        commissions: [
          // Johnson Family - RECURRING customer (lifetime commissions)
          // Month 1 commission
          {
            id: "comm-sr-1-m1",
            salesRepId: "sales-1",
            saleId: "sale-sr-1",
            type: "base_commission" as const,
            amount: 23, // Commission for August 2024
            rate: 15,
            calculatedOn: 153,
            period: new Date(2024, 7, 1), // August 2024
            status: "paid" as const,
            paidDate: new Date(2024, 7, 15),
            customerName: "Johnson Family",
            serviceMonth: "August 2024",
          },
          // Month 2 commission (same customer, next month)
          {
            id: "comm-sr-1-m2", 
            salesRepId: "sales-1",
            saleId: "sale-sr-1",
            type: "base_commission" as const,
            amount: 23, // Commission for September 2024
            rate: 15,
            calculatedOn: 153,
            period: new Date(2024, 8, 1), // September 2024
            status: "approved" as const,
            customerName: "Johnson Family",
            serviceMonth: "September 2024",
          },
          // Smith Residence - ONE-TIME customer (single commission)
          {
            id: "comm-sr-2",
            salesRepId: "sales-1", 
            saleId: "sale-sr-2",
            type: "base_commission" as const,
            amount: 70, // One-time commission for deep clean
            rate: 20,
            calculatedOn: 350,
            period: new Date(2024, 7, 1),
            status: "paid" as const,
            paidDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            customerName: "Smith Residence",
            serviceMonth: "One-time Service",
          }
        ]
      } : null;

      const filteredSales = isSalesRep 
        ? salesRepConsistentData?.sales || [] // Use consistent data for sales reps
        : mockSales; // All sales for managers

      const filteredCommissions = isSalesRep
        ? salesRepConsistentData?.commissions || [] // Use consistent data for sales reps
        : mockCommissions; // All commissions for managers

      const filteredTargets = isSalesRep
        ? mockTargets.filter(target => target.salesRepId === "sales-1") // Only current user's targets
        : mockTargets; // All targets for managers

      const filteredReps = isSalesRep
        ? mockSalesReps.filter(rep => rep.id === "sales-1") // Only current user
        : mockSalesReps; // All reps for managers

      console.log("🔧 Setting filtered mock data:", {
        sales: filteredSales.length,
        commissions: filteredCommissions.length,
        targets: filteredTargets.length,
        reps: filteredReps.length,
        userRole: user?.role,
        isSalesRep
      });

      setSales(filteredSales);
      setCommissions(filteredCommissions);
      setTargets(filteredTargets);
      setSalesReps(filteredReps);
    } finally {
      setDataLoading(false);
    }
  };

  // Filter sales
  const filteredSales = useMemo(() => {
    let filtered = sales;

    if (filterStatus !== "all") {
      filtered = filtered.filter((sale) => sale.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.serviceType.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered.sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime());
  }, [sales, filterStatus, searchTerm]);

  // Calculate commission statistics
  const commissionStats = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
    const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingCommissions = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0);
    const paidCommissions = commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.amount, 0);

    const newCustomers = sales.filter((s) => s.isNewCustomer).length;
    const avgCommissionRate =
      sales.length > 0
        ? sales.reduce((sum, s) => sum + s.commissionRate, 0) / sales.length
        : 0;

    const topPerformer = salesReps.reduce((top, rep) => {
      const repSales = sales
        .filter((s) => s.salesRepId === rep.id)
        .reduce((sum, s) => sum + s.amount, 0);
      const topSales = sales
        .filter((s) => s.salesRepId === (top?.id || ""))
        .reduce((sum, s) => sum + s.amount, 0);
      return repSales > topSales ? rep : top;
    }, null as SalesRep | null);

    // Debug commission calculations
    console.log("📊 Commission Stats Calculation:", {
      salesCount: sales.length,
      commissionsCount: commissions.length,
      salesRepsCount: salesReps.length,
      totalSales,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      newCustomers,
      avgCommissionRate: avgCommissionRate.toFixed(2),
      topPerformer: topPerformer?.name,
      salesData: sales.map(s => ({ id: s.id, amount: s.amount, salesRepId: s.salesRepId })),
      commissionsData: commissions.map(c => ({ id: c.id, amount: c.amount, status: c.status, salesRepId: c.salesRepId }))
    });

    return {
      totalSales,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      newCustomers,
      avgCommissionRate,
      topPerformer,
    };
  }, [sales, commissions, salesReps]);

  // Calculate leaderboard
  const leaderboard = useMemo(() => {
    return salesReps
      .map((rep) => {
        const repSales = sales.filter((s) => s.salesRepId === rep.id);
        const totalSales = repSales.reduce((sum, s) => sum + s.amount, 0);
        const totalCommissions = commissions
          .filter((c) => c.salesRepId === rep.id)
          .reduce((sum, c) => sum + c.amount, 0);
        const newCustomers = repSales.filter((s) => s.isNewCustomer).length;
        const target = targets.find((t) => t.salesRepId === rep.id);
        const quotaAchievement = target ? target.achievement : 0;

        return {
          salesRepId: rep.id,
          rank: 0, // Will be calculated after sorting
          totalSales,
          totalCommissions,
          newCustomers,
          quotaAchievement,
          trend: "up" as const, // Mock trend
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [salesReps, sales, commissions, targets]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "paid":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "disputed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCommissionTypeIcon = (type: string) => {
    switch (type) {
      case "base_commission":
        return Percent;
      case "tier_bonus":
        return TrendingUp;
      case "quota_bonus":
        return Target;
      case "new_customer_bonus":
        return UserPlus;
      case "retention_bonus":
        return Handshake;
      default:
        return DollarSign;
    }
  };

  const handleViewRep = (rep: SalesRep) => {
    setSelectedRep(rep);
    setIsRepDetailOpen(true);
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsSaleDetailOpen(true);
  };

  const handleCommissionRules = () => {
    setIsCommissionRulesOpen(true);
  };

  const handleExportReport = () => {
    // Generate CSV data
    const csvData = [
      ['Sales Rep', 'Total Sales', 'Total Commissions', 'Commission Rate', 'New Customers', 'Quota Achievement', 'Territory', 'Status'],
      ...salesReps.map(rep => {
        const repSales = sales.filter(s => s.salesRepId === rep.id);
        const totalSales = repSales.reduce((sum, s) => sum + s.amount, 0);
        const totalCommissions = commissions
          .filter(c => c.salesRepId === rep.id)
          .reduce((sum, c) => sum + c.amount, 0);
        const newCustomers = repSales.filter(s => s.isNewCustomer).length;
        const target = targets.find(t => t.salesRepId === rep.id);
        const quotaAchievement = target ? target.achievement : 0;
        
        return [
          rep.name,
          totalSales,
          totalCommissions,
          rep.commissionStructure.baseRate + '%',
          newCustomers,
          quotaAchievement.toFixed(1) + '%',
          rep.territory,
          rep.status
        ];
      })
    ];

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `commission-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApproveCommission = (commissionId: string) => {
    console.log("Approving commission:", commissionId);
  };

  const SalesRepCard = ({ rep }: { rep: SalesRep }) => {
    const repSales = sales.filter((s) => s.salesRepId === rep.id);
    const totalSales = repSales.reduce((sum, s) => sum + s.amount, 0);
    const totalCommissions = commissions
      .filter((c) => c.salesRepId === rep.id)
      .reduce((sum, c) => sum + c.amount, 0);
    const target = targets.find((t) => t.salesRepId === rep.id);
    const leaderboardEntry = leaderboard.find((l) => l.salesRepId === rep.id);

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleViewRep(rep)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{rep.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">#{leaderboardEntry?.rank}</Badge>
              <Badge
                variant={rep.status === "active" ? "default" : "secondary"}
              >
                {rep.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Sales This Month</div>
              <div className="font-bold text-lg">
                ${totalSales.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Commissions</div>
              <div className="font-bold text-lg">
                ${totalCommissions.toLocaleString()}
              </div>
            </div>
          </div>

          {target && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Quota Progress</span>
                <span>{target.achievement.toFixed(1)}%</span>
              </div>
              <Progress value={target.achievement} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                ${target.current.toLocaleString()} / $
                {target.target.toLocaleString()}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Territory</div>
              <div className="font-medium text-xs">{rep.territory}</div>
            </div>
            <div>
              <div className="text-muted-foreground">New Customers</div>
              <div className="font-medium">
                {leaderboardEntry?.newCustomers}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Base Rate</div>
              <div className="font-medium">
                {rep.commissionStructure.baseRate}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Contact rep");
              }}
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Email rep");
              }}
            >
              <Mail className="w-3 h-3 mr-1" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SaleCard = ({ sale }: { sale: Sale }) => {
    const salesRep = salesReps.find((r) => r.id === sale.salesRepId);
    const daysAgo = Math.floor(
      (new Date().getTime() - sale.saleDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleViewSale(sale)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {sale.customerName}
            </CardTitle>
            <Badge className={`${getStatusColor(sale.status)} text-white`}>
              {sale.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {sale.serviceType}
            </div>
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg">
                ${sale.amount.toLocaleString()}
              </div>
              <div className="text-sm text-green-600">
                ${sale.commissionAmount.toFixed(2)} commission
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-muted-foreground">Sales Rep</div>
              <div className="font-medium">{salesRep?.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Commission Rate</div>
              <div className="font-medium">{sale.commissionRate}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {sale.isNewCustomer && (
                <Badge variant="outline" className="text-xs">
                  New Customer
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {sale.leadSource}
              </Badge>
            </div>
            <span className="text-muted-foreground">{daysAgo} days ago</span>
          </div>

          {sale.recurringValue > 0 && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              Recurring: ${sale.recurringValue}/month × {sale.contractLength}{" "}
              months
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const CommissionCard = ({ commission }: { commission: Commission }) => {
    const salesRep = salesReps.find((r) => r.id === commission.salesRepId);
    const sale = sales.find((s) => s.id === commission.saleId);
    const TypeIcon = getCommissionTypeIcon(commission.type);

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {commission.type
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
            <Badge
              className={`${getStatusColor(commission.status)} text-white`}
            >
              {commission.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-bold">${commission.amount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sales Rep:</span>
              <span className="text-sm">{salesRep?.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Customer:</span>
              <span className="text-sm">{sale?.customerName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Period:</span>
              <span className="text-sm">
                {format(commission.period, "MMM yyyy")}
              </span>
            </div>
          </div>

          {commission.status === "pending" && (
            <div className="pt-3 border-t mt-3">
              {!isSalesRep ? (
                <Button
                  size="sm"
                  onClick={() => handleApproveCommission(commission.id)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approve
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Awaiting manager approval
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Show loading state while authentication or data is being resolved
  if (isLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Commission Tracking
            </h1>
            <p className="text-muted-foreground">
              Loading commission data...
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Commission Tracking
          </h1>
          <p className="text-muted-foreground">
            Track sales performance and commission earnings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="mr-1 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleCommissionRules}>
            <Settings className="mr-1 h-4 w-4" />
            Commission Rules
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${commissionStats.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Commissions
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${commissionStats.totalCommissions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${commissionStats.pendingCommissions.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {commissionStats.newCustomers}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isSalesRep ? "My Ranking" : "Top Performer"}
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isSalesRep ? (
              // For sales reps, show their ranking
              (() => {
                // For demo purposes, assume current user is the first sales rep
                // In real implementation, you'd match by user ID or email
                const currentUserRep = salesReps[0]; // Sofia Martinez as demo user
                const currentUserRanking = leaderboard.find(entry => entry.salesRepId === currentUserRep.id);
                const totalSalesReps = leaderboard.length;
                
                return (
                  <div>
                    <div className="text-lg font-bold">
                      #{currentUserRanking?.rank || 1}/{totalSalesReps}
                    </div>
                    <p className="text-xs text-muted-foreground">Your position</p>
                  </div>
                );
              })()
            ) : (
              // For sales managers, show top performer with location
              <div>
                <div className="text-lg font-bold">
                  {commissionStats.topPerformer?.name || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {commissionStats.topPerformer?.territory ? 
                    `${commissionStats.topPerformer.territory} • Leading sales` : 
                    "Leading sales"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {!isSalesRep && <TabsTrigger value="reps">Sales Reps</TabsTrigger>}
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          {!isSalesRep && <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Sales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sales.slice(0, 5).map((sale) => {
                  const salesRep = salesReps.find(
                    (r) => r.id === sale.salesRepId,
                  );

                  return (
                    <div
                      key={sale.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {sale.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {salesRep?.name} • ${sale.amount.toLocaleString()}
                        </div>
                      </div>
                      <Badge
                        className={`${getStatusColor(sale.status)} text-white`}
                      >
                        {sale.status}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Commissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {commissions
                  .filter((c) => c.status === "pending")
                  .slice(0, 5)
                  .map((commission) => {
                    const salesRep = salesReps.find(
                      (r) => r.id === commission.salesRepId,
                    );
                    const TypeIcon = getCommissionTypeIcon(commission.type);

                    return (
                      <div
                        key={commission.id}
                        className="flex items-center gap-3 p-2 border rounded"
                      >
                        <TypeIcon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {salesRep?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {commission.type.replace("_", " ")}
                          </div>
                        </div>
                        <div className="font-bold">
                          ${commission.amount.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reps" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {salesReps.map((rep) => (
              <SalesRepCard key={rep.id} rep={rep} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search sales..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sales Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSales.map((sale) => (
              <SaleCard key={sale.id} sale={sale} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commissions.map((commission) => (
              <CommissionCard key={commission.id} commission={commission} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => {
                  const rep = salesReps.find((r) => r.id === entry.salesRepId);
                  const target = targets.find(
                    (t) => t.salesRepId === entry.salesRepId,
                  );

                  return (
                    <div
                      key={entry.salesRepId}
                      className="flex items-center gap-4 p-3 border rounded"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        <span className="font-bold">#{entry.rank}</span>
                      </div>

                      <div className="flex-1">
                        <div className="font-medium">{rep?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {rep?.territory}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm text-center">
                        <div>
                          <div className="font-bold">
                            ${entry.totalSales.toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">Sales</div>
                        </div>
                        <div>
                          <div className="font-bold">
                            ${entry.totalCommissions.toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">
                            Commission
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {entry.quotaAchievement.toFixed(1)}%
                          </div>
                          <div className="text-muted-foreground">Quota</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {entry.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : entry.trend === "down" ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sales Rep Detail Dialog */}
      <Dialog open={isRepDetailOpen} onOpenChange={setIsRepDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sales Rep Details - {selectedRep?.name}</DialogTitle>
          </DialogHeader>

          {selectedRep && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Email:</strong> {selectedRep.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selectedRep.phone}
                    </div>
                    <div>
                      <strong>Employee ID:</strong> {selectedRep.employeeId}
                    </div>
                    <div>
                      <strong>Territory:</strong> {selectedRep.territory}
                    </div>
                    <div>
                      <strong>Manager:</strong> {selectedRep.manager}
                    </div>
                    <div>
                      <strong>Start Date:</strong>{" "}
                      {format(selectedRep.startDate, "PPP")}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Commission Structure</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Base Rate:</strong>{" "}
                      {selectedRep.commissionStructure.baseRate}%
                    </div>
                    <div>
                      <strong>Tier Rates:</strong>
                    </div>
                    <ul className="list-disc list-inside ml-4">
                      {selectedRep.commissionStructure.tierRates.map(
                        (tier, idx) => (
                          <li key={idx}>
                            ${tier.threshold.toLocaleString()}+ → {tier.rate}%
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Quotas & Performance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold">
                      ${selectedRep.quotas.monthly.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Monthly Quota
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold">
                      ${selectedRep.quotas.quarterly.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Quarterly Quota
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-bold">
                      ${selectedRep.quotas.yearly.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Yearly Quota
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Bonus Structure</h3>
                <div className="space-y-2">
                  {selectedRep.commissionStructure.bonusStructure.map(
                    (bonus, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <div className="font-medium">
                            {bonus.type
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {bonus.criteria}
                          </div>
                        </div>
                        <div className="font-bold">${bonus.amount}</div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sale Detail Dialog */}
      <Dialog open={isSaleDetailOpen} onOpenChange={setIsSaleDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Sale Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Customer:</strong> {selectedSale.customerName}
                    </div>
                    <div>
                      <strong>Service:</strong> {selectedSale.serviceType}
                    </div>
                    <div>
                      <strong>Amount:</strong> $
                      {selectedSale.amount.toLocaleString()}
                    </div>
                    <div>
                      <strong>Sale Date:</strong>{" "}
                      {format(selectedSale.saleDate, "PPP")}
                    </div>
                    <div>
                      <strong>Closed Date:</strong>{" "}
                      {format(selectedSale.closedDate, "PPP")}
                    </div>
                    <div>
                      <strong>Lead Source:</strong> {selectedSale.leadSource}
                    </div>
                    <div>
                      <strong>Contract Length:</strong>{" "}
                      {selectedSale.contractLength} months
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Commission Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Commission Rate:</strong>{" "}
                      {selectedSale.commissionRate}%
                    </div>
                    <div>
                      <strong>Commission Amount:</strong> $
                      {selectedSale.commissionAmount.toFixed(2)}
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <Badge
                        className={`ml-2 ${getStatusColor(
                          selectedSale.status,
                        )} text-white`}
                      >
                        {selectedSale.status}
                      </Badge>
                    </div>
                    {selectedSale.isNewCustomer && (
                      <div className="text-green-600">
                        <strong>New Customer Bonus Eligible</strong>
                      </div>
                    )}
                    {selectedSale.recurringValue > 0 && (
                      <div>
                        <strong>Recurring Value:</strong> $
                        {selectedSale.recurringValue}/month
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedSale.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm bg-muted p-3 rounded">
                    {selectedSale.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Commission Rules Dialog */}
      <Dialog open={isCommissionRulesOpen} onOpenChange={setIsCommissionRulesOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Commission Rules & Structure</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Tabs defaultValue="rates" className="w-full">
              <TabsList>
                <TabsTrigger value="rates">Commission Rates</TabsTrigger>
                <TabsTrigger value="bonuses">Bonus Structure</TabsTrigger>
                <TabsTrigger value="tiers">Performance Tiers</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
              </TabsList>

              <TabsContent value="rates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Base Commission Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded p-3">
                          <div className="font-semibold">New Sales Rep</div>
                          <div className="text-2xl font-bold text-blue-600">5%</div>
                          <div className="text-sm text-muted-foreground">Base rate for first 6 months</div>
                        </div>
                        <div className="border rounded p-3">
                          <div className="font-semibold">Experienced Rep</div>
                          <div className="text-2xl font-bold text-green-600">7%</div>
                          <div className="text-sm text-muted-foreground">After 6 months performance review</div>
                        </div>
                        <div className="border rounded p-3">
                          <div className="font-semibold">Senior Rep</div>
                          <div className="text-2xl font-bold text-purple-600">10%</div>
                          <div className="text-sm text-muted-foreground">Top performers & team leads</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bonuses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bonus Structure</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Bonuses complement base commissions and reward specific achievements under the lifetime model
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">New Customer Acquisition</div>
                            <div className="text-sm text-muted-foreground">Per new customer brought to Limpia</div>
                          </div>
                          <div className="text-lg font-bold text-green-600">$100</div>
                        </div>
                      </div>
                      <div className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">Monthly Quota Achievement</div>
                            <div className="text-sm text-muted-foreground">100% of monthly quota target</div>
                          </div>
                          <div className="text-lg font-bold text-blue-600">$1,000</div>
                        </div>
                      </div>
                      <div className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">Customer Retention</div>
                            <div className="text-sm text-muted-foreground">95%+ customer retention rate</div>
                          </div>
                          <div className="text-lg font-bold text-purple-600">$500</div>
                        </div>
                      </div>
                      <div className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">Upsell Success</div>
                            <div className="text-sm text-muted-foreground">Per successful service upsell</div>
                          </div>
                          <div className="text-lg font-bold text-orange-600">$50</div>
                        </div>
                      </div>
                      <div className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">Customer Longevity</div>
                            <div className="text-sm text-muted-foreground">Customer completes 12 months of service</div>
                          </div>
                          <div className="text-lg font-bold text-indigo-600">$200</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tiers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Tiers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded p-4 bg-red-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold text-red-700">Building (0-25% quota)</div>
                          <Badge variant="outline" className="border-red-300">Needs Improvement</Badge>
                        </div>
                        <div className="text-sm text-red-600">
                          • Base commission rate only<br/>
                          • No bonuses<br/>
                          • Monthly coaching sessions<br/>
                          • Performance improvement plan
                        </div>
                      </div>
                      <div className="border rounded p-4 bg-yellow-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold text-yellow-700">Fair (26-75% quota)</div>
                          <Badge variant="outline" className="border-yellow-300">Developing</Badge>
                        </div>
                        <div className="text-sm text-yellow-600">
                          • Base commission rate<br/>
                          • Limited bonuses (new customer only)<br/>
                          • Bi-weekly check-ins
                        </div>
                      </div>
                      <div className="border rounded p-4 bg-blue-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold text-blue-700">Good (76-99% quota)</div>
                          <Badge variant="outline" className="border-blue-300">Meeting Expectations</Badge>
                        </div>
                        <div className="text-sm text-blue-600">
                          • Base commission rate<br/>
                          • All bonuses available<br/>
                          • Standard support
                        </div>
                      </div>
                      <div className="border rounded p-4 bg-green-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold text-green-700">Excellent (100%+ quota)</div>
                          <Badge variant="outline" className="border-green-300">Exceeding Expectations</Badge>
                        </div>
                        <div className="text-sm text-green-600">
                          • Enhanced commission rate (+1%)<br/>
                          • All bonuses + quota bonus<br/>
                          • Recognition & rewards<br/>
                          • Leadership opportunities
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="policies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Policies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Lifetime Commission Model</h4>
                        <div className="bg-blue-50 p-3 rounded mb-3">
                          <div className="text-sm font-medium text-blue-900 mb-1">Key Principle</div>
                          <div className="text-sm text-blue-800">
                            Sales reps are responsible for the lifetime value of their customers and earn commissions 
                            over the entire relationship duration.
                          </div>
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          <li><strong>Recurring Customers:</strong> Earn commission every month the customer stays active</li>
                          <li><strong>One-Time Services:</strong> Earn single commission payment upon completion</li>
                          <li><strong>Customer Retention:</strong> Your commission continues as long as customer remains active</li>
                          <li><strong>Relationship Accountability:</strong> Sales reps liable for maintaining customer satisfaction</li>
                          <li><strong>Ongoing Contact:</strong> Expected to maintain regular communication with customers</li>
                          <li><strong>Service Quality:</strong> Commission loss occurs if customers cancel due to poor service</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Commission Examples</h4>
                        <div className="space-y-3">
                          <div className="border rounded p-3 bg-green-50">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium text-green-800">Recurring Service Customer</div>
                              <div className="text-sm text-green-600">Monthly Commission</div>
                            </div>
                            <div className="text-sm text-green-700">
                              Customer pays $200/month → Sales rep earns $14/month (7% rate)<br/>
                              <strong>12 months = $168 total | 24 months = $336 total</strong>
                            </div>
                          </div>
                          <div className="border rounded p-3 bg-orange-50">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium text-orange-800">One-Time Service Customer</div>
                              <div className="text-sm text-orange-600">Single Commission</div>
                            </div>
                            <div className="text-sm text-orange-700">
                              Customer pays $350 for deep clean → Sales rep earns $24.50 (7% rate)<br/>
                              <strong>Total commission: $24.50</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Payment Schedule</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          <li>Commissions are calculated monthly</li>
                          <li>Payment occurs on the 15th of the following month</li>
                          <li>Direct deposit to registered bank account</li>
                          <li>Commission statements provided via email</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Approval Process</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          <li>Sales must be approved by sales manager</li>
                          <li>Customer payment confirmed before commission release</li>
                          <li>Disputed commissions reviewed within 5 business days</li>
                          <li>Final approval by finance team</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Clawback Policy</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          <li>Commission subject to clawback if customer cancels within 90 days</li>
                          <li>Partial clawback for contract downgrades</li>
                          <li>No clawback for involuntary customer churn</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Sales Rep Responsibilities</h4>
                        <div className="bg-yellow-50 p-3 rounded mb-3">
                          <div className="text-sm font-medium text-yellow-900 mb-1">Customer Relationship Management</div>
                          <div className="text-sm text-yellow-800">
                            Under the lifetime commission model, sales reps act as ongoing account managers 
                            for their customers to ensure retention and satisfaction.
                          </div>
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          <li><strong>Regular Check-ins:</strong> Contact customers monthly to ensure satisfaction</li>
                          <li><strong>Service Quality Monitoring:</strong> Follow up after each cleaning service</li>
                          <li><strong>Issue Resolution:</strong> Address customer concerns before they lead to cancellation</li>
                          <li><strong>Upselling Opportunities:</strong> Identify additional service needs</li>
                          <li><strong>Renewal Management:</strong> Ensure contract renewals for long-term customers</li>
                          <li><strong>Customer Feedback:</strong> Relay service feedback to operations team</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Commission Adjustments</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          <li><strong>Customer Cancellation:</strong> Future commissions stop when customer cancels</li>
                          <li><strong>Service Downgrades:</strong> Commission adjusted to new service level</li>
                          <li><strong>Payment Issues:</strong> Commission held until customer payment resolved</li>
                          <li><strong>Quality Issues:</strong> Commission may be reduced for service-related cancellations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Territory Rules</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          <li>Sales reps assigned exclusive territories</li>
                          <li>Cross-territory sales require manager approval</li>
                          <li>Split commissions for collaborative sales</li>
                          <li>Territory boundaries reviewed quarterly</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
