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
  Users,
  Gift,
  DollarSign,
  TrendingUp,
  Share2,
  Award,
  Plus,
  Search,
  Download,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Copy,
  Settings,
} from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";

interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "tiered";
  reward: {
    referrer: number;
    referee: number;
    currency: "usd" | "credit";
  };
  tiers?: Array<{
    minReferrals: number;
    reward: number;
    title: string;
  }>;
  requirements: {
    minPurchase?: number;
    validityDays: number;
    maxUses?: number;
  };
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  totalReferrals: number;
  totalRewards: number;
  conversionRate: number;
}

interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  refereeId?: string;
  refereeName?: string;
  refereeEmail: string;
  status: "pending" | "signed_up" | "qualified" | "rewarded" | "expired";
  programId: string;
  code: string;
  createdAt: Date;
  signedUpAt?: Date;
  qualifiedAt?: Date;
  rewardedAt?: Date;
  reward: {
    referrer: number;
    referee: number;
    currency: "usd" | "credit";
  };
  firstPurchaseAmount?: number;
  jobIds: string[];
  notes?: string;
}

interface ReferralCustomer {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  totalReferrals: number;
  qualifiedReferrals: number;
  totalRewards: number;
  tier: string;
  status: "active" | "inactive";
  lastReferral?: Date;
  averageConversion: number;
  favoriteRewardType: "cash" | "credit" | "service";
}

interface ReferralTier {
  name: string;
  minReferrals: number;
  rewards: {
    perReferral: number;
    bonus?: number;
  };
  benefits: string[];
  color: string;
}

// Mock data
const mockPrograms: ReferralProgram[] = [
  {
    id: "prog-1",
    name: "Friends & Family",
    description: "Standard referral program for all customers",
    type: "fixed",
    reward: {
      referrer: 25,
      referee: 15,
      currency: "usd",
    },
    requirements: {
      minPurchase: 100,
      validityDays: 30,
      maxUses: 10,
    },
    isActive: true,
    startDate: new Date(2024, 0, 1),
    totalReferrals: 156,
    totalRewards: 3900,
    conversionRate: 72,
  },
  {
    id: "prog-2",
    name: "VIP Referrals",
    description: "Enhanced program for premium customers",
    type: "tiered",
    reward: {
      referrer: 50,
      referee: 25,
      currency: "usd",
    },
    tiers: [
      { minReferrals: 1, reward: 50, title: "Bronze" },
      { minReferrals: 5, reward: 75, title: "Silver" },
      { minReferrals: 10, reward: 100, title: "Gold" },
    ],
    requirements: {
      minPurchase: 200,
      validityDays: 60,
    },
    isActive: true,
    startDate: new Date(2024, 2, 1),
    totalReferrals: 89,
    totalRewards: 5650,
    conversionRate: 85,
  },
];

const mockReferrals: Referral[] = [
  {
    id: "ref-1",
    referrerId: "cus-1",
    referrerName: "Sofia Martinez",
    refereeId: "cus-new-1",
    refereeName: "Jennifer Wilson",
    refereeEmail: "jennifer@email.com",
    status: "rewarded",
    programId: "prog-1",
    code: "SOFIA25",
    createdAt: new Date(2024, 7, 10),
    signedUpAt: new Date(2024, 7, 12),
    qualifiedAt: new Date(2024, 7, 15),
    rewardedAt: new Date(2024, 7, 16),
    reward: { referrer: 25, referee: 15, currency: "usd" },
    firstPurchaseAmount: 180,
    jobIds: ["job-new-1"],
  },
  {
    id: "ref-2",
    referrerId: "cus-2",
    referrerName: "Robert Kim",
    refereeEmail: "michael@email.com",
    status: "signed_up",
    programId: "prog-1",
    code: "ROBERT25",
    createdAt: new Date(2024, 7, 14),
    signedUpAt: new Date(2024, 7, 16),
    reward: { referrer: 25, referee: 15, currency: "usd" },
    jobIds: [],
  },
  {
    id: "ref-3",
    referrerId: "cus-1",
    referrerName: "Sofia Martinez",
    refereeEmail: "david@email.com",
    status: "pending",
    programId: "prog-2",
    code: "SOFIA50",
    createdAt: new Date(2024, 7, 16),
    reward: { referrer: 50, referee: 25, currency: "usd" },
    jobIds: [],
  },
];

