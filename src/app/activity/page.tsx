"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format, subDays, isAfter, isBefore } from "date-fns";
import {
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  User,
  Search,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity as ActivityIcon,
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: Date;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
  category: "jobs" | "estimates" | "customers" | "inventory" | "crew" | "system";
  userId?: string;
  userName?: string;
  relatedId?: string;
  priority: "low" | "medium" | "high";
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "job_completed":
      return { icon: CheckCircle, color: "text-green-500" };
    case "estimate_sent":
      return { icon: DollarSign, color: "text-blue-500" };
    case "crew_assigned":
      return { icon: User, color: "text-purple-500" };
    case "job_started":
      return { icon: Clock, color: "text-orange-500" };
    case "inventory_alert":
      return { icon: AlertCircle, color: "text-red-500" };
    case "new_customer":
      return { icon: User, color: "text-green-500" };
    case "payment_received":
      return { icon: DollarSign, color: "text-green-500" };
    case "schedule_updated":
      return { icon: Calendar, color: "text-blue-500" };
    case "system_notification":
      return { icon: ActivityIcon, color: "text-gray-500" };
    default:
      return { icon: Clock, color: "text-gray-500" };
  }
};

const getActivityBadge = (type: string) => {
  switch (type) {
    case "job_completed":
      return { badge: "Completed", variant: "default" as const };
    case "estimate_sent":
      return { badge: "Estimate", variant: "secondary" as const };
    case "crew_assigned":
      return { badge: "Assignment", variant: "outline" as const };
    case "job_started":
      return { badge: "Started", variant: "secondary" as const };
    case "inventory_alert":
      return { badge: "Alert", variant: "destructive" as const };
    case "new_customer":
      return { badge: "New Customer", variant: "default" as const };
    case "payment_received":
      return { badge: "Payment", variant: "default" as const };
    case "schedule_updated":
      return { badge: "Schedule", variant: "outline" as const };
    case "system_notification":
      return { badge: "System", variant: "secondary" as const };
    default:
      return { badge: "Activity", variant: "outline" as const };
  }
};

// Generate comprehensive mock data for activities
const generateMockActivities = (): Activity[] => {
  const activities: Activity[] = [];
  const types = [
    "job_completed",
    "estimate_sent", 
    "crew_assigned",
    "job_started",
    "inventory_alert",
    "new_customer",
    "payment_received",
    "schedule_updated",
    "system_notification"
  ];
  
  const customers = ["Jennifer Wilson", "Michael Chen", "Sarah Davis", "Robert Kim", "Lisa Rodriguez"];
  const crews = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta"];
  
  for (let i = 0; i < 150; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const crew = crews[Math.floor(Math.random() * crews.length)];
    const date = subDays(new Date(), Math.floor(Math.random() * 30));
    
    let title = "";
    let description = "";
    let category: Activity["category"] = "system";
    let priority: Activity["priority"] = "medium";
    
    switch (type) {
      case "job_completed":
        title = `Job completed for ${customer}`;
        description = `Regular cleaning service completed by ${crew}`;
        category = "jobs";
        priority = "low";
        break;
      case "estimate_sent":
        title = `Estimate sent to ${customer}`;
        description = `$${Math.floor(Math.random() * 500 + 200)} estimate for deep cleaning`;
        category = "estimates";
        priority = "medium";
        break;
      case "crew_assigned":
        title = `${crew} assigned to job`;
        description = `Scheduled for ${customer}'s property`;
        category = "crew";
        priority = "medium";
        break;
      case "job_started":
        title = `${crew} started job`;
        description = `Cleaning service began at ${customer}'s location`;
        category = "jobs";
        priority = "low";
        break;
      case "inventory_alert":
        title = "Low inventory alert";
        description = `All-purpose cleaner running low (${Math.floor(Math.random() * 10 + 1)} units left)`;
        category = "inventory";
        priority = "high";
        break;
      case "new_customer":
        title = `New customer registered`;
        description = `${customer} signed up for cleaning services`;
        category = "customers";
        priority = "medium";
        break;
      case "payment_received":
        title = `Payment received from ${customer}`;
        description = `$${Math.floor(Math.random() * 300 + 150)} payment processed`;
        category = "estimates";
        priority = "low";
        break;
      case "schedule_updated":
        title = "Schedule updated";
        description = `${customer}'s appointment rescheduled`;
        category = "jobs";
        priority = "low";
        break;
      case "system_notification":
        title = "System maintenance";
        description = "Automated backup completed successfully";
        category = "system";
        priority = "low";
        break;
    }
    
    const iconData = getActivityIcon(type);
    const badgeData = getActivityBadge(type);
    
    activities.push({
      id: `activity-${i + 1}`,
      type,
      title,
      description,
      time: date,
      icon: iconData.icon,
      iconColor: iconData.color,
      badge: badgeData.badge,
      badgeVariant: badgeData.variant,
      category,
      priority,
      userName: Math.random() > 0.5 ? customer : undefined,
      relatedId: `rel-${Math.floor(Math.random() * 1000)}`
    });
  }
  
  return activities.sort((a, b) => b.time.getTime() - a.time.getTime());
};

