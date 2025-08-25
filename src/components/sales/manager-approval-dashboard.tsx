"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Percent,
  User,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { salesApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface DiscountApproval {
  id: string;
  salesRepId: string;
  salesRepName: string;
  customerId?: string;
  customerName?: string;
  discountAmount: number;
  discountPercentage: number;
  basePrice: number;
  finalPrice: number;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  managerNotes?: string;
  exceedsThreshold: boolean;
  exceedsBudget: boolean;
  customerInfo?: any;
}

export function ManagerApprovalDashboard() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<DiscountApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<DiscountApproval | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [managerNotes, setManagerNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Load discount approvals
  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const loadApprovals = async () => {
    setIsLoading(true);
    try {
      const data = await salesApi.getDiscountApprovals({
        status: filter === 'all' ? undefined : filter,
        managerId: user?.id,
      });
      setApprovals(Array.isArray(data) ? data : []);
    } catch (error: any) {
      // Handle authentication errors
      if (error?.response?.status === 401 || error?.message?.includes('jwt expired')) {
        console.warn("🔐 Authentication expired, using mock approval data. Manager may need to re-login:", error);
      } else {
        console.error("Failed to load discount approvals:", error);
      }
      // Mock data for development
      const mockApprovals: DiscountApproval[] = [
        {
          id: "DA-001",
          salesRepId: "sr-001",
          salesRepName: "Sales Rep A",
          customerName: "Johnson Family",
          discountAmount: 85,
          discountPercentage: 25,
          basePrice: 340,
          finalPrice: 255,
          justification: "Customer is price shopping with competitor who quoted $260. They are a potential high-value recurring customer with a large home and excellent referral potential.",
          status: 'pending',
          requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          exceedsThreshold: true,
          exceedsBudget: false,
          customerInfo: {
            serviceType: "deep_clean_blue",
            squareFootage: "2800",
          }
        },
        {
          id: "DA-002", 
          salesRepId: "sr-002",
          salesRepName: "Mike Chen",
          customerName: "Rodriguez Enterprise",
          discountAmount: 120,
          discountPercentage: 15,
          basePrice: 800,
          finalPrice: 680,
          justification: "Commercial account with potential for 5 recurring locations. Initial discount to secure contract.",
          status: 'pending',
          requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          exceedsThreshold: false,
          exceedsBudget: true,
          customerInfo: {
            serviceType: "office",
            squareFootage: "5000",
          }
        }
      ];
      setApprovals(mockApprovals);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalDecision = async (approvalId: string, decision: 'approved' | 'rejected') => {
    setIsProcessing(true);
    try {
      await salesApi.approveDiscount(approvalId, decision, managerNotes.trim() || undefined);
      await loadApprovals(); // Refresh list
      setIsDetailOpen(false);
      setSelectedApproval(null);
      setManagerNotes("");
    } catch (error: any) {
      console.error("Failed to process approval:", error);
      
      // Handle authentication errors specifically
      if (error?.response?.status === 401 || error?.message?.includes('jwt expired')) {
        console.error("Session expired - user needs to refresh");
        // TODO: Replace with proper toast notification
      } else {
        console.error("Failed to process approval:", error);
        // TODO: Replace with proper toast notification
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getReasonBadges = (approval: DiscountApproval) => {
    const badges = [];
    if (approval.exceedsThreshold) {
      badges.push(
        <Badge key="threshold" variant="destructive" className="text-xs">
          Exceeds Threshold
        </Badge>
      );
    }
    if (approval.exceedsBudget) {
      badges.push(
        <Badge key="budget" variant="outline" className="text-xs border-orange-400 text-orange-600">
          Budget Exceeded
        </Badge>
      );
    }
    return badges;
  };

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discount Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve discount requests from your sales team
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="px-3 py-1">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${approvals.reduce((sum, a) => sum + a.discountAmount, 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvals.length > 0 
                ? Math.round((approvals.filter(a => a.status === 'approved').length / approvals.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Of all requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status} 
            {status === 'pending' && pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {pendingCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading approvals...
                  </TableCell>
                </TableRow>
              ) : approvals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No discount requests found.
                  </TableCell>
                </TableRow>
              ) : (
                approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{approval.salesRepName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{approval.customerName || "New Customer"}</div>
                        {approval.customerInfo && (
                          <div className="text-sm text-muted-foreground">
                            {approval.customerInfo.squareFootage} sq ft, {approval.customerInfo.serviceType?.replace(/_/g, " ")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Percent className="mr-1 h-4 w-4" />
                        <span className="font-medium">{approval.discountPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${approval.discountAmount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          ${approval.basePrice.toFixed(2)} → ${approval.finalPrice.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getReasonBadges(approval)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(approval.status)}`}
                        />
                        <span className="capitalize">{approval.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(approval.requestedAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setIsDetailOpen(true);
                          setManagerNotes(approval.managerNotes || "");
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
              Review Discount Request - {selectedApproval?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-6">
              {/* Request Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sales Representative</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{selectedApproval.salesRepName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Requested {formatDistanceToNow(new Date(selectedApproval.requestedAt), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Discount Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span className="font-medium">${selectedApproval.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span className="font-medium">{selectedApproval.discountPercentage}% (${selectedApproval.discountAmount.toFixed(2)})</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Final Price:</span>
                        <span className="font-medium">${selectedApproval.finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Information */}
              {(selectedApproval.customerName || selectedApproval.customerInfo) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedApproval.customerName && (
                        <div>
                          <span className="text-muted-foreground">Customer:</span>
                          <div className="font-medium">{selectedApproval.customerName}</div>
                        </div>
                      )}
                      {selectedApproval.customerInfo?.serviceType && (
                        <div>
                          <span className="text-muted-foreground">Service:</span>
                          <div className="font-medium capitalize">{selectedApproval.customerInfo.serviceType.replace(/_/g, " ")}</div>
                        </div>
                      )}
                      {selectedApproval.customerInfo?.squareFootage && (
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <div className="font-medium">{selectedApproval.customerInfo.squareFootage} sq ft</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Approval Reasons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Approval Required Because</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedApproval.exceedsThreshold && (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>Discount exceeds {selectedApproval.discountPercentage > 20 ? "20%" : "$50"} threshold</span>
                      </div>
                    )}
                    {selectedApproval.exceedsBudget && (
                      <div className="flex items-center text-orange-600">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>Would exceed sales rep's monthly discount budget</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Justification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sales Rep Justification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {selectedApproval.justification}
                  </div>
                </CardContent>
              </Card>

              {/* Manager Notes */}
              {selectedApproval.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor="managerNotes">Manager Notes (Optional)</Label>
                  <Textarea
                    id="managerNotes"
                    placeholder="Add notes about your decision..."
                    value={managerNotes}
                    onChange={(e) => setManagerNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Existing Manager Notes */}
              {selectedApproval.managerNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Manager Decision Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      {selectedApproval.managerNotes}
                    </div>
                    {selectedApproval.approvedBy && selectedApproval.approvedAt && (
                      <div className="text-xs text-muted-foreground mt-2">
                        By {selectedApproval.approvedBy} • {formatDistanceToNow(new Date(selectedApproval.approvedAt), { addSuffix: true })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {selectedApproval.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleApprovalDecision(selectedApproval.id, 'rejected')}
                    disabled={isProcessing}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprovalDecision(selectedApproval.id, 'approved')}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}