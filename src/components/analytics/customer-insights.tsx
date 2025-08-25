"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, DollarSign, Repeat, TrendingUp } from "lucide-react";

interface CustomerInsightsProps {
  dateRange: string;
}

const customerSegments = [
  { segment: "New", count: 45, percentage: 32, color: "#22c55e" },
  { segment: "Regular", count: 68, percentage: 48, color: "#3b82f6" },
  { segment: "VIP", count: 28, percentage: 20, color: "#f59e0b" },
];

const retentionData = [
  { month: "Jan", newCustomers: 12, retained: 89, churnRate: 8 },
  { month: "Feb", newCustomers: 15, retained: 92, churnRate: 6 },
  { month: "Mar", newCustomers: 18, retained: 88, churnRate: 9 },
  { month: "Apr", newCustomers: 14, retained: 94, churnRate: 5 },
  { month: "May", newCustomers: 20, retained: 91, churnRate: 7 },
  { month: "Jun", newCustomers: 16, retained: 95, churnRate: 4 },
];

const topCustomers = [
  {
    name: "Maria Rodriguez",
    bookings: 24,
    totalSpent: 6800,
    avgBookingValue: 283,
    lastBooking: "2 days ago",
    status: "VIP",
  },
  {
    name: "Robert Kim",
    bookings: 18,
    totalSpent: 5400,
    avgBookingValue: 300,
    lastBooking: "1 week ago",
    status: "Regular",
  },
  {
    name: "Sofia Martinez",
    bookings: 15,
    totalSpent: 4200,
    avgBookingValue: 280,
    lastBooking: "3 days ago",
    status: "Regular",
  },
  {
    name: "James Wilson",
    bookings: 21,
    totalSpent: 7350,
    avgBookingValue: 350,
    lastBooking: "5 days ago",
    status: "VIP",
  },
];

const satisfactionData = [
  { rating: "5 Stars", count: 124, percentage: 68 },
  { rating: "4 Stars", count: 43, percentage: 24 },
  { rating: "3 Stars", count: 12, percentage: 7 },
  { rating: "2 Stars", count: 2, percentage: 1 },
  { rating: "1 Star", count: 0, percentage: 0 },
];

export function CustomerInsights({ dateRange }: CustomerInsightsProps) {
  return (
    <div className="space-y-6">
      {/* Customer KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
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
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,845</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +12.3%
              </Badge>
              <span>lifetime value</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +3.1%
              </Badge>
              <span>customer retention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                92%
              </Badge>
              <span>4+ star ratings</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegments}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                >
                  {customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Retention Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="retained"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Retention %"
                />
                <Line
                  type="monotone"
                  dataKey="newCustomers"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="New Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers by Value</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customer) => (
                  <TableRow key={customer.name}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Last: {customer.lastBooking}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.bookings}</TableCell>
                    <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.status === "VIP" ? "default" : "secondary"}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Satisfaction Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {satisfactionData.map((rating) => (
                <div key={rating.rating} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{rating.rating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < parseInt(rating.rating[0]) 
                              ? "text-yellow-500" 
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${rating.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12">
                      {rating.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}