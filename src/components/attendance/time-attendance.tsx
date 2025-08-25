"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  Square,
  BarChart3,
  Download,
  Search,
  Eye,
  Edit,
  Settings,
  UserCheck,
  Timer,
  Coffee,
  AlertCircle,
  FileText,
  Target,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { crewsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  department: string;
  shift: {
    start: string; // HH:mm format
    end: string;
    timezone: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    lastUpdate: Date;
  };
  status: "clocked_in" | "clocked_out" | "on_break" | "off_duty";
}

interface TimeEntry {
  id: string;
  workerId: string;
  type: "clock_in" | "clock_out" | "break_start" | "break_end";
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
    accuracy: number;
  };
  source: "mobile_app" | "web_portal" | "manual_entry" | "admin_override";
  ipAddress?: string;
  deviceInfo?: string;
  notes?: string;
  isValid: boolean;
  flags: string[];
  approvedBy?: string;
  approvedAt?: Date;
}

interface AttendanceRecord {
  id: string;
  workerId: string;
  date: Date;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  breakDuration: number;
  status: "present" | "absent" | "late" | "early_departure" | "partial";
  latenessMinutes: number;
  earlyDepartureMinutes: number;
  breaks: {
    start: Date;
    end?: Date;
    duration: number;
    type: "lunch" | "break" | "personal";
  }[];
  violations: {
    type:
      | "location_mismatch"
      | "suspicious_timing"
      | "multiple_logins"
      | "missed_break";
    description: string;
    severity: "low" | "medium" | "high";
  }[];
  jobs: string[];
}

interface AttendancePolicy {
  allowedLatenessMinutes: number;
  gracePeridMinutes: number;
  maxBreakDuration: number;
  requiredBreakInterval: number;
  geoFenceRadius: number; // meters
  workLocations: {
    name: string;
    lat: number;
    lng: number;
    radius: number;
  }[];
  overtimeThreshold: number;
  timeTrackingMethod: "gps_required" | "gps_preferred" | "manual_allowed";
}

// Mock data
const mockWorkers: Worker[] = [
  {
    id: "worker-1",
    name: "Maria Santos",
    employeeId: "EMP-001",
    role: "Team Lead",
    department: "Operations",
    shift: {
      start: "08:00",
      end: "17:00",
      timezone: "America/New_York",
    },
    location: {
      lat: 25.7617,
      lng: -80.1918,
      address: "Downtown Miami",
      lastUpdate: new Date(),
    },
    status: "clocked_in",
  },
  {
    id: "worker-2",
    name: "Carlos Rodriguez",
    employeeId: "EMP-002",
    role: "Cleaner",
    department: "Operations",
    shift: {
      start: "09:00",
      end: "18:00",
      timezone: "America/New_York",
    },
    location: {
      lat: 25.7907,
      lng: -80.13,
      address: "Brickell",
      lastUpdate: subDays(new Date(), 0),
    },
    status: "on_break",
  },
  {
    id: "worker-3",
    name: "Ana Gutierrez",
    employeeId: "EMP-003",
    role: "Cleaner",
    department: "Operations",
    shift: {
      start: "07:00",
      end: "16:00",
      timezone: "America/New_York",
    },
    location: {
      lat: 25.7317,
      lng: -80.2434,
      address: "Coral Gables",
      lastUpdate: subDays(new Date(), 0),
    },
    status: "clocked_out",
  },
];