const mockCustomers: ReferralCustomer[] = [
  {
    id: "cus-1",
    name: "Sofia Martinez",
    email: "sofia@email.com",
    joinedAt: new Date(2024, 5, 15),
    totalReferrals: 8,
    qualifiedReferrals: 6,
    totalRewards: 375,
    tier: "Gold",
    status: "active",
    lastReferral: new Date(2024, 7, 16),
    averageConversion: 75,
    favoriteRewardType: "cash",
  },
  {
    id: "cus-2",
    name: "Robert Kim",
    email: "robert@email.com",
    joinedAt: new Date(2024, 6, 10),
    totalReferrals: 3,
    qualifiedReferrals: 2,
    totalRewards: 125,
    tier: "Silver",
    status: "active",
    lastReferral: new Date(2024, 7, 14),
    averageConversion: 67,
    favoriteRewardType: "credit",
  },
];

const referralTiers: ReferralTier[] = [
  {
    name: "Bronze",
    minReferrals: 1,
    rewards: { perReferral: 25 },
    benefits: ["Basic rewards", "Email support"],
    color: "bg-orange-500",
  },
  {
    name: "Silver",
    minReferrals: 5,
    rewards: { perReferral: 35, bonus: 50 },
    benefits: ["Enhanced rewards", "Priority support", "10% service discount"],
    color: "bg-gray-400",
  },
  {
    name: "Gold",
    minReferrals: 10,
    rewards: { perReferral: 50, bonus: 100 },
    benefits: [
      "Premium rewards",
      "VIP support",
      "15% service discount",
      "Exclusive offers",
    ],
    color: "bg-yellow-500",
  },
];

