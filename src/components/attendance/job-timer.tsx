"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
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
  Play,
  Pause,
  Timer,
  Clock,
  MapPin,
  CheckCircle,
  BarChart3,
  Target,
  Star,
  Download,
  Edit,
  Camera,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { FormItem } from "../ui/form";
import {
  useJobTimerStore,
  type JobTimer,
  type JobTask,
} from "@/stores/job-timer-store";

// Types are now imported from the store

interface PerformanceMetrics {
  workerId: string;
  totalJobs: number;
  avgJobTime: number;
  avgTaskTime: Record<string, number>;
  efficiencyScore: number;
  accuracyScore: number;
  improvementAreas: string[];
  strengths: string[];
  timeByPropertyType: Record<string, number>;
  timeByServiceType: Record<string, number>;
}

// Mock data
const mockJobTimers: JobTimer[] = [
  {
    id: "timer-1",
    workerId: "worker-1",
    jobId: "job-1",
    customerName: "Sofia Martinez",
    serviceType: "Deep Clean",
    propertyType: "residential",
    propertySize: {
      sqft: 1200,
      bedrooms: 2,
      bathrooms: 2,
      floors: 1,
    },
    tasks: [
      {
        id: "task-1",
        name: "Kitchen Deep Clean",
        description: "Clean all appliances, counters, cabinets inside/out",
        estimatedTime: 45,
        actualTime: 52,
        startTime: new Date(2024, 7, 16, 9, 0),
        endTime: new Date(2024, 7, 16, 9, 52),
        status: "completed",
        difficulty: "hard",
        priority: "high",
        location: "Kitchen",
        notes: "Heavy grease buildup on stove required extra time",
      },
      {
        id: "task-2",
        name: "Bathroom Deep Clean",
        description: "Scrub tiles, clean fixtures, sanitize surfaces",
        estimatedTime: 30,
        actualTime: 28,
        startTime: new Date(2024, 7, 16, 10, 0),
        endTime: new Date(2024, 7, 16, 10, 28),
        status: "completed",
        difficulty: "medium",
        priority: "high",
        location: "Master Bathroom",
      },
      {
        id: "task-3",
        name: "Living Room Cleaning",
        description: "Vacuum, dust, organize",
        estimatedTime: 20,
        status: "in_progress",
        difficulty: "easy",
        priority: "medium",
        location: "Living Room",
        startTime: new Date(2024, 7, 16, 10, 30),
      },
    ],
    startTime: new Date(2024, 7, 16, 9, 0),
    totalDuration: 80,
    status: "in_progress",
    location: {
      lat: 25.7617,
      lng: -80.1918,
      address: "1200 Brickell Ave, Miami, FL",
    },
    estimatedDuration: 180,
    breaks: [],
    photos: [
      {
        id: "photo-1",
        url: "/photos/before-kitchen.jpg",
        caption: "Kitchen before cleaning",
        timestamp: new Date(2024, 7, 16, 9, 0),
        type: "before",
      },
    ],
    notes: "Customer requested extra attention to kitchen appliances",
    completionChecklist: [
      {
        item: "All surfaces cleaned and sanitized",
        completed: true,
        timestamp: new Date(2024, 7, 16, 9, 52),
      },
      { item: "Floors mopped and dried", completed: false },
      {
        item: "Trash emptied",
        completed: true,
        timestamp: new Date(2024, 7, 16, 9, 45),
      },
      { item: "Final walk-through completed", completed: false },
    ],
  },
  {
    id: "timer-2",
    workerId: "worker-2",
    jobId: "job-2",
    customerName: "Robert Kim",
    serviceType: "Regular Clean",
    propertyType: "commercial",
    propertySize: {
      sqft: 2500,
      floors: 1,
    },
    tasks: [
      {
        id: "task-4",
        name: "Office Space Cleaning",
        description: "Vacuum, dust desks, empty trash",
        estimatedTime: 60,
        actualTime: 55,
        startTime: new Date(2024, 7, 16, 8, 0),
        endTime: new Date(2024, 7, 16, 8, 55),
        status: "completed",
        difficulty: "easy",
        priority: "medium",
        location: "Main Office",
      },
    ],
    startTime: new Date(2024, 7, 16, 8, 0),
    endTime: new Date(2024, 7, 16, 9, 30),
    totalDuration: 90,
    actualDuration: 90,
    status: "completed",
    location: {
      lat: 25.7907,
      lng: -80.13,
      address: "500 Biscayne Blvd, Miami, FL",
    },
    estimatedDuration: 120,
    breaks: [
      {
        start: new Date(2024, 7, 16, 8, 55),
        end: new Date(2024, 7, 16, 9, 10),
        reason: "Break",
        duration: 15,
      },
    ],
    photos: [],
    notes: "Completed ahead of schedule",
    qualityScore: 4.8,
    customerFeedback: "Excellent work, very thorough",
    completionChecklist: [
      {
        item: "All surfaces cleaned and sanitized",
        completed: true,
        timestamp: new Date(2024, 7, 16, 9, 25),
      },
      {
        item: "Floors mopped and dried",
        completed: true,
        timestamp: new Date(2024, 7, 16, 9, 20),
      },
      {
        item: "Trash emptied",
        completed: true,
        timestamp: new Date(2024, 7, 16, 9, 15),
      },
      {
        item: "Final walk-through completed",
        completed: true,
        timestamp: new Date(2024, 7, 16, 9, 30),
      },
    ],
  },
];

