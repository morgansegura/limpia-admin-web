"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Award,
  Plus,
  Eye
} from 'lucide-react';

interface SalesGoal {
  id: string;
  period: string;
  revenueGoal: number;
  estimateGoal: number;
  conversionGoal: number;
  customerGoal: number;
  currentRevenue: number;
  currentEstimates: number;
  currentCustomers: number;
  currentConversion: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isAchieved: boolean;
}

interface CommissionData {
  currentMonth: {
    totalCommission: number;
    estimatesCreated: number;
    conversionRate: number;
    averageCommission: number;
  };
  lastMonth: {
    totalCommission: number;
    estimatesCreated: number;
  };
  totalEarnings: number;
  potentialEarnings: number;
}

interface SalesDashboardProps {
  userRole: UserRole.SALES_REP | UserRole.SALES_MANAGER;
}

export function SalesDashboard({ userRole }: SalesDashboardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [salesGoals, setSalesGoals] = useState<SalesGoal[]>([]);
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === UserRole.SALES_REP || userRole === UserRole.SALES_MANAGER) {
      fetchSalesData();
    }
  }, [userRole]);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const [goalsResponse, commissionResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/goals`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/commission-summary`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setSalesGoals(goalsData);
      }

      if (commissionResponse.ok) {
        const commissionData = await commissionResponse.json();
        setCommissionData(commissionData);
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentGoal = salesGoals.find(goal => goal.isActive);

  // Navigation functions
  const handleNewEstimate = () => {
    router.push('/sales');
  };

  const handleViewLeads = () => {
    router.push('/customers?filter=leads');
  };

  const handleManageLeads = () => {
    router.push('/customers?filter=leads');
  };

  const handleScheduleFollowUp = () => {
    router.push('/customers?action=schedule-followup');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {userRole === UserRole.SALES_MANAGER ? 'Sales Management' : 'Sales Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {userRole === UserRole.SALES_MANAGER 
              ? 'Monitor your team performance and commission tracking'
              : 'Track your sales performance and commission earnings'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewEstimate}>
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
          <Button variant="outline" onClick={handleViewLeads}>
            <Eye className="h-4 w-4 mr-2" />
            View Leads
          </Button>
        </div>
      </div>

      {/* Commission Overview */}
      {commissionData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${commissionData.currentMonth.totalCommission.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {commissionData.currentMonth.estimatesCreated} estimates created
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {commissionData.currentMonth.conversionRate}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: {currentGoal?.conversionGoal || 30}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Avg Commission</p>
                  <p className="text-2xl font-bold">
                    ${commissionData.currentMonth.averageCommission.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Per estimate</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    ${commissionData.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Goals */}
      {currentGoal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {currentGoal.period.charAt(0).toUpperCase() + currentGoal.period.slice(1)} Goals
              <Badge variant={currentGoal.isAchieved ? 'default' : 'secondary'}>
                {currentGoal.isAchieved ? 'Achieved' : 'In Progress'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Revenue Goal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Revenue</span>
                  <span className="text-sm text-gray-500">
                    ${currentGoal.currentRevenue.toLocaleString()} / ${currentGoal.revenueGoal?.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(currentGoal.currentRevenue / (currentGoal.revenueGoal || 1)) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {Math.round((currentGoal.currentRevenue / (currentGoal.revenueGoal || 1)) * 100)}% complete
                </p>
              </div>

              {/* Estimates Goal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimates</span>
                  <span className="text-sm text-gray-500">
                    {currentGoal.currentEstimates} / {currentGoal.estimateGoal}
                  </span>
                </div>
                <Progress 
                  value={(currentGoal.currentEstimates / (currentGoal.estimateGoal || 1)) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {Math.round((currentGoal.currentEstimates / (currentGoal.estimateGoal || 1)) * 100)}% complete
                </p>
              </div>

              {/* Customers Goal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Customers</span>
                  <span className="text-sm text-gray-500">
                    {currentGoal.currentCustomers} / {currentGoal.customerGoal}
                  </span>
                </div>
                <Progress 
                  value={(currentGoal.currentCustomers / (currentGoal.customerGoal || 1)) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {Math.round((currentGoal.currentCustomers / (currentGoal.customerGoal || 1)) * 100)}% complete
                </p>
              </div>

              {/* Conversion Goal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-sm text-gray-500">
                    {currentGoal.currentConversion}% / {currentGoal.conversionGoal}%
                  </span>
                </div>
                <Progress 
                  value={(currentGoal.currentConversion / (currentGoal.conversionGoal || 1)) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {Math.round((currentGoal.currentConversion / (currentGoal.conversionGoal || 1)) * 100)}% of target
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleNewEstimate}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Create New Estimate</h3>
                <p className="text-sm text-gray-500">Generate a quote for a prospect</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleManageLeads}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Leads</h3>
                <p className="text-sm text-gray-500">Follow up with prospects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleScheduleFollowUp}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Schedule Follow-up</h3>
                <p className="text-sm text-gray-500">Set reminder for next contact</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}