"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, Users, Target, Download } from "lucide-react";
import { SalesMetrics } from "@/components/analytics/sales-metrics";
import { CrewPerformance } from "@/components/analytics/crew-performance";
import { CustomerInsights } from "@/components/analytics/customer-insights";

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 24500, estimates: 45, bookings: 38 },
  { month: "Feb", revenue: 28300, estimates: 52, bookings: 44 },
  { month: "Mar", revenue: 31200, estimates: 58, bookings: 49 },
  { month: "Apr", revenue: 29800, estimates: 55, bookings: 46 },
  { month: "May", revenue: 34500, estimates: 63, bookings: 54 },
  { month: "Jun", revenue: 38200, estimates: 71, bookings: 61 },
];

const serviceTypeData = [
  { name: "Regular Cleaning", value: 45, color: "#0088FE" },
  { name: "Deep Clean", value: 30, color: "#00C49F" },
  { name: "Move In/Out", value: 15, color: "#FFBB28" },
  { name: "Post-Construction", value: 10, color: "#FF8042" },
];

const conversionData = [
  { stage: "Leads", count: 120, percentage: 100 },
  { stage: "Estimates", count: 89, percentage: 74 },
  { stage: "Sent", count: 78, percentage: 65 },
  { stage: "Accepted", count: 45, percentage: 38 },
  { stage: "Booked", count: 42, percentage: 35 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const handleExportAnalytics = useCallback(async () => {
    try {
      // Generate CSV data based on current view
      let csvData = [];
      let filename = "";

      switch (activeTab) {
        case "overview":
          csvData = [
            ["Month", "Revenue", "Estimates", "Bookings"],
            ...revenueData.map((row) => [
              row.month,
              row.revenue,
              row.estimates,
              row.bookings,
            ]),
          ];
          filename = `analytics-overview-${dateRange}`;
          break;
        case "sales":
          csvData = [
            ["Service Type", "Percentage", "Count"],
            ...serviceTypeData.map((row) => [
              row.name,
              row.value,
              Math.floor(row.value * 2.5),
            ]),
          ];
          filename = `sales-analytics-${dateRange}`;
          break;
        case "crew":
          csvData = [
            ["Metric", "Value"],
            ["Time Range", dateRange],
            ["Total Jobs", "156"],
            ["Avg Completion Time", "3.2 hours"],
            ["Customer Rating", "4.8/5"],
          ];
          filename = `crew-performance-${dateRange}`;
          break;
        case "customers":
          csvData = [
            ["Metric", "Value"],
            ["Time Range", dateRange],
            ["Total Customers", "1,247"],
            ["New Customers", "89"],
            ["Retention Rate", "92%"],
            ["Avg Order Value", "$285"],
          ];
          filename = `customer-insights-${dateRange}`;
          break;
        default:
          csvData = [["No data available"]];
          filename = "analytics-export";
      }

      // Convert to CSV string
      const csvContent = csvData.map((row) => row.join(",")).join("\\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Analytics data exported successfully for ${dateRange}`,
      });
    } catch (error) {
      console.error("Error exporting analytics:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeTab, dateRange, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportAnalytics}>
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$186,500</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="default" className="text-xs">
                    +23.1%
                  </Badge>
                  <span>from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">35.2%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="default" className="text-xs">
                    +5.4%
                  </Badge>
                  <span>above target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">324</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="default" className="text-xs">
                    +18
                  </Badge>
                  <span>new this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Job Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$287</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="default" className="text-xs">
                    +12.3%
                  </Badge>
                  <span>vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {serviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <SalesMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <CrewPerformance dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerInsights dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
