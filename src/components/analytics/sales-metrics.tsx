"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Users, Target } from "lucide-react";

interface SalesMetricsProps {
  dateRange: string;
}

const salesRepData = [
  {
    name: "John Sales",
    estimates: 24,
    accepted: 18,
    revenue: 12500,
    commission: 2250,
    conversionRate: 75,
    avgDealSize: 694,
  },
  {
    name: "Sarah Wilson",
    estimates: 19,
    accepted: 13,
    revenue: 9800,
    commission: 1764,
    conversionRate: 68,
    avgDealSize: 754,
  },
  {
    name: "Mike Johnson",
    estimates: 16,
    accepted: 11,
    revenue: 8200,
    commission: 1476,
    conversionRate: 69,
    avgDealSize: 745,
  },
];

const pipelineData = [
  { month: "Jan", leads: 45, estimates: 38, accepted: 28, revenue: 19500 },
  { month: "Feb", leads: 52, estimates: 44, accepted: 32, revenue: 23200 },
  { month: "Mar", leads: 58, estimates: 49, accepted: 36, revenue: 26800 },
  { month: "Apr", leads: 55, estimates: 46, accepted: 34, revenue: 25100 },
  { month: "May", leads: 63, estimates: 54, accepted: 40, revenue: 29400 },
  { month: "Jun", leads: 71, estimates: 61, accepted: 45, revenue: 33600 },
];

const commissionTierData = [
  { tier: "Excellent (0-5%)", count: 28, percentage: 62, color: "#22c55e" },
  { tier: "Good (5-15%)", count: 12, percentage: 27, color: "#3b82f6" },
  { tier: "Fair (15-25%)", count: 4, percentage: 9, color: "#f59e0b" },
  { tier: "Poor (25%+)", count: 1, percentage: 2, color: "#ef4444" },
];

export function SalesMetrics({ dateRange }: SalesMetricsProps) {
  return (
    <div className="space-y-6">
      {/* Sales KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$127,500</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +18.2%
              </Badge>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">71%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +5.1%
              </Badge>
              <span>above target (65%)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$731</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +8.4%
              </Badge>
              <span>vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,490</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +15.3%
              </Badge>
              <span>team earnings</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Leads"
                />
                <Line
                  type="monotone"
                  dataKey="estimates"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Estimates"
                />
                <Line
                  type="monotone"
                  dataKey="accepted"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Accepted"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={commissionTierData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ tier, percentage }) => `${percentage}%`}
                >
                  {commissionTierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {commissionTierData.map((tier) => (
                <div key={tier.tier} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span>{tier.tier}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Rep Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Rep Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Estimates</TableHead>
                <TableHead>Accepted</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Avg Deal Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesRepData.map((rep) => (
                <TableRow key={rep.name}>
                  <TableCell className="font-medium">{rep.name}</TableCell>
                  <TableCell>{rep.estimates}</TableCell>
                  <TableCell>{rep.accepted}</TableCell>
                  <TableCell>
                    <Badge
                      variant={rep.conversionRate >= 70 ? "default" : "secondary"}
                    >
                      {rep.conversionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>${rep.revenue.toLocaleString()}</TableCell>
                  <TableCell>${rep.commission.toLocaleString()}</TableCell>
                  <TableCell>${rep.avgDealSize}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}