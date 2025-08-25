"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Users,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  MessageSquare,
  Navigation,
  Zap,
  Calendar,
  DollarSign,
  Settings,
  Search,
  Filter,
  Send,
  Eye,
  RotateCcw,
  PlayCircle,
  PauseCircle,
  Flag,
  User,
  Truck,
  Route,
  Timer,
  Star,
  Award,
  Edit,
  Save,
  X,
} from "lucide-react";
import { format, addHours, differenceInMinutes } from "date-fns";
import { api, crewsApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface CrewMember {
  id: string;
  name: string;
  role: "lead" | "cleaner" | "trainee";
  status: "available" | "assigned" | "on_job" | "break" | "off_duty";
  phone: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
    lastUpdate: Date;
  };
  skills: string[];
  rating: number;
  completedJobs: number;
  currentJob?: string;
  estimatedAvailable?: Date;
  certifications: string[];
}

interface Job {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  serviceType: string;
  scheduledTime: Date;
  estimatedDuration: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  assignedCrew?: string[];
  specialRequirements?: string[];
  accessInstructions?: string;
  estimatedValue: number;
  notes?: string;
  createdAt: Date;
  coordinates: {
    lat: number;
    lng: number;
  };
  supplies?: string[];
  customerRating?: number;
}

interface DispatchSettings {
  autoAssignEnabled: boolean;
  considerDistance: boolean;
  considerRating: boolean;
  considerWorkload: boolean;
  maxDistance: number;
  minRating: number;
  enableNotifications: boolean;
  refreshInterval: number;
}

// Mock data fallback
const mockCrewMembers: CrewMember[] = [
  {
    id: "crew-1",
    name: "Maria Santos",
    role: "lead",
    status: "available",
    phone: "+1 (305) 555-0101",
    location: {
      lat: 25.7617,
      lng: -80.1918,
      address: "Downtown Miami",
      lastUpdate: new Date(2024, 7, 16, 10, 30),
    },
    skills: ["deep_clean", "carpet_cleaning", "window_cleaning"],
    rating: 4.8,
    completedJobs: 234,
    certifications: ["Green Cleaning", "Safety Certified"],
  },
  {
    id: "crew-2",
    name: "Carlos Rodriguez",
    role: "cleaner",
    status: "available",
    phone: "+1 (305) 555-0102",
    location: {
      lat: 25.7907,
      lng: -80.13,
      address: "Brickell",
      lastUpdate: new Date(2024, 7, 16, 11, 45),
    },
    skills: ["regular_clean", "office_cleaning"],
    rating: 4.6,
    completedJobs: 187,
    certifications: ["Basic Cleaning"],
  },
];

const mockJobs: Job[] = [
  {
    id: "job-1",
    customerName: "Sofia Martinez",
    customerPhone: "+1 (305) 555-1001",
    address: "1200 Brickell Ave, Miami, FL 33131",
    serviceType: "Deep Clean",
    scheduledTime: new Date(2024, 7, 16, 14, 0),
    estimatedDuration: 180,
    priority: "high",
    status: "pending",
    assignedCrew: [],
    specialRequirements: ["Pet-friendly products", "Key pickup required"],
    accessInstructions: "Front desk has keys, mention Limpia",
    estimatedValue: 350,
    notes: "First-time customer, high-value client",
    createdAt: new Date(2024, 7, 16, 8, 30),
    coordinates: { lat: 25.7617, lng: -80.1918 },
    supplies: ["vacuum", "steam_cleaner", "eco_products"],
    customerRating: 5,
  },
  {
    id: "job-2",
    customerName: "Robert Kim",
    customerPhone: "+1 (305) 555-1002",
    address: "500 Biscayne Blvd, Miami, FL 33132",
    serviceType: "Regular Clean",
    scheduledTime: new Date(2024, 7, 16, 12, 0),
    estimatedDuration: 120,
    priority: "medium",
    status: "pending",
    assignedCrew: [],
    estimatedValue: 180,
    createdAt: new Date(2024, 7, 15, 16, 0),
    coordinates: { lat: 25.7907, lng: -80.13 },
    supplies: ["standard_kit"],
  },
];

