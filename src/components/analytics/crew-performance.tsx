"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
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
import { Clock, Users, CheckCircle, Star } from "lucide-react";

interface CrewPerformanceProps {
  dateRange: string;
}

const crewMetrics = [
  {
    name: "Alpha Team",
    jobsCompleted: 24,
    efficiency: 94,
    customerRating: 4.8,
    totalHours: 96,
    revenue: 8400,
    onTimeRate: 96,
  },
  {
    name: "Beta Team",
    jobsCompleted: 18,
    efficiency: 89,
    customerRating: 4.7,
    totalHours: 72,
    revenue: 6300,
    onTimeRate: 89,
  },
  {
    name: "Gamma Team",
    jobsCompleted: 21,
    efficiency: 91,
    customerRating: 4.6,
    totalHours: 84,
    revenue: 7350,
    onTimeRate: 95,
  },
];

const efficiencyTrend = [
  { week: "Week 1", alpha: 92, beta: 87, gamma: 89 },
  { week: "Week 2", alpha: 94, beta: 89, gamma: 90 },
  { week: "Week 3", alpha: 93, beta: 88, gamma: 92 },
  { week: "Week 4", alpha: 95, beta: 91, gamma: 91 },
];

const jobCompletionData = [
  { crew: "Alpha", completed: 24, target: 25, percentage: 96 },
  { crew: "Beta", completed: 18, target: 20, percentage: 90 },
  { crew: "Gamma", completed: 21, target: 22, percentage: 95 },
];

export function CrewPerformance({}: CrewPerformanceProps) {
  return (
    <div className="space-y-6">
      {/* Operations KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jobs Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">63</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +12%
              </Badge>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Efficiency
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +3.2%
              </Badge>
              <span>time efficiency</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +0.1
              </Badge>
              <span>average rating</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">252</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">
                +18h
              </Badge>
              <span>total worked</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Trend by Crew</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={efficiencyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="alpha"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Alpha Team"
                />
                <Line
                  type="monotone"
                  dataKey="beta"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Beta Team"
                />
                <Line
                  type="monotone"
                  dataKey="gamma"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Gamma Team"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Completion vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crew" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                <Bar dataKey="target" fill="#e5e7eb" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Crew Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Crew Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crew</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>On-Time Rate</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crewMetrics.map((crew) => (
                <TableRow key={crew.name}>
                  <TableCell className="font-medium">{crew.name}</TableCell>
                  <TableCell>{crew.jobsCompleted}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={crew.efficiency} className="w-16" />
                      <span className="text-sm">{crew.efficiency}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {crew.customerRating}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={crew.onTimeRate >= 95 ? "default" : "secondary"}
                    >
                      {crew.onTimeRate}%
                    </Badge>
                  </TableCell>
                  <TableCell>{crew.totalHours}h</TableCell>
                  <TableCell>${crew.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
