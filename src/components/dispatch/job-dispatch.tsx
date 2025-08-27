"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { jobsApi, crewsApi } from "@/lib/api";
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
  Phone,
  MessageSquare,
  Navigation,
  Zap,
  DollarSign,
  Settings,
  Search,
  Send,
  Eye,
  PlayCircle,
  User,
  Star,
  Award,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";

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

interface DispatchNotification {
  id: string;
  type: "assignment" | "update" | "emergency" | "completion";
  message: string;
  jobId: string;
  crewId?: string;
  timestamp: Date;
  isRead: boolean;
  priority: "low" | "medium" | "high";
}

// Mock data
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
    status: "on_job",
    phone: "+1 (305) 555-0102",
    currentJob: "job-2",
    estimatedAvailable: new Date(2024, 7, 16, 14, 0),
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
  {
    id: "crew-3",
    name: "Ana Gutierrez",
    role: "cleaner",
    status: "assigned",
    phone: "+1 (305) 555-0103",
    currentJob: "job-1",
    location: {
      lat: 25.7317,
      lng: -80.2434,
      address: "Coral Gables",
      lastUpdate: new Date(2024, 7, 16, 12, 15),
    },
    skills: ["deep_clean", "move_out_clean"],
    rating: 4.9,
    completedJobs: 156,
    certifications: ["Green Cleaning", "Move-out Specialist"],
  },
  {
    id: "crew-4",
    name: "Roberto Kim",
    role: "trainee",
    status: "available",
    phone: "+1 (305) 555-0104",
    location: {
      lat: 25.8061,
      lng: -80.1201,
      address: "South Beach",
      lastUpdate: new Date(2024, 7, 16, 9, 0),
    },
    skills: ["basic_clean"],
    rating: 4.2,
    completedJobs: 45,
    certifications: ["In Training"],
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
    status: "assigned",
    assignedCrew: ["crew-3"],
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
    status: "in_progress",
    assignedCrew: ["crew-2"],
    estimatedValue: 180,
    createdAt: new Date(2024, 7, 15, 16, 0),
    coordinates: { lat: 25.7907, lng: -80.13 },
    supplies: ["standard_kit"],
  },
  {
    id: "job-3",
    customerName: "Jennifer Wilson",
    customerPhone: "+1 (305) 555-1003",
    address: "850 Miami Ave, Miami, FL 33130",
    serviceType: "Move-out Clean",
    scheduledTime: new Date(2024, 7, 16, 16, 0),
    estimatedDuration: 240,
    priority: "urgent",
    status: "pending",
    specialRequirements: ["Empty apartment", "Deep cleaning required"],
    estimatedValue: 450,
    createdAt: new Date(2024, 7, 16, 10, 0),
    coordinates: { lat: 25.7317, lng: -80.2434 },
    supplies: ["deep_clean_kit", "steam_cleaner"],
  },
  {
    id: "job-4",
    customerName: "David Chen",
    customerPhone: "+1 (305) 555-1004",
    address: "1001 South Beach Blvd, Miami Beach, FL 33139",
    serviceType: "Office Clean",
    scheduledTime: new Date(2024, 7, 16, 18, 0),
    estimatedDuration: 90,
    priority: "low",
    status: "pending",
    estimatedValue: 120,
    createdAt: new Date(2024, 7, 16, 11, 30),
    coordinates: { lat: 25.8061, lng: -80.1201 },
    supplies: ["office_kit"],
  },
];

const mockNotifications: DispatchNotification[] = [
  {
    id: "notif-1",
    type: "assignment",
    message: "Ana Gutierrez assigned to Deep Clean job for Sofia Martinez",
    jobId: "job-1",
    crewId: "crew-3",
    timestamp: new Date(2024, 7, 16, 13, 30),
    isRead: false,
    priority: "medium",
  },
  {
    id: "notif-2",
    type: "update",
    message: "Carlos Rodriguez started job at 500 Biscayne Blvd",
    jobId: "job-2",
    crewId: "crew-2",
    timestamp: new Date(2024, 7, 16, 12, 5),
    isRead: true,
    priority: "low",
  },
  {
    id: "notif-3",
    type: "emergency",
    message: "URGENT: New move-out clean job needs immediate assignment",
    jobId: "job-3",
    timestamp: new Date(2024, 7, 16, 10, 15),
    isRead: false,
    priority: "high",
  },
];