const mockPerformanceMetrics: PerformanceMetrics[] = [
  {
    workerId: "worker-1",
    totalJobs: 45,
    avgJobTime: 165, // minutes
    avgTaskTime: {
      "Kitchen Deep Clean": 48,
      "Bathroom Deep Clean": 32,
      "Living Room Cleaning": 22,
      "Bedroom Cleaning": 18,
    },
    efficiencyScore: 92,
    accuracyScore: 89,
    improvementAreas: ["Time estimation for kitchens", "Photo documentation"],
    strengths: [
      "Consistent quality",
      "Customer communication",
      "Task completion",
    ],
    timeByPropertyType: {
      residential: 155,
      commercial: 185,
      office: 95,
    },
    timeByServiceType: {
      "Deep Clean": 165,
      "Regular Clean": 120,
      "Move-out Clean": 210,
    },
  },
];

export function JobTimer() {
  // Zustand store hooks
  const {
    jobTimers,
    setJobTimers,
    updateCurrentTime,
    startTimer,
    pauseTimer,
    completeTimer,
    startTask,
    completeTask,
    updateTask,
    getTotalElapsedTime,
    getCurrentTaskDuration,
    getTimerStats,
  } = useJobTimerStore();

  // Local component state
  const [selectedTimer, setSelectedTimer] = useState<JobTimer | null>(null);
  const [isTimerDetailOpen, setIsTimerDetailOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [isTaskEditOpen, setIsTaskEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<JobTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterWorker, setFilterWorker] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("active");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskIssues, setTaskIssues] = useState("");
  const { toast } = useToast();

  // Hydration guard and initialization
  const [mounted, setMounted] = useState(false);

  // Update current time every second - always call hooks before any early returns
  useEffect(() => {
    const timer = setInterval(() => updateCurrentTime(), 1000);
    return () => clearInterval(timer);
  }, [updateCurrentTime]);

  // Filter job timers - must be called before early return
  const filteredTimers = useMemo(() => {
    let filtered = jobTimers;

    if (filterStatus !== "all") {
      filtered = filtered.filter((timer) => timer.status === filterStatus);
    }

    if (filterWorker !== "all") {
      filtered = filtered.filter((timer) => timer.workerId === filterWorker);
    }

    // Search functionality placeholder for future enhancement

    return filtered.sort((a, b) => {
      if (a.status === "in_progress" && b.status !== "in_progress") return -1;
      if (b.status === "in_progress" && a.status !== "in_progress") return 1;
      return (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0);
    });
  }, [jobTimers, filterStatus, filterWorker]);

  // Get timer statistics from store - must be called before early return
  const timerStats = useMemo(() => getTimerStats(), [getTimerStats]);

  useEffect(() => {
    setMounted(true);
    if (jobTimers.length === 0) {
      setJobTimers(mockJobTimers);
    }
  }, [jobTimers.length, setJobTimers]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Timer</h1>
            <p className="text-muted-foreground">
              Track cleaning time and task performance with detailed analytics
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "paused":
        return "bg-yellow-500";
      case "not_started":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-500";
      case "skipped":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // These functions are now provided by the store

  const handleStartTimer = (timerId: string) => {
    startTimer(timerId);
    toast({
      title: "Timer Started",
      description: "Job timer has been started successfully.",
    });
  };

  const handlePauseTimer = (timerId: string) => {
    pauseTimer(timerId);
    toast({
      title: "Timer Paused",
      description: "Job timer has been paused.",
    });
  };

  const handleCompleteTimer = (timerId: string) => {
    const timer = jobTimers.find((t) => t.id === timerId);
    if (!timer) return;

    const actualDuration = timer.actualDuration || getTotalElapsedTime(timer);
    completeTimer(timerId);
    toast({
      title: "Job Completed",
      description: `Job completed in ${formatDuration(actualDuration)}`,
    });
  };

  const handleStartTask = (timerId: string, taskId: string) => {
    startTask(timerId, taskId);
    toast({
      title: "Task Started",
      description: "Task timer has been started.",
    });
  };

  const handleCompleteTask = (timerId: string, taskId: string) => {
    const timer = jobTimers.find((t) => t.id === timerId);
    const task = timer?.tasks.find((t) => t.id === taskId);
    if (!timer || !task) return;

    const actualTime = task.actualTime || getCurrentTaskDuration(timer);
    completeTask(timerId, taskId);
    toast({
      title: "Task Completed",
      description: `${task.name} completed in ${formatDuration(actualTime)}`,
    });
  };

  const handleExportData = () => {
    try {
      const csvData = [
        [
          "Job ID",
          "Customer",
          "Service Type",
          "Status",
          "Start Time",
          "End Time",
          "Estimated Duration",
          "Actual Duration",
          "Efficiency",
        ],
        ...jobTimers.map((timer) => [
          timer.jobId,
          timer.customerName,
          timer.serviceType,
          timer.status,
          timer.startTime ? format(timer.startTime, "yyyy-MM-dd HH:mm") : "",
          timer.endTime ? format(timer.endTime, "yyyy-MM-dd HH:mm") : "",
          formatDuration(timer.estimatedDuration),
          timer.actualDuration ? formatDuration(timer.actualDuration) : "",
          timer.actualDuration
            ? `${(
                (timer.estimatedDuration / timer.actualDuration) *
                100
              ).toFixed(1)}%`
            : "",
        ]),
      ];

      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `job-timer-data-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Job timer data exported successfully.",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTaskChanges = () => {
    if (!selectedTask || !selectedTimer) return;

    updateTask(selectedTimer.id, selectedTask.id, {
      notes: taskNotes,
      issues: taskIssues
        ? taskIssues.split(",").map((i) => i.trim())
        : undefined,
    });

    setIsTaskEditOpen(false);
    toast({
      title: "Task Updated",
      description: "Task details have been saved successfully.",
    });
  };

  const TimerCard = ({ timer }: { timer: JobTimer }) => {
    const currentTask = timer.tasks.find((t) => t.status === "in_progress");
    const completedTasks = timer.tasks.filter(
      (t) => t.status === "completed",
    ).length;
    const totalTasks = timer.tasks.length;
    const progress = (completedTasks / totalTasks) * 100;
    const elapsedTime = getTotalElapsedTime(timer);
    const isOvertime =
      timer.estimatedDuration && elapsedTime > timer.estimatedDuration;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedTimer(timer);
          setIsTimerDetailOpen(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {timer.customerName}
            </CardTitle>
            <Badge className={`${getStatusColor(timer.status)} text-white`}>
              {timer.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {timer.serviceType}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{timer.location.address}</span>
            </div>
          </div>

          {timer.status === "in_progress" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Time Elapsed:</span>
                <span
                  className={`font-mono ${
                    isOvertime ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatDuration(elapsedTime)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Estimated:</span>
                <span>{formatDuration(timer.estimatedDuration)}</span>
              </div>
            </div>
          )}

          {timer.actualDuration && (
            <div className="flex justify-between text-sm">
              <span>Total Time:</span>
              <span className="font-mono">
                {formatDuration(timer.actualDuration)}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Task Progress</span>
              <span>
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentTask && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              Current: {currentTask.name} (
              {formatDuration(getCurrentTaskDuration(timer))})
            </div>
          )}

          {timer.status === "completed" && timer.qualityScore && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>Quality: {timer.qualityScore}/5</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {timer.status === "not_started" && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartTimer(timer.id);
                }}
              >
                <Play className="w-3 h-3 mr-1" />
                Start
              </Button>
            )}

            {timer.status === "in_progress" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePauseTimer(timer.id);
                  }}
                >
                  <Pause className="w-3 h-3 mr-1" />
                  Pause
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteTimer(timer.id);
                  }}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const TaskCard = ({ task, timer }: { task: JobTask; timer: JobTimer }) => {
    const duration = task.actualTime || getCurrentTaskDuration(timer);
    const isOvertime = task.estimatedTime && duration > task.estimatedTime;

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{task.name}</h4>
              <Badge
                className={`${getTaskStatusColor(task.status)} text-white`}
              >
                {task.status}
              </Badge>
            </div>
            <Badge
              className={`${getDifficultyColor(task.difficulty)} text-white`}
            >
              {task.difficulty}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {task.description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <div className="text-muted-foreground">Location</div>
              <div className="font-medium">{task.location}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Priority</div>
              <div className="font-medium capitalize">{task.priority}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <div className="text-muted-foreground">Estimated</div>
              <div className="font-medium">
                {formatDuration(task.estimatedTime)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Actual</div>
              <div
                className={`font-medium ${
                  isOvertime ? "text-red-600" : "text-green-600"
                }`}
              >
                {task.actualTime
                  ? formatDuration(task.actualTime)
                  : task.status === "in_progress"
                    ? formatDuration(duration)
                    : "--"}
              </div>
            </div>
          </div>

          {task.notes && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-3">
              {task.notes}
            </div>
          )}

          {task.issues && task.issues.length > 0 && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded mb-3">
              Issues: {task.issues.join(", ")}
            </div>
          )}

          <div className="flex items-center gap-2">
            {task.status === "pending" && (
              <Button
                size="sm"
                onClick={() => handleStartTask(timer.id, task.id)}
              >
                <Play className="w-3 h-3 mr-1" />
                Start Task
              </Button>
            )}

            {task.status === "in_progress" && (
              <Button
                size="sm"
                onClick={() => handleCompleteTask(timer.id, task.id)}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedTask(task);
                setTaskNotes(task.notes || "");
                setTaskIssues(task.issues?.join(", ") || "");
                setIsTaskEditOpen(true);
              }}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Timer</h1>
          <p className="text-muted-foreground">
            Track cleaning time and task performance with detailed analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="mr-1 h-4 w-4" />
            Export Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPerformanceOpen(true)}
          >
            <BarChart3 className="mr-1 h-4 w-4" />
            Performance
          </Button>
          <Button
            onClick={() => {
              toast({
                title: "Feature Coming Soon",
                description:
                  "New timer creation will be available in the next update.",
              });
            }}
          >
            <Timer className="mr-1 h-4 w-4" />
            New Timer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Timers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timerStats.activeTimers}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
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
            <div className="text-2xl font-bold">
              {timerStats.completedToday}
            </div>
            <p className="text-xs text-muted-foreground">Jobs finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Efficiency
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timerStats.avgEfficiency.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs estimates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timerStats.onTimeRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">within estimates</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterWorker} onValueChange={setFilterWorker}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Worker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workers</SelectItem>
                    <SelectItem value="worker-1">Maria Santos</SelectItem>
                    <SelectItem value="worker-2">Carlos Rodriguez</SelectItem>
                    <SelectItem value="worker-3">Ana Gutierrez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Job Timers Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTimers.map((timer) => (
              <TimerCard key={timer.id} timer={timer} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobTimers
              .filter((t) => t.status === "completed")
              .map((timer) => (
                <TimerCard key={timer.id} timer={timer} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time by Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    mockPerformanceMetrics[0]?.timeByServiceType || {},
                  ).map(([service, time]) => (
                    <div
                      key={service}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{service}</span>
                      <span className="font-medium">
                        {formatDuration(time)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    mockPerformanceMetrics[0]?.avgTaskTime || {},
                  ).map(([task, time]) => (
                    <div
                      key={task}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{task}</span>
                      <span className="font-medium">
                        {formatDuration(time)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Timer Detail Dialog */}
      <Dialog open={isTimerDetailOpen} onOpenChange={setIsTimerDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Timer - {selectedTimer?.customerName}</DialogTitle>
          </DialogHeader>

          {selectedTimer && (
            <div className="space-y-6">
              {/* Timer Header */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Job Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Customer:</strong> {selectedTimer.customerName}
                    </div>
                    <div>
                      <strong>Service:</strong> {selectedTimer.serviceType}
                    </div>
                    <div>
                      <strong>Property:</strong> {selectedTimer.propertyType}
                    </div>
                    <div>
                      <strong>Size:</strong> {selectedTimer.propertySize.sqft}{" "}
                      sqft
                    </div>
                    <div>
                      <strong>Address:</strong> {selectedTimer.location.address}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Timing</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Status:</strong>
                      <Badge
                        className={`ml-2 ${getStatusColor(
                          selectedTimer.status,
                        )} text-white`}
                      >
                        {selectedTimer.status}
                      </Badge>
                    </div>
                    <div>
                      <strong>Estimated:</strong>{" "}
                      {formatDuration(selectedTimer.estimatedDuration)}
                    </div>
                    {selectedTimer.actualDuration && (
                      <div>
                        <strong>Actual:</strong>{" "}
                        {formatDuration(selectedTimer.actualDuration)}
                      </div>
                    )}
                    {selectedTimer.status === "in_progress" && (
                      <div>
                        <strong>Elapsed:</strong>{" "}
                        {formatDuration(getTotalElapsedTime(selectedTimer))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tasks Completed</span>
                      <span>
                        {
                          selectedTimer.tasks.filter(
                            (t) => t.status === "completed",
                          ).length
                        }
                        /{selectedTimer.tasks.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedTimer.tasks.filter(
                          (t) => t.status === "completed",
                        ).length /
                          selectedTimer.tasks.length) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="font-semibold mb-3">Tasks</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedTimer.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} timer={selectedTimer} />
                  ))}
                </div>
              </div>

              {/* Completion Checklist */}
              <div>
                <h3 className="font-semibold mb-3">Completion Checklist</h3>
                <div className="space-y-2">
                  {selectedTimer.completionChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <CheckCircle
                        className={`w-4 h-4 ${
                          item.completed ? "text-green-500" : "text-gray-300"
                        }`}
                      />
                      <span
                        className={`flex-1 text-sm ${
                          item.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.item}
                      </span>
                      {item.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {format(item.timestamp, "HH:mm")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes and Photos */}
              {(selectedTimer.notes || selectedTimer.photos.length > 0) && (
                <div className="grid grid-cols-2 gap-6">
                  {selectedTimer.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <div className="text-sm bg-muted p-3 rounded">
                        {selectedTimer.notes}
                      </div>
                    </div>
                  )}

                  {selectedTimer.photos.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">
                        Photos ({selectedTimer.photos.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTimer.photos.map((photo) => (
                          <div key={photo.id} className="border rounded p-2">
                            <div className="text-xs text-muted-foreground mb-1">
                              {photo.type} • {format(photo.timestamp, "HH:mm")}
                            </div>
                            <div className="bg-muted h-16 rounded flex items-center justify-center">
                              <Camera className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="text-xs mt-1">{photo.caption}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog open={isPerformanceOpen} onOpenChange={setIsPerformanceOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Performance Analytics</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {mockPerformanceMetrics.map((metrics) => (
              <div key={metrics.workerId} className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 border rounded">
                    <div className="text-lg font-bold">{metrics.totalJobs}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Jobs
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-lg font-bold">
                      {formatDuration(metrics.avgJobTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg Job Time
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-lg font-bold">
                      {metrics.efficiencyScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Efficiency
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-lg font-bold">
                      {metrics.accuracyScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Accuracy
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">
                      Strengths
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {metrics.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">
                      Improvement Areas
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {metrics.improvementAreas.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Edit Dialog */}
      <Dialog open={isTaskEditOpen} onOpenChange={setIsTaskEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <FormItem>
                <Label htmlFor="task-notes">Notes</Label>
                <Textarea
                  id="task-notes"
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Add task notes..."
                />
              </FormItem>

              <FormItem>
                <Label htmlFor="task-issues">Issues (comma separated)</Label>
                <Input
                  id="task-issues"
                  value={taskIssues}
                  onChange={(e) => setTaskIssues(e.target.value)}
                  placeholder="Equipment malfunction, customer request..."
                />
              </FormItem>

              <div className="flex items-center gap-2 pt-4">
                <Button onClick={handleSaveTaskChanges}>Save Changes</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsTaskEditOpen(false)}
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