export function EnhancedJobDispatch() {
  const { user } = useAuth();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [isCrewDetailOpen, setIsCrewDetailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [settings, setSettings] = useState<DispatchSettings>({
    autoAssignEnabled: false,
    considerDistance: true,
    considerRating: true,
    considerWorkload: true,
    maxDistance: 10,
    minRating: 4.0,
    enableNotifications: true,
    refreshInterval: 30,
  });

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    if (filterStatus !== "all") {
      filtered = filtered.filter((job) => job.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((job) => job.priority === filterPriority);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.serviceType.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [jobs, filterStatus, filterPriority, searchTerm]);

  // Calculate dispatch statistics
  const dispatchStats = useMemo(() => {
    const totalJobs = jobs.length;
    const pendingJobs = jobs.filter((j) => j.status === "pending").length;
    const assignedJobs = jobs.filter((j) => j.status === "assigned").length;
    const inProgressJobs = jobs.filter(
      (j) => j.status === "in_progress",
    ).length;

    const availableCrew = crewMembers.filter(
      (c) => c.status === "available",
    ).length;
    const activeCrew = crewMembers.filter((c) =>
      ["assigned", "on_job"].includes(c.status),
    ).length;

    const urgentJobs = jobs.filter(
      (j) => j.priority === "urgent" && j.status === "pending",
    ).length;
    const overdueJobs = jobs.filter(
      (j) => j.status === "pending" && new Date() > j.scheduledTime,
    ).length;

    return {
      totalJobs,
      pendingJobs,
      assignedJobs,
      inProgressJobs,
      availableCrew,
      activeCrew,
      urgentJobs,
      overdueJobs,
    };
  }, [jobs, crewMembers]);

  const loadJobs = async () => {
    try {
      const response = await api.get("/jobs");
      const transformedJobs = response.data.map((job: any) => ({
        id: job.id,
        customerName:
          `${job.booking?.customer?.firstName || ""} ${
            job.booking?.customer?.lastName || ""
          }`.trim() || "Unknown Customer",
        customerPhone: job.booking?.customer?.phone || "",
        address: job.booking?.address || "",
        serviceType: job.booking?.services?.[0]?.name || "Service",
        scheduledTime: new Date(job.booking?.scheduledDate || new Date()),
        estimatedDuration: job.estimatedDuration || 120,
        priority: job.priority || "medium",
        status: job.status,
        assignedCrew: job.crewAssignments?.map((ca: any) => ca.crewId) || [],
        estimatedValue: job.booking?.totalAmount || 0,
        notes: job.notes || "",
        createdAt: new Date(job.createdAt),
        coordinates: {
          lat: 25.7617 + (Math.random() - 0.5) * 0.1,
          lng: -80.1918 + (Math.random() - 0.5) * 0.1,
        },
        specialRequirements: job.specialRequirements || [],
        accessInstructions: job.accessInstructions,
        supplies: job.requiredSupplies || [],
        customerRating: job.booking?.customer?.rating,
      }));
      setJobs(transformedJobs);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      setJobs(mockJobs);
    }
  };

  const loadCrews = async () => {
    try {
      const response = await api.get("/crews");
      const transformedCrews = response.data.map((crew: any) => ({
        id: crew.id,
        name: crew.name,
        role: "lead" as const,
        status: crew.status || "available",
        phone: crew.contactInfo?.phone || "",
        location: {
          lat: 25.7617 + (Math.random() - 0.5) * 0.1,
          lng: -80.1918 + (Math.random() - 0.5) * 0.1,
          address: "Miami Area",
          lastUpdate: new Date(),
        },
        skills: crew.specializations || ["general_cleaning"],
        rating: crew.averageRating || 4.5,
        completedJobs: crew.completedJobs || 0,
        certifications: crew.certifications || [],
        currentJob: crew.activeJobId,
      }));
      setCrewMembers(transformedCrews);
    } catch (error) {
      console.error("Failed to load crews:", error);
      setCrewMembers(mockCrewMembers);
    }
  };

  const handleAssignJob = async (jobId: string, crewIds: string[]) => {
    if (!crewIds.length) return;

    setAssigning(true);
    try {
      await crewsApi.assignJobToCrew({
        jobId,
        crewId: crewIds[0],
        assignedBy: user?.id || "",
        estimatedDuration: selectedJob?.estimatedDuration || 120,
        notes: "",
      });

      await Promise.all([loadJobs(), loadCrews()]);
      setIsAssignDialogOpen(false);
    } catch (error) {
      console.error("Failed to assign job:", error);
      alert("Failed to assign job. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: string) => {
    try {
      await api.put(`/jobs/${jobId}/status`, { status });
      await loadJobs();
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const handleAutoAssign = async () => {
    const pendingJobs = jobs.filter((job) => job.status === "pending");
    const availableCrews = crewMembers.filter(
      (crew) => crew.status === "available",
    );

    if (!pendingJobs.length || !availableCrews.length) {
      alert("No pending jobs or available crews for auto-assignment");
      return;
    }

    setAssigning(true);
    try {
      for (const job of pendingJobs.slice(0, availableCrews.length)) {
        let bestCrew: CrewMember | null = null;

        if (settings.considerRating) {
          bestCrew = availableCrews
            .filter(
              (crew) => !crew.currentJob && crew.rating >= settings.minRating,
            )
            .sort((a, b) => b.rating - a.rating)[0];
        } else {
          bestCrew = availableCrews.filter((crew) => !crew.currentJob)[0];
        }

        if (bestCrew) {
          await crewsApi.assignJobToCrew({
            jobId: job.id,
            crewId: bestCrew.id,
            assignedBy: user?.id || "",
            estimatedDuration: job.estimatedDuration,
            notes: "Auto-assigned based on configured criteria",
          });

          bestCrew.currentJob = job.id;
        }
      }

      await Promise.all([loadJobs(), loadCrews()]);
      alert(
        `Successfully auto-assigned ${Math.min(
          pendingJobs.length,
          availableCrews.length,
        )} jobs`,
      );
    } catch (error) {
      console.error("Auto-assignment failed:", error);
      alert("Auto-assignment failed. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const handleContactCrew = (crewId: string, method: "call" | "message") => {
    const crew = crewMembers.find((c) => c.id === crewId);
    if (crew) {
      if (method === "call") {
        window.open(`tel:${crew.phone}`);
      } else {
        window.open(`sms:${crew.phone}`);
      }
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([loadJobs(), loadCrews()]);
      setLoading(false);
    };

    initializeData();

    // Set up auto-refresh if enabled
    let interval: NodeJS.Timeout | null = null;
    if (settings.enableNotifications && settings.refreshInterval > 0) {
      interval = setInterval(() => {
        Promise.all([loadJobs(), loadCrews()]);
      }, settings.refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [settings.enableNotifications, settings.refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "assigned":
        return "bg-blue-500";
      case "in_progress":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCrewStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "assigned":
        return "bg-blue-500";
      case "on_job":
        return "bg-orange-500";
      case "break":
        return "bg-yellow-500";
      case "off_duty":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dispatch data...</p>
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
            Enhanced Job Dispatch
          </h1>
          <p className="text-muted-foreground">
            Real-time job assignment and crew management with advanced features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="mr-1 h-4 w-4" />
            Settings
          </Button>
          <Button
            onClick={handleAutoAssign}
            disabled={assigning || !settings.autoAssignEnabled}
          >
            <Zap className="mr-1 h-4 w-4" />
            {assigning ? "Assigning..." : "Auto-Assign"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dispatchStats.pendingJobs}
            </div>
            <p className="text-xs text-muted-foreground">
              {dispatchStats.urgentJobs} urgent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Crew
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dispatchStats.availableCrew}
            </div>
            <p className="text-xs text-muted-foreground">
              {dispatchStats.activeCrew} working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dispatchStats.inProgressJobs}
            </div>
            <p className="text-xs text-muted-foreground">
              {dispatchStats.assignedJobs} assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dispatchStats.overdueJobs}
            </div>
            <p className="text-xs text-muted-foreground">overdue jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="crew">Crew</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Urgent Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobs
                  .filter(
                    (j) => j.priority === "urgent" && j.status === "pending",
                  )
                  .slice(0, 3)
                  .map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 p-2 border rounded border-red-200"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {job.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {job.serviceType} •{" "}
                          {format(job.scheduledTime, "HH:mm")}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsAssignDialogOpen(true);
                        }}
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Crew</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {crewMembers
                  .filter((c) => c.status === "available")
                  .slice(0, 3)
                  .map((crew) => (
                    <div
                      key={crew.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${getCrewStatusColor(
                          crew.status,
                        )}`}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{crew.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {crew.role} • {crew.location?.address}
                        </div>
                      </div>
                      <Badge variant="outline">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {crew.rating}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs..."
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
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {job.customerName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getPriorityColor(
                          job.priority,
                        )} text-white`}
                      >
                        {job.priority}
                      </Badge>
                      <Badge
                        className={`${getStatusColor(job.status)} text-white`}
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{job.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{format(job.scheduledTime, "MMM dd, HH:mm")}</span>
                      <span className="text-muted-foreground">
                        ({job.estimatedDuration}min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>${job.estimatedValue}</span>
                      <span className="text-muted-foreground">
                        • {job.serviceType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.status === "pending" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsAssignDialogOpen(true);
                        }}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Assign
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleContactCrew(job.assignedCrew?.[0] || "", "call")
                        }
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Contact
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crew" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {crewMembers.map((crew) => (
              <Card
                key={crew.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium">
                        {crew.name}
                      </CardTitle>
                    </div>
                    <Badge
                      className={`${getCrewStatusColor(
                        crew.status,
                      )} text-white`}
                    >
                      {crew.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Rating</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{crew.rating}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Jobs Done</div>
                      <div className="font-bold">{crew.completedJobs}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContactCrew(crew.id, "call")}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContactCrew(crew.id, "message")}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dispatch Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Auto-Assignment</h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-assign">Enable Auto-Assignment</Label>
                <Switch
                  id="auto-assign"
                  checked={settings.autoAssignEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoAssignEnabled: checked,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-distance">Max Distance (miles)</Label>
                  <Input
                    id="max-distance"
                    type="number"
                    value={settings.maxDistance}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        maxDistance: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="min-rating">Minimum Rating</Label>
                  <Input
                    id="min-rating"
                    type="number"
                    step="0.1"
                    value={settings.minRating}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        minRating: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="consider-distance">Consider Distance</Label>
                  <Switch
                    id="consider-distance"
                    checked={settings.considerDistance}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        considerDistance: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="consider-rating">Consider Rating</Label>
                  <Switch
                    id="consider-rating"
                    checked={settings.considerRating}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        considerRating: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="consider-workload">Consider Workload</Label>
                  <Switch
                    id="consider-workload"
                    checked={settings.considerWorkload}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        considerWorkload: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notifications</h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-notifications">
                  Enable Real-time Updates
                </Label>
                <Switch
                  id="enable-notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      enableNotifications: checked,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="refresh-interval">
                  Refresh Interval (seconds)
                </Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      refreshInterval: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={() => setIsSettingsOpen(false)}>
                <Save className="mr-1 h-4 w-4" />
                Save Settings
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSettingsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Job to Crew</DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded">
                <h3 className="font-semibold">{selectedJob.customerName}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedJob.serviceType}
                </p>
                <p className="text-sm">{selectedJob.address}</p>
                <p className="text-sm">
                  {format(selectedJob.scheduledTime, "PPp")}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Available Crew Members
                </Label>
                <div className="mt-2 space-y-2">
                  {crewMembers
                    .filter((c) => c.status === "available")
                    .map((crew) => (
                      <div
                        key={crew.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{crew.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {crew.role} • {crew.location?.address}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {crew.rating}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAssignJob(selectedJob.id, [crew.id])
                            }
                            disabled={assigning}
                          >
                            {assigning ? "Assigning..." : "Select"}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