export function JobDispatch() {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<DispatchNotification[]>(
    [],
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [isCrewDetailOpen, setIsCrewDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrewForAssignment, setSelectedCrewForAssignment] = useState<
    string[]
  >([]);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJobEditOpen, setIsJobEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Load data from API
  useEffect(() => {
    loadDispatchData();
  }, []);

  const loadDispatchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [jobsData, crewsData] = await Promise.all([
        jobsApi.getAll(),
        crewsApi.getAll(),
      ]);

      setJobs((jobsData as Job[]) || mockJobs); // Fallback to mock data if API fails
      setCrewMembers((crewsData as CrewMember[]) || mockCrewMembers);

      // Mock notifications for now - would come from a real notifications API
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error loading dispatch data:", error);
      setError("Failed to load dispatch data");
      // Use mock data as fallback
      setJobs(mockJobs);
      setCrewMembers(mockCrewMembers);
      setNotifications(mockNotifications);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "lead":
        return Star;
      case "cleaner":
        return User;
      case "trainee":
        return Award;
      default:
        return User;
    }
  };

  const handleAssignJob = async (jobId: string, crewIds: string[]) => {
    try {
      if (crewIds.length === 0) {
        alert("Please select at least one crew member");
        return;
      }

      const assignmentData = {
        crewIds,
        notes: assignmentNotes,
        estimatedDuration: selectedJob?.estimatedDuration || 120,
        assignedBy: "dispatcher", // Would come from auth context
      };

      await jobsApi.assignJob(jobId, assignmentData);

      // Update local state
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? { ...job, status: "assigned", assignedCrew: crewIds }
            : job,
        ),
      );

      // Update crew status
      setCrewMembers((prevCrew) =>
        prevCrew.map((crew) =>
          crewIds.includes(crew.id)
            ? { ...crew, status: "assigned", currentJob: jobId }
            : crew,
        ),
      );

      setIsAssignDialogOpen(false);
      setSelectedCrewForAssignment([]);
      setAssignmentNotes("");
      alert("Job assigned successfully!");
    } catch (error) {
      console.error("Error assigning job:", error);
      alert("Failed to assign job. Please try again.");
    }
  };

  const handleContactCrew = async (
    crewId: string,
    method: "call" | "message",
  ) => {
    try {
      const crew = crewMembers.find((c) => c.id === crewId);
      if (!crew) return;

      if (method === "call") {
        // In a real app, this would integrate with a phone system
        window.open(`tel:${crew.phone}`);

        // Log the contact attempt
        await crewsApi.contactCrew(crewId, "call", {
          phone: crew.phone,
          timestamp: new Date().toISOString(),
        });
      } else if (method === "message") {
        // In a real app, this would open SMS or messaging system
        const message = prompt("Enter message for " + crew.name + ":");
        if (message) {
          await crewsApi.contactCrew(crewId, "message", {
            message,
            timestamp: new Date().toISOString(),
          });
          alert("Message sent to " + crew.name);
        }
      }
    } catch (error) {
      console.error("Error contacting crew:", error);
      alert("Failed to contact crew member. Please try again.");
    }
  };

  const handleNavigateToJob = (job: Job) => {
    // Open directions in default maps app
    const address = encodeURIComponent(job.address);
    window.open(`https://maps.google.com/maps?q=${address}`, "_blank");
  };

  const handleCallCustomer = (job: Job) => {
    window.open(`tel:${job.customerPhone}`);
  };

  const handleAutoAssign = async () => {
    try {
      // Simple auto-assignment logic - assign pending jobs to available crew
      const pendingJobs = jobs.filter((j) => j.status === "pending");
      const availableCrew = crewMembers.filter((c) => c.status === "available");

      if (pendingJobs.length === 0) {
        alert("No pending jobs to assign");
        return;
      }

      if (availableCrew.length === 0) {
        alert("No available crew members for assignment");
        return;
      }

      let assignmentCount = 0;
      for (let i = 0; i < pendingJobs.length && i < availableCrew.length; i++) {
        const job = pendingJobs[i];
        const crew = availableCrew[i];

        try {
          await handleAssignJob(job.id, [crew.id]);
          assignmentCount++;
        } catch (error) {
          console.error(`Failed to auto-assign job ${job.id}:`, error);
        }
      }

      alert(`Auto-assigned ${assignmentCount} jobs successfully!`);
    } catch (error) {
      console.error("Error with auto-assignment:", error);
      alert("Auto-assignment failed. Please try manual assignment.");
    }
  };

  const JobCard = ({ job }: { job: Job }) => {
    const isOverdue =
      new Date() > job.scheduledTime && job.status === "pending";
    const assignedCrewNames = job.assignedCrew
      ?.map((crewId) => crewMembers.find((c) => c.id === crewId)?.name)
      .filter(Boolean)
      .join(", ");

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedJob(job);
          setIsJobDetailOpen(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {job.customerName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${getPriorityColor(job.priority)} text-white`}>
                {job.priority}
              </Badge>
              <Badge className={`${getStatusColor(job.status)} text-white`}>
                {job.status}
              </Badge>
              {isOverdue && (
                <Badge className="bg-red-600 text-white">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  OVERDUE
                </Badge>
              )}
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
              <span className="text-muted-foreground">• {job.serviceType}</span>
            </div>
          </div>

          {assignedCrewNames && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-blue-600">{assignedCrewNames}</span>
            </div>
          )}

          {job.specialRequirements && job.specialRequirements.length > 0 && (
            <div className="text-xs text-orange-600">
              Special: {job.specialRequirements.join(", ")}
            </div>
          )}

          <div className="flex items-center gap-2">
            {job.status === "pending" ? (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleContactCrew(job.assignedCrew?.[0] || "", "call");
                }}
              >
                <Phone className="w-3 h-3 mr-1" />
                Contact
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToJob(job);
              }}
            >
              <Navigation className="w-3 h-3 mr-1" />
              Navigate
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CrewCard = ({ crew }: { crew: CrewMember }) => {
    const RoleIcon = getRoleIcon(crew.role);
    const currentJob = crew.currentJob
      ? jobs.find((j) => j.id === crew.currentJob)
      : null;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedCrew(crew);
          setIsCrewDetailOpen(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RoleIcon className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">{crew.name}</CardTitle>
            </div>
            <Badge className={`${getCrewStatusColor(crew.status)} text-white`}>
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

          {crew.location && (
            <div className="text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 inline mr-1" />
              {crew.location.address} •{" "}
              {format(crew.location.lastUpdate, "HH:mm")}
            </div>
          )}

          {currentJob && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              Current: {currentJob.customerName} • {currentJob.serviceType}
            </div>
          )}

          {crew.estimatedAvailable && crew.status !== "available" && (
            <div className="text-xs text-muted-foreground">
              Available: {format(crew.estimatedAvailable, "HH:mm")}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleContactCrew(crew.id, "call");
              }}
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleContactCrew(crew.id, "message");
              }}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Dispatch</h1>
            <p className="text-muted-foreground">Loading dispatch data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-red-600">{error}</p>
              <Button onClick={loadDispatchData} className="mt-4">
                Retry Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Dispatch</h1>
          <p className="text-muted-foreground">
            Real-time job assignment and crew management
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
          <Button onClick={handleAutoAssign}>
            <Zap className="mr-1 h-4 w-4" />
            Auto-Assign
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

      {/* Urgent Notifications */}
      {notifications.filter((n) => n.priority === "high" && !n.isRead).length >
        0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Urgent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications
                .filter((n) => n.priority === "high" && !n.isRead)
                .map((notification) => (
                  <div key={notification.id} className="text-sm text-red-700">
                    {notification.message}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="crew">Crew</TabsTrigger>
          <TabsTrigger value="map">Live Map</TabsTrigger>
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
                      <Button size="sm">Assign</Button>
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
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crew" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {crewMembers.map((crew) => (
              <CrewCard key={crew.id} crew={crew} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Crew Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Interactive map with real-time crew locations
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Map integration would go here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                            variant={
                              selectedCrewForAssignment.includes(crew.id)
                                ? "default"
                                : "outline"
                            }
                            onClick={() => {
                              setSelectedCrewForAssignment((prev) =>
                                prev.includes(crew.id)
                                  ? prev.filter((id) => id !== crew.id)
                                  : [...prev, crew.id],
                              );
                            }}
                          >
                            {selectedCrewForAssignment.includes(crew.id)
                              ? "Selected"
                              : "Select"}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <Label htmlFor="assignment-notes">Assignment Notes</Label>
                <Textarea
                  id="assignment-notes"
                  placeholder="Special instructions for the crew..."
                  className="mt-1"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  onClick={() =>
                    handleAssignJob(selectedJob.id, selectedCrewForAssignment)
                  }
                  disabled={selectedCrewForAssignment.length === 0}
                >
                  <Send className="mr-1 h-4 w-4" />
                  Assign Job{" "}
                  {selectedCrewForAssignment.length > 0 &&
                    `(${selectedCrewForAssignment.length} crew)`}
                </Button>
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

      {/* Job Detail Dialog */}
      <Dialog open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedJob.customerName}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selectedJob.customerPhone}
                    </div>
                    <div>
                      <strong>Address:</strong> {selectedJob.address}
                    </div>
                    {selectedJob.customerRating && (
                      <div className="flex items-center gap-1">
                        <strong>Rating:</strong>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {selectedJob.customerRating}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Job Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Service:</strong> {selectedJob.serviceType}
                    </div>
                    <div>
                      <strong>Scheduled:</strong>{" "}
                      {format(selectedJob.scheduledTime, "PPp")}
                    </div>
                    <div>
                      <strong>Duration:</strong> {selectedJob.estimatedDuration}{" "}
                      minutes
                    </div>
                    <div>
                      <strong>Value:</strong> ${selectedJob.estimatedValue}
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Priority:</strong>
                      <Badge
                        className={`${getPriorityColor(
                          selectedJob.priority,
                        )} text-white`}
                      >
                        {selectedJob.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <Badge
                        className={`${getStatusColor(
                          selectedJob.status,
                        )} text-white`}
                      >
                        {selectedJob.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {selectedJob.specialRequirements &&
                selectedJob.specialRequirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Special Requirements</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {selectedJob.specialRequirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedJob.accessInstructions && (
                <div>
                  <h3 className="font-semibold mb-2">Access Instructions</h3>
                  <p className="text-sm bg-muted p-2 rounded">
                    {selectedJob.accessInstructions}
                  </p>
                </div>
              )}

              {selectedJob.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm">{selectedJob.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t">
                {selectedJob.status === "pending" && (
                  <Button
                    onClick={() => {
                      setIsJobDetailOpen(false);
                      setIsAssignDialogOpen(true);
                    }}
                  >
                    <Send className="mr-1 h-4 w-4" />
                    Assign Crew
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleCallCustomer(selectedJob)}
                >
                  <Phone className="mr-1 h-4 w-4" />
                  Call Customer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNavigateToJob(selectedJob)}
                >
                  <Navigation className="mr-1 h-4 w-4" />
                  Get Directions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingJob(selectedJob);
                    setIsJobEditOpen(true);
                  }}
                >
                  <Pencil className="mr-1 h-4 w-4" />
                  Edit Job
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Crew Detail Dialog */}
      <Dialog open={isCrewDetailOpen} onOpenChange={setIsCrewDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crew Member Details</DialogTitle>
          </DialogHeader>

          {selectedCrew && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedCrew.name}</h3>
                  <p className="text-muted-foreground capitalize">
                    {selectedCrew.role}
                  </p>
                </div>
                <Badge
                  className={`${getCrewStatusColor(
                    selectedCrew.status,
                  )} text-white`}
                >
                  {selectedCrew.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Contact</h4>
                  <div className="space-y-1 text-sm">
                    <div>{selectedCrew.phone}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {selectedCrew.rating} rating
                    </div>
                    <div>{selectedCrew.completedJobs} jobs completed</div>
                  </div>
                </div>
              </div>

              {selectedCrew.location && (
                <div>
                  <h4 className="font-medium mb-2">Current Location</h4>
                  <div className="text-sm">
                    <div>{selectedCrew.location.address}</div>
                    <div className="text-muted-foreground">
                      Last updated:{" "}
                      {format(selectedCrew.location.lastUpdate, "PPp")}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Skills & Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCrew.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCrew.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleContactCrew(selectedCrew.id, "call")}
                >
                  <Phone className="mr-1 h-4 w-4" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleContactCrew(selectedCrew.id, "message")}
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Message
                </Button>
                <Button variant="outline">
                  <Eye className="mr-1 h-4 w-4" />
                  View History
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispatch Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Dispatch Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="autoAssignRadius">
                  Auto-Assignment Radius (miles)
                </Label>
                <Input
                  id="autoAssignRadius"
                  type="number"
                  defaultValue="10"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <Label htmlFor="maxJobsPerCrew">Maximum Jobs Per Crew</Label>
                <Input
                  id="maxJobsPerCrew"
                  type="number"
                  defaultValue="3"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <Label htmlFor="priorityWeighting">Priority Weighting</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Priority</SelectItem>
                    <SelectItem value="urgent_first">
                      Urgent Jobs First
                    </SelectItem>
                    <SelectItem value="distance_first">
                      Distance-Based
                    </SelectItem>
                    <SelectItem value="balanced">Balanced Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notificationSettings">
                  Notification Settings
                </Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      defaultChecked
                    />
                    <Label htmlFor="emailNotifications">
                      Email notifications
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      defaultChecked
                    />
                    <Label htmlFor="smsNotifications">SMS notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      defaultChecked
                    />
                    <Label htmlFor="pushNotifications">
                      Push notifications
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  alert("Settings saved successfully!");
                  setIsSettingsOpen(false);
                }}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Edit Dialog */}
      <Dialog open={isJobEditOpen} onOpenChange={setIsJobEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Pencil className="mr-2 h-5 w-5" />
              Edit Job Details
            </DialogTitle>
          </DialogHeader>
          {editingJob && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobStatus">Job Status</Label>
                  <Select defaultValue={editingJob.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jobPriority">Priority</Label>
                  <Select defaultValue={editingJob.priority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedDuration">
                    Estimated Duration (hours)
                  </Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    defaultValue={editingJob.estimatedDuration}
                    min="0.5"
                    max="12"
                    step="0.5"
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    defaultValue={editingJob.scheduledTime
                      .toISOString()
                      .slice(0, 16)}
                  />
                </div>
                <div>
                  <Label htmlFor="jobNotes">Job Notes</Label>
                  <Textarea
                    id="jobNotes"
                    defaultValue={editingJob.notes || ""}
                    placeholder="Add any additional notes or special instructions..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="assignedCrew">Assigned Crew</Label>
                  <Select
                    defaultValue={
                      Array.isArray(editingJob.assignedCrew)
                        ? editingJob.assignedCrew[0] || ""
                        : editingJob.assignedCrew || ""
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crew" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {crewMembers
                        .filter((crew) => crew.status === "available")
                        .map((crew) => (
                          <SelectItem key={crew.id} value={crew.id}>
                            {crew.name} ({crew.currentJob ? 1 : 0} jobs)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsJobEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    alert(`Job ${editingJob.id} updated successfully!`);
                    setIsJobEditOpen(false);
                    setEditingJob(null);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
