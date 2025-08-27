"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { DollarSign, Award, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { salesApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface CommissionRecord {
  id: string;
  estimateId: string;
  customerName: string;
  serviceType: string;
  saleAmount: number;
  commissionAmount: number;
  commissionRate: number;
  tier: string;
  paidAt: string | null;
  createdAt: string;
  status: "pending" | "paid" | "processing";
}

interface CommissionSummary {
  thisMonth: {
    total: number;
    paid: number;
    pending: number;
    count: number;
  };
  lastMonth: {
    total: number;
    paid: number;
    pending: number;
    count: number;
  };
  yearToDate: {
    total: number;
    paid: number;
    pending: number;
    count: number;
  };
  currentTier: string;
  nextTierTarget: number;
  nextTierBonus: number;
}

interface SalesRepCommissionDetailProps {
  open: boolean;
  onClose: () => void;
}

export function SalesRepCommissionDetail({
  open,
  onClose,
}: SalesRepCommissionDetailProps) {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod] = useState<"thisMonth" | "lastMonth" | "ytd">(
    "thisMonth",
  );

  useEffect(() => {
    if (open) {
      loadCommissionData();
    }
  }, [open]);

  const loadCommissionData = async () => {
    setIsLoading(true);
    try {
      // Load commission records and summary
      const [commissionsData, summaryData] = await Promise.all([
        salesApi.getMyCommissions(),
        salesApi.getCommissionSummary(),
      ]);

      setCommissions(
        Array.isArray(commissionsData)
          ? (commissionsData as CommissionRecord[])
          : [],
      );
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to load commission data:", error);

      // Mock data for development
      const mockCommissions: CommissionRecord[] = [
        {
          id: "COMM-001",
          estimateId: "EST-001",
          customerName: "Johnson Family",
          serviceType: "Recurring Service",
          saleAmount: 183.26,
          commissionAmount: 18.33,
          commissionRate: 10,
          tier: "GOOD",
          paidAt: null,
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "pending",
        },
        {
          id: "COMM-002",
          estimateId: "EST-002",
          customerName: "Smith Residence",
          serviceType: "Deep Clean Combo",
          saleAmount: 350.0,
          commissionAmount: 70.0,
          commissionRate: 20,
          tier: "EXCELLENT",
          paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "paid",
        },
      ];

      const mockSummary: CommissionSummary = {
        thisMonth: { total: 245.5, paid: 70.0, pending: 175.5, count: 8 },
        lastMonth: { total: 420.0, paid: 420.0, pending: 0, count: 12 },
        yearToDate: { total: 2840.0, paid: 2265.0, pending: 575.0, count: 45 },
        currentTier: "GOOD",
        nextTierTarget: 500,
        nextTierBonus: 250,
      };

      setCommissions(mockCommissions);
      setSummary(mockSummary);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "EXCELLENT":
        return "text-green-600 bg-green-50";
      case "GOOD":
        return "text-blue-600 bg-blue-50";
      case "FAIR":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!summary) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Commission Details - {user?.firstName} {user?.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Commission Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              className={
                selectedPeriod === "thisMonth" ? "ring-2 ring-blue-500" : ""
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    ${summary.thisMonth.total.toFixed(2)}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Paid:</span>
                      <span className="font-medium">
                        ${summary.thisMonth.paid.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-medium">
                        ${summary.thisMonth.pending.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sales:</span>
                      <span className="font-medium">
                        {summary.thisMonth.count}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={
                selectedPeriod === "lastMonth" ? "ring-2 ring-blue-500" : ""
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Last Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    ${summary.lastMonth.total.toFixed(2)}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Paid:</span>
                      <span className="font-medium">
                        ${summary.lastMonth.paid.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sales:</span>
                      <span className="font-medium">
                        {summary.lastMonth.count}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={selectedPeriod === "ytd" ? "ring-2 ring-blue-500" : ""}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Year to Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    ${summary.yearToDate.total.toFixed(2)}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Paid:</span>
                      <span className="font-medium">
                        ${summary.yearToDate.paid.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-medium">
                        ${summary.yearToDate.pending.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sales:</span>
                      <span className="font-medium">
                        {summary.yearToDate.count}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Tier & Next Tier Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Award className="mr-2 h-4 w-4" />
                Commission Tier Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm">Current Tier:</span>
                    <Badge className={getTierColor(summary.currentTier)}>
                      {summary.currentTier}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This month&apos;s performance: $
                    {summary.thisMonth.total.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-sm mb-1">
                    Next tier: ${summary.nextTierTarget} (+$
                    {summary.nextTierBonus} bonus)
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((summary.thisMonth.total / summary.nextTierTarget) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    $
                    {(summary.nextTierTarget - summary.thisMonth.total).toFixed(
                      2,
                    )}{" "}
                    remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Records Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Recent Commission Records
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Sale Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Loading commission records...
                      </TableCell>
                    </TableRow>
                  ) : commissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No commission records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="text-sm">
                          {formatDistanceToNow(new Date(commission.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {commission.customerName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {commission.serviceType}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${commission.saleAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          ${commission.commissionAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>{commission.commissionRate}%</TableCell>
                        <TableCell>
                          <Badge className={getTierColor(commission.tier)}>
                            {commission.tier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(commission.status)}`}
                            ></div>
                            <span className="capitalize text-sm">
                              {commission.status}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