export function ReferralTracker() {
  const { toast } = useToast();
  const [programs] = useState<ReferralProgram[]>(mockPrograms);
  const [referrals] = useState<Referral[]>(mockReferrals);
  const [customers] = useState<ReferralCustomer[]>(mockCustomers);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    let filtered = referrals;

    if (filterStatus !== "all") {
      filtered = filtered.filter((ref) => ref.status === filterStatus);
    }

    if (filterProgram !== "all") {
      filtered = filtered.filter((ref) => ref.programId === filterProgram);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (ref) =>
          ref.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ref.refereeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ref.code.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }, [referrals, filterStatus, filterProgram, searchTerm]);

  // Calculate statistics
  const referralStats = useMemo(() => {
    const totalReferrals = referrals.length;
    const qualified = referrals.filter((ref) =>
      ["qualified", "rewarded"].includes(ref.status),
    ).length;
    const rewarded = referrals.filter(
      (ref) => ref.status === "rewarded",
    ).length;
    const pending = referrals.filter((ref) => ref.status === "pending").length;

    const totalRewards = referrals
      .filter((ref) => ref.status === "rewarded")
      .reduce((sum, ref) => sum + ref.reward.referrer + ref.reward.referee, 0);

    const conversionRate =
      totalReferrals > 0 ? (qualified / totalReferrals) * 100 : 0;
    const avgRewardValue = rewarded > 0 ? totalRewards / rewarded : 0;

    const thisMonth = referrals.filter(
      (ref) => ref.createdAt >= subDays(new Date(), 30),
    ).length;

    const topReferrer = customers.reduce(
      (top, customer) =>
        customer.totalReferrals > (top?.totalReferrals || 0) ? customer : top,
      null as ReferralCustomer | null,
    );

    return {
      totalReferrals,
      qualified,
      rewarded,
      pending,
      totalRewards,
      conversionRate,
      avgRewardValue,
      thisMonth,
      topReferrer,
    };
  }, [referrals, customers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "rewarded":
        return "bg-green-500";
      case "qualified":
        return "bg-blue-500";
      case "signed_up":
        return "bg-yellow-500";
      case "pending":
        return "bg-gray-500";
      case "expired":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "rewarded":
        return CheckCircle;
      case "qualified":
      case "signed_up":
        return Clock;
      case "expired":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getTierColor = (tier: string) => {
    const tierData = referralTiers.find((t) => t.name === tier);
    return tierData?.color || "bg-gray-500";
  };

  const handleCreateProgram = () => {
    console.log("Creating new referral program");
    setIsProgramDialogOpen(false);
  };

  const handleShareReferral = (code: string) => {
    navigator.clipboard.writeText(`Use code ${code} for special savings!`);
    console.log("Referral code copied:", code);
  };

  const handleExportReport = useCallback(async () => {
    try {
      // Generate CSV data based on current active tab
      let csvData = [];
      let filename = "";

      switch (activeTab) {
        case "overview":
        case "referrals":
          csvData = [
            [
              "Referral Code",
              "Referrer Name",
              "Referee Email",
              "Status",
              "Program",
              "Created Date",
              "Referrer Reward",
              "Referee Reward",
              "First Purchase",
              "Days Since Created",
            ],
            ...filteredReferrals.map((ref) => {
              const program = programs.find((p) => p.id === ref.programId);
              return [
                ref.code,
                ref.referrerName,
                ref.refereeEmail,
                ref.status,
                program?.name || "Unknown",
                format(ref.createdAt, "yyyy-MM-dd"),
                ref.reward.referrer,
                ref.reward.referee,
                ref.firstPurchaseAmount || 0,
                differenceInDays(new Date(), ref.createdAt),
              ];
            }),
          ];
          filename = `referrals-report`;
          break;

        case "customers":
          csvData = [
            [
              "Customer Name",
              "Email",
              "Tier",
              "Total Referrals",
              "Qualified Referrals",
              "Total Rewards",
              "Conversion Rate",
              "Status",
              "Last Referral",
              "Days Since Joined",
            ],
            ...customers.map((customer) => [
              customer.name,
              customer.email,
              customer.tier,
              customer.totalReferrals,
              customer.qualifiedReferrals,
              customer.totalRewards,
              `${((customer.qualifiedReferrals / customer.totalReferrals) * 100).toFixed(1)}%`,
              customer.status,
              customer.lastReferral
                ? format(customer.lastReferral, "yyyy-MM-dd")
                : "Never",
              differenceInDays(new Date(), customer.joinedAt),
            ]),
          ];
          filename = `referral-customers`;
          break;

        case "programs":
          csvData = [
            [
              "Program Name",
              "Description",
              "Type",
              "Referrer Reward",
              "Referee Reward",
              "Min Purchase",
              "Validity Days",
              "Status",
              "Total Referrals",
              "Conversion Rate",
              "Total Rewards",
            ],
            ...programs.map((program) => [
              program.name,
              program.description,
              program.type,
              program.reward.referrer,
              program.reward.referee,
              program.requirements.minPurchase || 0,
              program.requirements.validityDays,
              program.isActive ? "Active" : "Inactive",
              program.totalReferrals,
              `${program.conversionRate}%`,
              program.totalRewards,
            ]),
          ];
          filename = `referral-programs`;
          break;

        case "tiers":
          csvData = [
            [
              "Tier Name",
              "Min Referrals",
              "Per Referral Reward",
              "Bonus Reward",
              "Benefits",
            ],
            ...referralTiers.map((tier) => [
              tier.name,
              tier.minReferrals,
              tier.rewards.perReferral,
              tier.rewards.bonus || 0,
              tier.benefits.join("; "),
            ]),
          ];
          filename = `referral-tiers`;
          break;

        default:
          csvData = [["No data available"]];
          filename = "referrals-export";
      }

      // Convert to CSV string
      const csvContent = csvData.map((row) => row.join(",")).join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Referral report exported successfully`,
      });
    } catch (error) {
      console.error("Error exporting referral report:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export referral report. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeTab, filteredReferrals, customers, programs, toast]);

  const ReferralCard = ({ referral }: { referral: Referral }) => {
    const StatusIcon = getStatusIcon(referral.status);
    const daysAgo = differenceInDays(new Date(), referral.createdAt);

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedReferral(referral)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {referral.code}
            </CardTitle>
            <Badge className={`${getStatusColor(referral.status)} text-white`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {referral.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <div className="font-medium">From: {referral.referrerName}</div>
            <div className="text-muted-foreground">
              To: {referral.refereeEmail}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{daysAgo} days ago</span>
            <span className="font-medium">
              ${referral.reward.referrer + referral.reward.referee} potential
            </span>
          </div>

          {referral.firstPurchaseAmount && (
            <div className="text-xs text-green-600">
              First purchase: ${referral.firstPurchaseAmount}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const CustomerCard = ({ customer }: { customer: ReferralCustomer }) => {
    const conversionRate =
      customer.totalReferrals > 0
        ? (customer.qualifiedReferrals / customer.totalReferrals) * 100
        : 0;

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {customer.name}
            </CardTitle>
            <Badge className={`${getTierColor(customer.tier)} text-white`}>
              {customer.tier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Referrals</div>
              <div className="font-bold">{customer.totalReferrals}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Rewards</div>
              <div className="font-bold">${customer.totalRewards}</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Conversion Rate</span>
              <span>{conversionRate.toFixed(0)}%</span>
            </div>
            <Progress value={conversionRate} className="h-2" />
          </div>

          {customer.lastReferral && (
            <div className="text-xs text-muted-foreground">
              Last referral: {format(customer.lastReferral, "MMM dd, yyyy")}
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
            Referral Program
          </h1>
          <p className="text-muted-foreground">
            Track and manage customer referrals and rewards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="mr-1 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-1 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={() => setIsProgramDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New Program
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralStats.totalReferrals}
            </div>
            <p className="text-xs text-muted-foreground">
              {referralStats.thisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralStats.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {referralStats.qualified} qualified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${referralStats.totalRewards}
            </div>
            <p className="text-xs text-muted-foreground">
              {referralStats.rewarded} paid out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Reward</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${referralStats.avgRewardValue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">per referral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Referrer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {referralStats.topReferrer?.name.split(" ")[0] || "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {referralStats.topReferrer?.totalReferrals || 0} referrals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="customers">Top Referrers</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {referrals.slice(0, 5).map((referral) => {
                  const StatusIcon = getStatusIcon(referral.status);

                  return (
                    <div
                      key={referral.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {referral.code}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {referral.referrerName} → {referral.refereeEmail}
                        </div>
                      </div>
                      <Badge
                        className={`${getStatusColor(
                          referral.status,
                        )} text-white`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {referral.status}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Programs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {programs
                  .filter((p) => p.isActive)
                  .map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {program.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {program.conversionRate}% conversion • $
                          {program.totalRewards} rewards
                        </div>
                      </div>
                      <Badge variant="default">{program.totalReferrals}</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search referrals..."
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
                    <SelectItem value="signed_up">Signed Up</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="rewarded">Rewarded</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterProgram} onValueChange={setFilterProgram}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Referrals Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReferrals.map((referral) => (
              <ReferralCard key={referral.id} referral={referral} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers
              .sort((a, b) => b.totalReferrals - a.totalReferrals)
              .map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid gap-4">
            {programs.map((program) => (
              <Card
                key={program.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    <Badge variant={program.isActive ? "default" : "secondary"}>
                      {program.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {program.description}
                  </p>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">
                        Referrer Reward
                      </div>
                      <div className="font-bold">
                        ${program.reward.referrer}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Referee Reward
                      </div>
                      <div className="font-bold">${program.reward.referee}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Conversion</div>
                      <div className="font-bold">{program.conversionRate}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Rewards</div>
                      <div className="font-bold">${program.totalRewards}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {referralTiers.map((tier) => (
              <Card key={tier.name}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${tier.color}`} />
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <div className="font-medium">Requirements:</div>
                    <div className="text-muted-foreground">
                      {tier.minReferrals} qualified referrals
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium">Rewards:</div>
                    <div className="text-muted-foreground">
                      ${tier.rewards.perReferral} per referral
                      {tier.rewards.bonus && ` + $${tier.rewards.bonus} bonus`}
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium">Benefits:</div>
                    <ul className="text-muted-foreground list-disc list-inside">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Referral Details Dialog */}
      <Dialog
        open={isReferralDialogOpen}
        onOpenChange={setIsReferralDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Referral Details
            </DialogTitle>
          </DialogHeader>

          {selectedReferral && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Referral Code</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono">
                      {selectedReferral.code}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareReferral(selectedReferral.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    className={`${getStatusColor(
                      selectedReferral.status,
                    )} text-white mt-1`}
                  >
                    {selectedReferral.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Referrer</Label>
                  <p>{selectedReferral.referrerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Referee</Label>
                  <p>
                    {selectedReferral.refereeName ||
                      selectedReferral.refereeEmail}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{format(selectedReferral.createdAt, "PPpp")}</p>
                </div>
                {selectedReferral.rewardedAt && (
                  <div>
                    <Label className="text-sm font-medium">Rewarded</Label>
                    <p>{format(selectedReferral.rewardedAt, "PPpp")}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Referrer Reward</Label>
                  <p className="text-lg font-bold">
                    ${selectedReferral.reward.referrer}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Referee Reward</Label>
                  <p className="text-lg font-bold">
                    ${selectedReferral.reward.referee}
                  </p>
                </div>
              </div>

              {selectedReferral.firstPurchaseAmount && (
                <div>
                  <Label className="text-sm font-medium">First Purchase</Label>
                  <p className="text-lg font-bold text-green-600">
                    ${selectedReferral.firstPurchaseAmount}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="outline">
                  <Mail className="mr-1 h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="outline">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Send SMS
                </Button>
                <div className="flex-1" />
                <Button variant="outline">
                  <Eye className="mr-1 h-4 w-4" />
                  View Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Program Creation Dialog */}
      <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Referral Program</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="program-name">Program Name</Label>
              <Input placeholder="Enter program name" />
            </div>

            <div>
              <Label htmlFor="program-description">Description</Label>
              <Input placeholder="Describe your program" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referrer-reward">Referrer Reward ($)</Label>
                <Input type="number" placeholder="25" />
              </div>
              <div>
                <Label htmlFor="referee-reward">Referee Reward ($)</Label>
                <Input type="number" placeholder="15" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-purchase">Min Purchase ($)</Label>
                <Input type="number" placeholder="100" />
              </div>
              <div>
                <Label htmlFor="validity-days">Validity (Days)</Label>
                <Input type="number" placeholder="30" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleCreateProgram}>Create Program</Button>
              <Button
                variant="outline"
                onClick={() => setIsProgramDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