export default function ActivityPage() {
  const { toast } = useToast();
  const [activities] = useState<Activity[]>(generateMockActivities());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((activity) => activity.category === filterCategory);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((activity) => activity.priority === filterPriority);
    }

    // Time range filter
    if (filterTimeRange !== "all") {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (filterTimeRange) {
        case "today":
          cutoffDate = subDays(now, 1);
          break;
        case "week":
          cutoffDate = subDays(now, 7);
          break;
        case "month":
          cutoffDate = subDays(now, 30);
          break;
        default:
          cutoffDate = subDays(now, 365);
      }
      
      filtered = filtered.filter((activity) => isAfter(activity.time, cutoffDate));
    }

    // Tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((activity) => activity.category === activeTab);
    }

    return filtered;
  }, [activities, searchTerm, filterCategory, filterPriority, filterTimeRange, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Activity stats
  const activityStats = useMemo(() => {
    const today = subDays(new Date(), 1);
    const thisWeek = subDays(new Date(), 7);
    
    const todayCount = activities.filter(a => isAfter(a.time, today)).length;
    const weekCount = activities.filter(a => isAfter(a.time, thisWeek)).length;
    const highPriorityCount = activities.filter(a => a.priority === "high").length;
    const totalCount = activities.length;

    return {
      todayCount,
      weekCount,
      highPriorityCount,
      totalCount
    };
  }, [activities]);

  const handleExportActivities = useCallback(async () => {
    try {
      const csvData = [
        [
          "Date",
          "Time",
          "Title",
          "Description",
          "Category",
          "Priority", 
          "Type",
          "User"
        ],
        ...filteredActivities.map(activity => [
          format(activity.time, "yyyy-MM-dd"),
          format(activity.time, "HH:mm:ss"),
          activity.title,
          activity.description,
          activity.category,
          activity.priority,
          activity.type,
          activity.userName || "System"
        ])
      ];

      const csvContent = csvData.map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `${filteredActivities.length} activities exported successfully`,
      });
    } catch (error) {
      console.error("Error exporting activities:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export activity log. Please try again.",
        variant: "destructive",
      });
    }
  }, [filteredActivities, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            Track all system activities and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportActivities}>
            <Download className="mr-1 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-1 h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.todayCount}</div>
            <p className="text-xs text-muted-foreground">activities today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.weekCount}</div>
            <p className="text-xs text-muted-foreground">activities this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.totalCount}</div>
            <p className="text-xs text-muted-foreground">all activities</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="jobs">Jobs</SelectItem>
                <SelectItem value="estimates">Estimates</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="crew">Crew</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="crew">Crew</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Activity List */}
          <div className="space-y-3">
            {paginatedActivities.map((activity) => {
              const IconComponent = activity.icon;
              
              return (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full bg-gray-100 ${activity.iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={activity.badgeVariant}>{activity.badge}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(activity.time, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Category: {activity.category}</span>
                          <span>Priority: {activity.priority}</span>
                          {activity.userName && <span>User: {activity.userName}</span>}
                          <span>{format(activity.time, "MMM dd, yyyy HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of{" "}
                {filteredActivities.length} activities
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}