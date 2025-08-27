"use client";

import { useState, useEffect } from "react";
import type { Job } from "@/types/app.types";
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
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Users,
  Phone,
  Navigation,
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { JobCreationForm } from "@/components/jobs/job-creation-form";
import { jobsApi } from "@/lib/api";

// Fallback job data for when API is not available
const fallbackJobs = [
  {
    id: "JOB-202408-0001",
    customer: "Customer A",
    address: "1200 Brickell Ave, Miami, FL 33131",
    service: "Deep Clean Blue",
    crew: "Alpha Team",
    status: "in_progress",
    priority: "normal",
    scheduledStart: new Date("2024-08-16T09:00:00"),
    estimatedEnd: new Date("2024-08-16T12:00:00"),
    actualStart: new Date("2024-08-16T09:15:00"),
    progress: 65,
    notes: "Customer prefers eco-friendly products",
  },
  {
    id: "JOB-202408-0002",
    customer: "Customer B",
    address: "500 Biscayne Blvd, Miami, FL 33132",
    service: "Regular House Cleaning",
    crew: "Gamma Team",
    status: "assigned",
    priority: "high",
    scheduledStart: new Date("2024-08-16T10:30:00"),
    estimatedEnd: new Date("2024-08-16T13:30:00"),
    actualStart: null,
    progress: 0,
    notes: "Two small dogs, use pet-safe products",
  },
  {
    id: "JOB-202408-0003",
    customer: "Customer C",
    address: "850 Miami Ave, Miami, FL 33130",
    service: "Move-out Cleaning",
    crew: "Beta Team",
    status: "completed",
    priority: "normal",
    scheduledStart: new Date("2024-08-16T08:00:00"),
    estimatedEnd: new Date("2024-08-16T11:00:00"),
    actualStart: new Date("2024-08-16T08:10:00"),
    actualEnd: new Date("2024-08-16T10:45:00"),
    progress: 100,
    notes: "Excellent work, customer very satisfied",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "in_progress":
      return "bg-sky-500";
    case "assigned":
      return "bg-yellow-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-stone-500";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "assigned":
      return "Assigned";
    case "cancelled":
      return "Cancelled";
    default:
      return "Unknown";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive";
    case "normal":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "secondary";
  }
};

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load jobs from API
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobsApi.getAll();
      setJobsList(Array.isArray(data) ? (data as Job[]) : []);
    } catch (error: unknown) {
      if (
        (error as { response?: { status?: number } })?.response?.status ===
          401 ||
        (error as Error)?.message?.includes("jwt expired")
      ) {
        console.warn("🔐 Authentication expired, using fallback jobs data");
      } else {
        console.error("Failed to load jobs:", error);
      }
      // Use fallback data when API is not available
      setJobsList(fallbackJobs as Job[]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobCreated = (newJob: Job) => {
    setJobsList((prev) => [newJob, ...prev]);
  };

  const filteredJobs = jobsList.filter((job) => {
    const matchesSearch =
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 border-b pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Track and manage all cleaning jobs and assignments
          </p>
        </div>
        <Button onClick={() => setIsJobFormOpen(true)}>
          <Calendar className="mr-1 h-4 w-4" />
          Schedule New Job
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              2 in progress, 3 assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Above 90% target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crews Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">12 crew members</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Crew</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                      <p className="text-lg font-semibold text-red-600">
                        {error}
                      </p>
                      <Button onClick={loadJobs} className="mt-2">
                        Try Again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 && jobsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No jobs found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Get started by creating your first job
                      </p>
                      <Button onClick={() => setIsJobFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Job
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Search className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No jobs match your filters
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search or filters
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setPriorityFilter("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-sm">
                      {job.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.customer}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.address.split(",")[0]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{job.service}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.crew}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            job.status,
                          )}`}
                        />
                        <span className="text-sm">
                          {getStatusLabel(job.status)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getPriorityColor(job.priority) as
                            | "default"
                            | "secondary"
                            | "outline"
                            | "destructive"
                            | null
                            | undefined
                        }
                      >
                        {job.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {job.scheduledStart?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) || "Not scheduled"}
                        </div>
                        <div className="text-muted-foreground">
                          {job.actualStart
                            ? `Started ${formatDistanceToNow(
                                job.actualStart,
                              )} ago`
                            : job.scheduledStart
                              ? `Starts ${formatDistanceToNow(
                                  job.scheduledStart,
                                  {
                                    addSuffix: true,
                                  },
                                )}`
                              : "Not scheduled"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-stone-200 rounded-full h-2">
                          <div
                            className="bg-stone-600 h-2 rounded-full"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-sm w-12">{job.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            console.log(`Initiating call for job ${job.id}`)
                          }
                          title="Call customer"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            console.log(`Opening navigation to ${job.address}`)
                          }
                          title="Get directions"
                        >
                          <Navigation className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            console.log(`Opening job details for ${job.id}`)
                          }
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Job Creation Dialog */}
      <Dialog open={isJobFormOpen} onOpenChange={setIsJobFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule New Job
            </DialogTitle>
          </DialogHeader>
          <JobCreationForm
            onClose={() => setIsJobFormOpen(false)}
            onJobCreated={handleJobCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