const mockTimeEntries: TimeEntry[] = [
  {
    id: "entry-1",
    workerId: "worker-1",
    type: "clock_in",
    timestamp: new Date(2024, 7, 16, 8, 5),
    location: {
      lat: 25.7617,
      lng: -80.1918,
      address: "Miami Operations Center",
      accuracy: 10,
    },
    source: "mobile_app",
    deviceInfo: "iPhone 14 Pro",
    isValid: true,
    flags: ["late_arrival"],
  },
  {
    id: "entry-2",
    workerId: "worker-1",
    type: "break_start",
    timestamp: new Date(2024, 7, 16, 12, 0),
    location: {
      lat: 25.7617,
      lng: -80.1918,
      address: "Miami Operations Center",
      accuracy: 8,
    },
    source: "mobile_app",
    isValid: true,
    flags: [],
  },
  {
    id: "entry-3",
    workerId: "worker-2",
    type: "clock_in",
    timestamp: new Date(2024, 7, 16, 8, 58),
    location: {
      lat: 25.7907,
      lng: -80.13,
      address: "Brickell Office",
      accuracy: 15,
    },
    source: "mobile_app",
    isValid: true,
    flags: [],
  },
];

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: "att-1",
    workerId: "worker-1",
    date: new Date(2024, 7, 16),
    scheduledStart: new Date(2024, 7, 16, 8, 0),
    scheduledEnd: new Date(2024, 7, 16, 17, 0),
    actualStart: new Date(2024, 7, 16, 8, 5),
    actualEnd: new Date(2024, 7, 16, 17, 15),
    totalHours: 8.5,
    regularHours: 8,
    overtimeHours: 0.5,
    breakDuration: 30,
    status: "late",
    latenessMinutes: 5,
    earlyDepartureMinutes: 0,
    breaks: [
      {
        start: new Date(2024, 7, 16, 12, 0),
        end: new Date(2024, 7, 16, 12, 30),
        duration: 30,
        type: "lunch",
      },
    ],
    violations: [],
    jobs: ["job-1", "job-2"],
  },
  {
    id: "att-2",
    workerId: "worker-2",
    date: new Date(2024, 7, 16),
    scheduledStart: new Date(2024, 7, 16, 9, 0),
    scheduledEnd: new Date(2024, 7, 16, 18, 0),
    actualStart: new Date(2024, 7, 16, 8, 58),
    actualEnd: new Date(2024, 7, 16, 18, 5),
    totalHours: 9,
    regularHours: 8,
    overtimeHours: 1,
    breakDuration: 45,
    status: "present",
    latenessMinutes: 0,
    earlyDepartureMinutes: 0,
    breaks: [
      {
        start: new Date(2024, 7, 16, 12, 30),
        end: new Date(2024, 7, 16, 13, 15),
        duration: 45,
        type: "lunch",
      },
    ],
    violations: [],
    jobs: ["job-3"],
  },
];

const attendancePolicy: AttendancePolicy = {
  allowedLatenessMinutes: 15,
  gracePeridMinutes: 5,
  maxBreakDuration: 60,
  requiredBreakInterval: 240, // 4 hours
  geoFenceRadius: 100,
  workLocations: [
    {
      name: "Miami Operations Center",
      lat: 25.7617,
      lng: -80.1918,
      radius: 50,
    },
    {
      name: "Brickell Office",
      lat: 25.7907,
      lng: -80.13,
      radius: 30,
    },
  ],
  overtimeThreshold: 8,
  timeTrackingMethod: "gps_required",
};

