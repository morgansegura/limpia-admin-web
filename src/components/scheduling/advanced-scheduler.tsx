"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  View,
  Event as CalendarEvent,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isToday } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  User,
  Phone,
  Edit,
  Trash2,
  Plus,
  Filter,
  RotateCcw,
  MapPinIcon,
} from "lucide-react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { FormItem } from "../ui/form";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Job {
  id: string;
  title: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  service: {
    name: string;
    estimatedDuration: number; // minutes
    category: string;
  };
  crew?: {
    id: string;
    name: string;
    members: Array<{ name: string; role: string }>;
  };
  status:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "rescheduled";
  priority: "low" | "normal" | "high" | "urgent";
  start: Date;
  end: Date;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  notes?: string;
  requirements?: string[];
  pricing?: {
    estimated: number;
    final?: number;
  };
}

interface Crew {
  id: string;
  name: string;
  color: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
    skills: string[];
  }>;
  capacity: number;
  workingHours: {
    start: string;
    end: string;
  };
  availability: boolean;
}

// Mock data
const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Deep Clean - Martinez Residence",
    customer: {
      name: "Sofia Martinez",
      phone: "(305) 555-0123",
      address: "1200 Brickell Ave, Miami, FL 33131",
    },
    service: {
      name: "Deep Clean Blue",
      estimatedDuration: 180,
      category: "residential",
    },
    crew: {
      id: "crew-1",
      name: "Alpha Team",
      members: [
        { name: "Carlos Rodriguez", role: "Lead" },
        { name: "Maria Gonzalez", role: "Cleaner" },
      ],
    },
    status: "scheduled",
    priority: "high",
    start: new Date(2024, 7, 16, 9, 0),
    end: new Date(2024, 7, 16, 12, 0),
    location: {
      address: "1200 Brickell Ave, Miami, FL 33131",
    },
    notes: "Customer prefers eco-friendly products",
    requirements: ["eco_friendly", "pet_safe"],
    pricing: { estimated: 350 },
  },
  {
    id: "job-2",
    title: "Regular Clean - Kim Residence",
    customer: {
      name: "Robert Kim",
      phone: "(305) 555-0456",
      address: "500 Biscayne Blvd, Miami, FL 33132",
    },
    service: {
      name: "Regular House Cleaning",
      estimatedDuration: 120,
      category: "residential",
    },
    crew: {
      id: "crew-2",
      name: "Beta Team",
      members: [
        { name: "Ana Silva", role: "Lead" },
        { name: "Luis Martinez", role: "Cleaner" },
      ],
    },
    status: "scheduled",
    priority: "normal",
    start: new Date(2024, 7, 16, 14, 0),
    end: new Date(2024, 7, 16, 16, 0),
    location: {
      address: "500 Biscayne Blvd, Miami, FL 33132",
    },
    notes: "Two small dogs, use pet-safe products",
    requirements: ["pet_safe"],
    pricing: { estimated: 180 },
  },
];

const mockCrews: Crew[] = [
  {
    id: "crew-1",
    name: "Alpha Team",
    color: "#3B82F6",
    members: [
      {
        id: "1",
        name: "Carlos Rodriguez",
        role: "Team Lead",
        skills: ["deep_clean", "move_out", "commercial"],
      },
      {
        id: "2",
        name: "Maria Gonzalez",
        role: "Senior Cleaner",
        skills: ["residential", "eco_friendly"],
      },
      {
        id: "3",
        name: "Juan Lopez",
        role: "Cleaner",
        skills: ["residential", "basic_clean"],
      },
    ],
    capacity: 3,
    workingHours: { start: "08:00", end: "17:00" },
    availability: true,
  },
  {
    id: "crew-2",
    name: "Beta Team",
    color: "#10B981",
    members: [
      {
        id: "4",
        name: "Ana Silva",
        role: "Team Lead",
        skills: ["residential", "deep_clean", "post_construction"],
      },
      {
        id: "5",
        name: "Luis Martinez",
        role: "Senior Cleaner",
        skills: ["commercial", "carpet_clean"],
      },
    ],
    capacity: 2,
    workingHours: { start: "09:00", end: "18:00" },
    availability: true,
  },
  {
    id: "crew-3",
    name: "Gamma Team",
    color: "#F59E0B",
    members: [
      {
        id: "6",
        name: "Patricia Wilson",
        role: "Team Lead",
        skills: ["commercial", "office_clean", "medical"],
      },
      {
        id: "7",
        name: "Roberto Chen",
        role: "Cleaner",
        skills: ["residential", "window_clean"],
      },
      {
        id: "8",
        name: "Elena Rodriguez",
        role: "Cleaner",
        skills: ["deep_clean", "move_in"],
      },
    ],
    capacity: 3,
    workingHours: { start: "07:00", end: "16:00" },
    availability: false,
  },
];