export function TimeAttendance() {
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isTimeDetailOpen, setIsTimeDetailOpen] = useState(false);
  const [isLocationViewOpen, setIsLocationViewOpen] = useState(false);
  const [isPolicySettingsOpen, setIsPolicySettingsOpen] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Load crews and convert to workers format
  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        setIsLoading(true);
        const crewsData = await crewsApi.getAll();

        // Convert crews data to workers format
        const workersData = crewsData.map((crew: any) => ({
          id: crew.id,
          employeeId: crew.id,
          name: crew.name || `Crew ${crew.id}`,
          role: crew.type || "Crew Member",
          department: "Operations",
          email: crew.contactEmail || `crew${crew.id}@company.com`,
          shift: {
            start: "08:00",
            end: "17:00", 
            timezone: "America/New_York"
          },
          status: (crew.status === "available" || crew.status === "busy") 
            ? "clocked_in" as const
            : "clocked_out" as const,
          clockInTime: crew.lastClockIn ? new Date(crew.lastClockIn) : null,
          hoursWorkedToday: crew.hoursWorkedToday || 0,
          overtime: (crew.hoursWorkedToday || 0) > 8,
          location: crew.currentLocation || "Office",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${crew.name}`,
        }));

        setWorkers(workersData);

        // Generate time entries based on crew data  
        const entriesData: TimeEntry[] = crewsData.flatMap((crew) => [
          {
            id: `${crew.id}-in`,
            workerId: crew.id,
            type: "clock_in" as const,
            timestamp: crew.lastClockIn
              ? new Date(crew.lastClockIn)
              : new Date(),
            location: crew.currentLocation || "Office",
            notes: "Started shift",
            source: "manual_entry" as const,
            isValid: true,
            flags: [],
          },
        ]);

        setTimeEntries(entriesData);

        // Generate attendance records
        const recordsData: AttendanceRecord[] = workersData.map((worker) => ({
          id: `record-${worker.id}`,
          workerId: worker.id,
          date: new Date(),
          scheduledStart: new Date(new Date().setHours(8, 0, 0, 0)),
          scheduledEnd: new Date(new Date().setHours(17, 0, 0, 0)),
          status:
            worker.status === "clocked_in"
              ? worker.hoursWorkedToday > 0.5
                ? ("present" as const)
                : ("late" as const)
              : ("absent" as const),
          clockInTime: worker.clockInTime,
          clockOutTime: worker.status === "clocked_out" ? new Date() : null,
          regularHours: Math.min(worker.hoursWorkedToday, 8),
          overtimeHours: Math.max(0, worker.hoursWorkedToday - 8),
          totalHours: worker.hoursWorkedToday,
          overtime: worker.overtime,
          breaks: [],
          location: worker.location,
          notes: "",
          approvedBy: null,
          isExcused: false,
          breakDuration: 0,
          latenessMinutes: 0,
          earlyDepartureMinutes: 0,
          violations: [],
          jobs: [],
        }));

        setAttendanceRecords(recordsData);
      } catch (error) {
        console.error("Error loading attendance data:", error);
        // Fallback to mock data if API fails
        setWorkers(mockWorkers);
        setTimeEntries(mockTimeEntries);
        setAttendanceRecords(mockAttendanceRecords);

        toast({
          title: "Data Loading",
          description:
            "Using demo data. Connect to backend for live attendance tracking.",
          variant: "default",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendanceData();
  }, [toast]);


  // Filter workers
  const filteredWorkers = useMemo(() => {
    let filtered = workers;

    if (filterDepartment !== "all") {
      filtered = filtered.filter(
        (worker) => worker.department === filterDepartment,
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((worker) => worker.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (worker) =>
          worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [workers, filterDepartment, filterStatus, searchTerm]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const totalWorkers = workers.length;
    const presentWorkers = workers.filter((w) =>
      ["clocked_in", "on_break"].includes(w.status),
    ).length;
    const lateWorkers = attendanceRecords.filter(
      (r) => r.status === "late",
    ).length;
    const absentWorkers = attendanceRecords.filter(
      (r) => r.status === "absent",
    ).length;

    const totalHours = attendanceRecords.reduce(
      (sum, r) => sum + r.totalHours,
      0,
    );
    const overtimeHours = attendanceRecords.reduce(
      (sum, r) => sum + r.overtimeHours,
      0,
    );
    const avgHoursPerWorker = totalWorkers > 0 ? totalHours / totalWorkers : 0;
    const punctualityRate =
      totalWorkers > 0
        ? ((totalWorkers - lateWorkers) / totalWorkers) * 100
        : 0;

    const violations = attendanceRecords.reduce(
      (sum, r) => sum + r.violations.length,
      0,
    );

    return {
      totalWorkers,
      presentWorkers,
      lateWorkers,
      absentWorkers,
      totalHours,
      overtimeHours,
      avgHoursPerWorker,
      punctualityRate,
      violations,
    };
  }, [workers, attendanceRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "clocked_in":
        return "bg-green-500";
      case "clocked_out":
        return "bg-gray-500";
      case "on_break":
        return "bg-yellow-500";
      case "off_duty":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "clocked_in":
        return Play;
      case "clocked_out":
        return Square;
      case "on_break":
        return Pause;
      case "off_duty":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500";
      case "late":
        return "bg-yellow-500";
      case "absent":
        return "bg-red-500";
      case "early_departure":
        return "bg-orange-500";
      case "partial":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleClockAction = (workerId: string, action: string) => {
    console.log("Clock action:", action, "for worker:", workerId);
  };

  const handleViewLocation = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsLocationViewOpen(true);
  };

  const handleManualEntry = (workerId: string) => {
    console.log("Manual time entry for worker:", workerId);
  };

  const WorkerStatusCard = ({ worker }: { worker: Worker }) => {
    const StatusIcon = getStatusIcon(worker.status);
    const todayRecord = attendanceRecords.find(
      (r) =>
        r.workerId === worker.id &&
        r.date.toDateString() === new Date().toDateString(),
    );

    const isLate =
      todayRecord?.latenessMinutes && todayRecord.latenessMinutes > 0;
    const hoursWorked = todayRecord?.totalHours || 0;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedWorker(worker);
          setIsTimeDetailOpen(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                {worker.name}
              </CardTitle>
            </div>
            <Badge className={`${getStatusColor(worker.status)} text-white`}>
              {worker.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Employee ID</div>
              <div className="font-medium">{worker.employeeId}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Shift</div>
              <div className="font-medium">
                {worker.shift.start} - {worker.shift.end}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Hours Today</div>
              <div className="font-bold">{hoursWorked.toFixed(1)}h</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div
                className={`font-medium ${
                  isLate ? "text-red-600" : "text-green-600"
                }`}
              >
                {isLate ? `Late ${todayRecord.latenessMinutes}min` : "On Time"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{worker.location.address}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleViewLocation(worker);
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {worker.status === "clocked_out" ? (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClockAction(worker.id, "clock_in");
                }}
              >
                <Play className="w-3 h-3 mr-1" />
                Clock In
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClockAction(worker.id, "clock_out");
                }}
              >
                <Square className="w-3 h-3 mr-1" />
                Clock Out
              </Button>
            )}

            {worker.status === "clocked_in" && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClockAction(worker.id, "break_start");
                }}
              >
                <Coffee className="w-3 h-3 mr-1" />
                Break
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const AttendanceRecordCard = ({ record }: { record: AttendanceRecord }) => {
    const worker = workers.find((w) => w.id === record.workerId);

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium">{worker?.name}</div>
              <div className="text-sm text-muted-foreground">
                {format(record.date, "PPP")}
              </div>
            </div>
            <Badge
              className={`${getAttendanceStatusColor(
                record.status,
              )} text-white`}
            >
              {record.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Scheduled</div>
              <div className="font-medium">
                {format(record.scheduledStart, "HH:mm")} -{" "}
                {format(record.scheduledEnd, "HH:mm")}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Actual</div>
              <div className="font-medium">
                {record.actualStart && record.actualEnd
                  ? `${format(record.actualStart, "HH:mm")} - ${format(
                      record.actualEnd,
                      "HH:mm",
                    )}`
                  : "In Progress"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm mt-3">
            <div>
              <div className="text-muted-foreground">Total Hours</div>
              <div className="font-bold">{record.totalHours.toFixed(1)}h</div>
            </div>
            <div>
              <div className="text-muted-foreground">Overtime</div>
              <div className="font-bold">
                {record.overtimeHours.toFixed(1)}h
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Break</div>
              <div className="font-bold">{record.breakDuration}min</div>
            </div>
          </div>

          {record.latenessMinutes > 0 && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-3">
              Late by {record.latenessMinutes} minutes
            </div>
          )}

          {record.violations.length > 0 && (
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
              {record.violations.length} violation(s) detected
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Time & Attendance
          </h1>
          <p className="text-muted-foreground">
            Track worker time with GPS verification and policy enforcement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Export Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPolicySettingsOpen(true)}
          >
            <Settings className="mr-1 h-4 w-4" />
            Policy Settings
          </Button>
          <Button>
            <Timer className="mr-1 h-4 w-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceStats.presentWorkers}
            </div>
            <p className="text-xs text-muted-foreground">
              of {attendanceStats.totalWorkers} workers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Punctuality Rate
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceStats.punctualityRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {attendanceStats.lateWorkers} late today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceStats.totalHours.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {attendanceStats.overtimeHours.toFixed(1)} overtime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Hours/Worker
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceStats.avgHoursPerWorker.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceStats.violations}
            </div>
            <p className="text-xs text-muted-foreground">Need review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Live Status</TabsTrigger>
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search workers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={filterDepartment}
                  onValueChange={setFilterDepartment}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="clocked_in">Clocked In</SelectItem>
                    <SelectItem value="clocked_out">Clocked Out</SelectItem>
                    <SelectItem value="on_break">On Break</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Workers Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((worker) => (
              <WorkerStatusCard key={worker.id} worker={worker} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {attendanceRecords.map((record) => (
              <AttendanceRecordCard key={record.id} record={record} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time & Attendance Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceRecords
                  .filter((r) => r.violations.length > 0)
                  .map((record) => {
                    const worker = workers.find(
                      (w) => w.id === record.workerId,
                    );

                    return (
                      <div key={record.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{worker?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(record.date, "MMM dd, yyyy")}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {record.violations.map((violation, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <AlertCircle
                                className={`w-4 h-4 ${
                                  violation.severity === "high"
                                    ? "text-red-500"
                                    : violation.severity === "medium"
                                    ? "text-orange-500"
                                    : "text-yellow-500"
                                }`}
                              />
                              <span>{violation.description}</span>
                              <Badge
                                variant={
                                  violation.severity === "high"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {violation.severity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Hours Worked:</span>
                    <span className="font-bold">
                      {attendanceStats.totalHours * 5}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime Hours:</span>
                    <span className="font-bold">
                      {attendanceStats.overtimeHours * 5}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Punctuality:</span>
                    <span className="font-bold">
                      {attendanceStats.punctualityRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Violations:</span>
                    <span className="font-bold">
                      {attendanceStats.violations}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Policy Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>GPS Verification</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Break Compliance</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Schedule Adherence</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Time Detail Dialog */}
      <Dialog open={isTimeDetailOpen} onOpenChange={setIsTimeDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Time Details - {selectedWorker?.name}</DialogTitle>
          </DialogHeader>

          {selectedWorker && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Current Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getStatusColor(
                          selectedWorker.status,
                        )} text-white`}
                      >
                        {selectedWorker.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <strong>Shift:</strong> {selectedWorker.shift.start} -{" "}
                      {selectedWorker.shift.end}
                    </div>
                    <div className="text-sm">
                      <strong>Location:</strong>{" "}
                      {selectedWorker.location.address}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Today's Activity</h3>
                  <div className="space-y-2 text-sm">
                    {timeEntries
                      .filter((e) => e.workerId === selectedWorker.id)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {entry.type.replace("_", " ")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(entry.timestamp, "HH:mm")} •{" "}
                              {entry.location.address}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {entry.flags.map((flag) => (
                              <Badge
                                key={flag}
                                variant="outline"
                                className="text-xs"
                              >
                                {flag.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button onClick={() => handleManualEntry(selectedWorker.id)}>
                  <Edit className="mr-1 h-4 w-4" />
                  Manual Entry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleViewLocation(selectedWorker)}
                >
                  <MapPin className="mr-1 h-4 w-4" />
                  View Location
                </Button>
                <Button variant="outline">
                  <FileText className="mr-1 h-4 w-4" />
                  Time Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Location View Dialog */}
      <Dialog open={isLocationViewOpen} onOpenChange={setIsLocationViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Worker Location - {selectedWorker?.name}</DialogTitle>
          </DialogHeader>

          {selectedWorker && (
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Live GPS tracking map</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current location: {selectedWorker.location.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last updated:{" "}
                    {format(selectedWorker.location.lastUpdate, "PPp")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Coordinates</div>
                  <div className="font-mono">
                    {selectedWorker.location.lat.toFixed(6)},{" "}
                    {selectedWorker.location.lng.toFixed(6)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Geofence Status</div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Within allowed area</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Location History</h4>
                <div className="space-y-2 text-sm">
                  {timeEntries
                    .filter((e) => e.workerId === selectedWorker.id)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div>
                          <div>{entry.type.replace("_", " ")}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.location.address}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(entry.timestamp, "HH:mm")}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Policy Settings Dialog */}
      <Dialog
        open={isPolicySettingsOpen}
        onOpenChange={setIsPolicySettingsOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance Policy Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lateness">Allowed Lateness (minutes)</Label>
                <Input
                  id="lateness"
                  type="number"
                  defaultValue={attendancePolicy.allowedLatenessMinutes}
                />
              </div>
              <div>
                <Label htmlFor="grace">Grace Period (minutes)</Label>
                <Input
                  id="grace"
                  type="number"
                  defaultValue={attendancePolicy.gracePeridMinutes}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="break-duration">
                  Max Break Duration (minutes)
                </Label>
                <Input
                  id="break-duration"
                  type="number"
                  defaultValue={attendancePolicy.maxBreakDuration}
                />
              </div>
              <div>
                <Label htmlFor="geofence">Geofence Radius (meters)</Label>
                <Input
                  id="geofence"
                  type="number"
                  defaultValue={attendancePolicy.geoFenceRadius}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tracking-method">Time Tracking Method</Label>
              <Select defaultValue={attendancePolicy.timeTrackingMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gps_required">GPS Required</SelectItem>
                  <SelectItem value="gps_preferred">GPS Preferred</SelectItem>
                  <SelectItem value="manual_allowed">Manual Allowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button>Save Settings</Button>
              <Button
                variant="outline"
                onClick={() => setIsPolicySettingsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