export function AdvancedScheduler() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [crews] = useState<Crew[]>(mockCrews);
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [filterCrew, setFilterCrew] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Convert jobs to calendar events
  const events = useMemo(() => {
    return jobs
      .filter((job) => {
        if (filterCrew !== "all" && job.crew?.id !== filterCrew) return false;
        if (filterStatus !== "all" && job.status !== filterStatus) return false;
        return true;
      })
      .map((job) => ({
        id: job.id,
        title: job.title,
        start: job.start,
        end: job.end,
        resource: job,
      }));
  }, [jobs, filterCrew, filterStatus]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const job = event.resource as Job;
    setSelectedJob(job);
    setIsJobDialogOpen(true);
  }, []);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      // Create new job template
      const newJob: Partial<Job> = {
        start,
        end,
        status: "scheduled",
        priority: "normal",
      };
      // Open job creation dialog
      console.log("Create new job:", newJob);
    },
    [],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id === event.active.id);
    setDraggedJob(job || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;

    if (!over || !draggedJob) {
      setDraggedJob(null);
      return;
    }

    // Handle dropping on crew
    if (over.id.toString().startsWith("crew-")) {
      const targetCrew = crews.find((c) => c.id === over.id);
      if (targetCrew) {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === draggedJob.id
              ? {
                  ...job,
                  crew: {
                    id: targetCrew.id,
                    name: targetCrew.name,
                    members: targetCrew.members,
                  },
                }
              : job,
          ),
        );
      }
    }

    setDraggedJob(null);
  };

  const getJobStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";
      case "in_progress":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      case "rescheduled":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: Job["priority"]) => {
    switch (priority) {
      case "urgent":
        return "border-l-4 border-red-600";
      case "high":
        return "border-l-4 border-orange-500";
      case "normal":
        return "border-l-4 border-blue-500";
      case "low":
        return "border-l-4 border-gray-400";
      default:
        return "border-l-4 border-gray-400";
    }
  };

  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const job = event.resource as Job;

    return (
      <div className={`p-1 text-xs rounded ${getPriorityColor(job.priority)}`}>
        <div className="font-semibold truncate">{job.customer.name}</div>
        <div className="text-xs opacity-80 truncate">{job.service.name}</div>
        <div className="flex items-center gap-1 mt-1">
          {job.crew && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1 py-0"
              style={{
                backgroundColor:
                  job.crew?.name === "Alpha Team"
                    ? "#3B82F6"
                    : job.crew?.name === "Beta Team"
                      ? "#10B981"
                      : "#F59E0B",
              }}
            >
              {job.crew.name}
            </Badge>
          )}
          <div
            className={`w-2 h-2 rounded-full ${getJobStatusColor(job.status)}`}
          />
        </div>
      </div>
    );
  };

  const CrewPanel = ({ crew }: { crew: Crew }) => {
    const crewJobs = jobs.filter((job) => job.crew?.id === crew.id);
    const todayJobs = crewJobs.filter((job) => isToday(job.start));

    return (
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: crew.color }}
              />
              {crew.name}
            </CardTitle>
            <Badge variant={crew.availability ? "default" : "secondary"}>
              {crew.availability ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs text-muted-foreground">
            {crew.members.length} members • Capacity: {crew.capacity}
          </div>
          <div className="text-xs">
            Hours: {crew.workingHours.start} - {crew.workingHours.end}
          </div>

          {todayJobs.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium">
                Today&apos;s Jobs ({todayJobs.length})
              </div>
              {todayJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-2 bg-muted rounded text-xs cursor-pointer hover:bg-muted/80"
                  onClick={() => {
                    setSelectedJob(job);
                    setIsJobDialogOpen(true);
                  }}
                >
                  <div className="font-medium">{job.customer.name}</div>
                  <div className="text-muted-foreground">
                    {format(job.start, "HH:mm")} - {format(job.end, "HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Advanced Scheduler
              </h1>
              <p className="text-muted-foreground">
                Drag & drop scheduling with real-time crew management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-1 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="mr-1 h-4 w-4" />
                Auto-Schedule
              </Button>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                New Job
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Jobs
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {jobs.filter((job) => isToday(job.start)).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {
                    jobs.filter(
                      (job) => isToday(job.start) && job.status === "completed",
                    ).length
                  }{" "}
                  completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Crews
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {crews.filter((crew) => crew.availability).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {crews.length} total crews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Utilization
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  Above 80% target
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue Today
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,450</div>
                <p className="text-xs text-muted-foreground">
                  +15% from yesterday
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <FormItem className="flex">
                  <Label htmlFor="crew-filter">Crew:</Label>
                  <Select value={filterCrew} onValueChange={setFilterCrew}>
                    <SelectTrigger className="w-fill">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Crews</SelectItem>
                      {crews.map((crew) => (
                        <SelectItem key={crew.id} value={crew.id}>
                          {crew.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>

                <div className="flex items-center gap-2">
                  <Label htmlFor="status-filter">Status:</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={view === "day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("day")}
                  >
                    Day
                  </Button>
                  <Button
                    variant={view === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={view === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("month")}
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Crew Management Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Crew Management</h3>
              {crews.map((crew) => (
                <CrewPanel key={crew.id} crew={crew} />
              ))}
            </div>

            {/* Calendar */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-4">
                  <div style={{ height: "700px" }}>
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      view={view}
                      onView={setView}
                      date={date}
                      onNavigate={setDate}
                      onSelectEvent={handleSelectEvent}
                      onSelectSlot={handleSelectSlot}
                      selectable
                      // resizable
                      components={{
                        event: CustomEvent,
                      }}
                      step={15}
                      timeslots={4}
                      min={new Date(0, 0, 0, 7, 0, 0)}
                      max={new Date(0, 0, 0, 20, 0, 0)}
                      dayLayoutAlgorithm="no-overlap"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Job Details Dialog */}
          <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Job Details
                </DialogTitle>
              </DialogHeader>

              {selectedJob && (
                <div className="space-y-6">
                  {/* Job Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedJob.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedJob.service.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          selectedJob.priority === "urgent"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {selectedJob.priority}
                      </Badge>
                      <Badge className={getJobStatusColor(selectedJob.status)}>
                        {selectedJob.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Customer</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedJob.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedJob.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedJob.location.address}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Schedule</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{format(selectedJob.start, "PPpp")}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Duration: {selectedJob.service.estimatedDuration}{" "}
                        minutes
                      </div>
                      {selectedJob.pricing && (
                        <div className="text-sm">
                          Estimated: ${selectedJob.pricing.estimated}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Crew Assignment */}
                  {selectedJob.crew && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Assigned Crew
                      </Label>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedJob.crew.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedJob.crew.members
                          .map((m) => `${m.name} (${m.role})`)
                          .join(", ")}
                      </div>
                    </div>
                  )}

                  {/* Notes & Requirements */}
                  {(selectedJob.notes || selectedJob.requirements) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Notes & Requirements
                      </Label>
                      {selectedJob.notes && (
                        <p className="text-sm">{selectedJob.notes}</p>
                      )}
                      {selectedJob.requirements && (
                        <div className="flex gap-1 flex-wrap">
                          {selectedJob.requirements.map((req, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {req.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button size="sm">
                      <Edit className="mr-1 h-4 w-4" />
                      Edit Job
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPinIcon className="mr-1 h-4 w-4" />
                      View on Map
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="mr-1 h-4 w-4" />
                      Call Customer
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" size="sm">
                      <Trash2 className="mr-1 h-4 w-4" />
                      Cancel Job
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <DragOverlay>
            {draggedJob && (
              <div className="p-2 bg-white border rounded shadow-lg">
                <div className="font-medium">{draggedJob.customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {draggedJob.service.name}
                </div>
              </div>
            )}
          </DragOverlay>
        </div>
      </DndContext>
    </TooltipProvider>
  );
}
