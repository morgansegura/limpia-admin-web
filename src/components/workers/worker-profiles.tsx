"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  User,
  Star,
  Target,
  MapPin,
  Phone,
  Mail,
  Users,
  BookOpen,
  Edit,
  Download,
  Upload,
  MessageSquare,
  FileText,
  BarChart3,
  Shield,
  GraduationCap,
  Search,
} from "lucide-react";
import { format, subDays } from "date-fns";

interface WorkerProfile {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: Date;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    profileImage?: string;
  };
  employment: {
    employeeId: string;
    role: "lead" | "cleaner" | "trainee" | "sales" | "manager";
    department: "operations" | "sales" | "management";
    hireDate: Date;
    status: "active" | "inactive" | "on_leave" | "probation";
    manager: string;
    workLocation: string;
    employmentType: "full_time" | "part_time" | "contract";
  };
  performance: {
    overallRating: number;
    customerRating: number;
    punctualityScore: number;
    qualityScore: number;
    efficiencyScore: number;
    teamworkScore: number;
    communicationScore: number;
    lastReviewDate: Date;
    nextReviewDate: Date;
    improvementAreas: string[];
    strengths: string[];
  };
  goals: {
    id: string;
    title: string;
    description: string;
    category: "performance" | "skill" | "career" | "productivity";
    target: number;
    current: number;
    unit: string;
    deadline: Date;
    status: "active" | "completed" | "overdue" | "paused";
    priority: "low" | "medium" | "high";
  }[];
  training: {
    id: string;
    courseName: string;
    category:
      | "safety"
      | "technical"
      | "customer_service"
      | "leadership"
      | "compliance";
    status: "not_started" | "in_progress" | "completed" | "expired";
    progress: number;
    startDate?: Date;
    completionDate?: Date;
    expiryDate?: Date;
    certificateUrl?: string;
    isRequired: boolean;
    score?: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    category:
      | "performance"
      | "customer_service"
      | "teamwork"
      | "innovation"
      | "safety";
    earnedDate: Date;
    badgeIcon: string;
    points: number;
  }[];
  workStats: {
    totalJobs: number;
    completedJobs: number;
    hoursWorked: number;
    avgJobTime: number;
    customerFeedback: number;
    punctualityRate: number;
    absenteeism: number;
    overtimeHours: number;
  };
  skills: {
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    category: "technical" | "soft" | "safety" | "equipment";
    certifiedDate?: Date;
    lastUsed: Date;
  }[];
  notes: {
    id: string;
    date: Date;
    author: string;
    type: "performance" | "disciplinary" | "recognition" | "general";
    content: string;
    isPrivate: boolean;
  }[];
}

// Mock data
const mockProfiles: WorkerProfile[] = [
  {
    id: "worker-1",
    personalInfo: {
      name: "Maria Santos",
      email: "maria.santos@limpia.com",
      phone: "+1 (305) 555-0101",
      address: "1234 Ocean Drive, Miami Beach, FL 33139",
      dateOfBirth: new Date(1985, 6, 15),
      emergencyContact: {
        name: "Carlos Santos",
        phone: "+1 (305) 555-0199",
        relationship: "Spouse",
      },
      profileImage: "/avatars/maria.jpg",
    },
    employment: {
      employeeId: "EMP-001",
      role: "lead",
      department: "operations",
      hireDate: new Date(2023, 5, 15),
      status: "active",
      manager: "Jennifer Rodriguez",
      workLocation: "Miami Operations Center",
      employmentType: "full_time",
    },
    performance: {
      overallRating: 4.8,
      customerRating: 4.9,
      punctualityScore: 95,
      qualityScore: 92,
      efficiencyScore: 88,
      teamworkScore: 96,
      communicationScore: 90,
      lastReviewDate: new Date(2024, 5, 15),
      nextReviewDate: new Date(2024, 11, 15),
      improvementAreas: [
        "Time management on large jobs",
        "Equipment maintenance",
      ],
      strengths: [
        "Customer communication",
        "Team leadership",
        "Problem solving",
      ],
    },
    goals: [
      {
        id: "goal-1",
        title: "Customer Rating Improvement",
        description: "Maintain customer rating above 4.8",
        category: "performance",
        target: 4.8,
        current: 4.9,
        unit: "stars",
        deadline: new Date(2024, 11, 31),
        status: "completed",
        priority: "high",
      },
      {
        id: "goal-2",
        title: "Team Leadership Certification",
        description: "Complete advanced team leadership training",
        category: "skill",
        target: 100,
        current: 75,
        unit: "percent",
        deadline: new Date(2024, 9, 30),
        status: "active",
        priority: "medium",
      },
    ],
    training: [
      {
        id: "train-1",
        courseName: "Advanced Cleaning Techniques",
        category: "technical",
        status: "completed",
        progress: 100,
        startDate: new Date(2024, 5, 1),
        completionDate: new Date(2024, 5, 15),
        certificateUrl: "/certificates/maria-advanced-cleaning.pdf",
        isRequired: true,
        score: 95,
      },
      {
        id: "train-2",
        courseName: "Safety Protocols Update 2024",
        category: "safety",
        status: "completed",
        progress: 100,
        startDate: new Date(2024, 0, 10),
        completionDate: new Date(2024, 0, 25),
        expiryDate: new Date(2025, 0, 25),
        isRequired: true,
        score: 98,
      },
      {
        id: "train-3",
        courseName: "Team Leadership Fundamentals",
        category: "leadership",
        status: "in_progress",
        progress: 75,
        startDate: new Date(2024, 6, 1),
        isRequired: false,
      },
    ],
    achievements: [
      {
        id: "ach-1",
        title: "Customer Champion",
        description: "Maintained 4.8+ customer rating for 6 months",
        category: "customer_service",
        earnedDate: new Date(2024, 6, 15),
        badgeIcon: "🏆",
        points: 100,
      },
      {
        id: "ach-2",
        title: "Perfect Attendance",
        description: "No absences for 3 months",
        category: "performance",
        earnedDate: new Date(2024, 7, 1),
        badgeIcon: "⭐",
        points: 50,
      },
    ],
    workStats: {
      totalJobs: 234,
      completedJobs: 230,
      hoursWorked: 1680,
      avgJobTime: 145,
      customerFeedback: 4.9,
      punctualityRate: 95,
      absenteeism: 2,
      overtimeHours: 45,
    },
    skills: [
      {
        name: "Deep Cleaning",
        level: "expert",
        category: "technical",
        certifiedDate: new Date(2024, 5, 15),
        lastUsed: new Date(),
      },
      {
        name: "Customer Service",
        level: "advanced",
        category: "soft",
        lastUsed: new Date(),
      },
      {
        name: "Team Leadership",
        level: "advanced",
        category: "soft",
        lastUsed: new Date(),
      },
      {
        name: "Steam Cleaning Equipment",
        level: "intermediate",
        category: "equipment",
        lastUsed: subDays(new Date(), 3),
      },
    ],
    notes: [
      {
        id: "note-1",
        date: new Date(2024, 7, 15),
        author: "Jennifer Rodriguez",
        type: "recognition",
        content:
          "Excellent leadership during the busy summer season. Helped train 3 new team members.",
        isPrivate: false,
      },
      {
        id: "note-2",
        date: new Date(2024, 6, 10),
        author: "Jennifer Rodriguez",
        type: "performance",
        content:
          "Customer specifically requested Maria for repeat service. Great feedback on attention to detail.",
        isPrivate: false,
      },
    ],
  },
];

export function WorkerProfiles() {
  const [profiles] = useState<WorkerProfile[]>(mockProfiles);
  const [selectedProfile, setSelectedProfile] = useState<WorkerProfile | null>(
    null,
  );
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let filtered = profiles;

    if (filterDepartment !== "all") {
      filtered = filtered.filter(
        (profile) => profile.employment.department === filterDepartment,
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (profile) => profile.employment.status === filterStatus,
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (profile) =>
          profile.personalInfo.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          profile.personalInfo.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          profile.employment.employeeId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [profiles, filterDepartment, filterStatus, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "on_leave":
        return "bg-yellow-500";
      case "probation":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "lead":
        return Star;
      case "sales":
        return Target;
      case "manager":
        return Users;
      case "trainee":
        return GraduationCap;
      default:
        return User;
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-purple-500";
      case "advanced":
        return "bg-blue-500";
      case "intermediate":
        return "bg-green-500";
      case "beginner":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "active":
        return "bg-blue-500";
      case "overdue":
        return "bg-red-500";
      case "paused":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTrainingStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "not_started":
        return "bg-gray-500";
      case "expired":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleEditProfile = (profile: WorkerProfile) => {
    setSelectedProfile(profile);
    setIsEditProfileOpen(true);
  };

  const handleAddGoal = (profileId: string) => {
    console.log("Adding goal for profile:", profileId);
  };

  const handleUpdateTraining = (profileId: string, trainingId: string) => {
    console.log("Updating training:", trainingId, "for profile:", profileId);
  };

  const ProfileCard = ({ profile }: { profile: WorkerProfile }) => {
    const RoleIcon = getRoleIcon(profile.employment.role);
    const completionRate =
      (profile.workStats.completedJobs / profile.workStats.totalJobs) * 100;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedProfile(profile);
          setIsProfileDetailOpen(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              {profile.personalInfo.profileImage ? (
                <Image
                  src={profile.personalInfo.profileImage}
                  alt={profile.personalInfo.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">
                {profile.personalInfo.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RoleIcon className="w-4 h-4" />
                <span className="capitalize">{profile.employment.role}</span>
                <span>•</span>
                <span>{profile.employment.employeeId}</span>
              </div>
            </div>
            <Badge
              className={`${getStatusColor(
                profile.employment.status,
              )} text-white`}
            >
              {profile.employment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Overall Rating
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">
                  {profile.performance.overallRating}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Job Completion
              </div>
              <div className="font-bold">{completionRate.toFixed(1)}%</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">
              Performance Scores
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Quality</span>
                <span>{profile.performance.qualityScore}%</span>
              </div>
              <Progress
                value={profile.performance.qualityScore}
                className="h-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {profile.workStats.totalJobs} jobs completed
            </span>
            <span className="text-muted-foreground">
              {profile.goals.filter((g) => g.status === "active").length} active
              goals
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleEditProfile(profile);
              }}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                console.log("View performance details");
              }}
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Performance
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
          <h1 className="text-2xl font-bold tracking-tight">Worker Profiles</h1>
          <p className="text-muted-foreground">
            Manage employee profiles, performance, and development
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Export Profiles
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-1 h-4 w-4" />
            Import Data
          </Button>
          <Button>
            <User className="mr-1 h-4 w-4" />
            Add Worker
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
            <p className="text-xs text-muted-foreground">
              {profiles.filter((p) => p.employment.status === "active").length}{" "}
              active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Performance
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                profiles.reduce(
                  (sum, p) => sum + p.performance.overallRating,
                  0,
                ) / profiles.length
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Team average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Training Progress
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.reduce(
                (sum, p) =>
                  sum +
                  p.training.filter((t) => t.status === "completed").length,
                0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.reduce(
                (sum, p) =>
                  sum + p.goals.filter((g) => g.status === "active").length,
                0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

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
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Profiles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      {/* Profile Detail Dialog */}
      <Dialog open={isProfileDetailOpen} onOpenChange={setIsProfileDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Worker Profile - {selectedProfile?.personalInfo.name}
            </DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  {/* Personal Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          {selectedProfile.personalInfo.profileImage ? (
                            <Image
                              src={selectedProfile.personalInfo.profileImage}
                              alt={selectedProfile.personalInfo.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold">
                            {selectedProfile.personalInfo.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedProfile.employment.employeeId}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedProfile.personalInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedProfile.personalInfo.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs">
                            {selectedProfile.personalInfo.address}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Employment Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Employment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Role:</strong>{" "}
                          {selectedProfile.employment.role}
                        </div>
                        <div>
                          <strong>Department:</strong>{" "}
                          {selectedProfile.employment.department}
                        </div>
                        <div>
                          <strong>Hire Date:</strong>{" "}
                          {format(selectedProfile.employment.hireDate, "PPP")}
                        </div>
                        <div>
                          <strong>Manager:</strong>{" "}
                          {selectedProfile.employment.manager}
                        </div>
                        <div>
                          <strong>Location:</strong>{" "}
                          {selectedProfile.employment.workLocation}
                        </div>
                        <div>
                          <strong>Status:</strong>
                          <Badge
                            className={`ml-2 ${getStatusColor(
                              selectedProfile.employment.status,
                            )} text-white`}
                          >
                            {selectedProfile.employment.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">
                            Total Jobs
                          </div>
                          <div className="font-bold">
                            {selectedProfile.workStats.totalJobs}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Completed</div>
                          <div className="font-bold">
                            {selectedProfile.workStats.completedJobs}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Hours</div>
                          <div className="font-bold">
                            {selectedProfile.workStats.hoursWorked}h
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Rating</div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">
                              {selectedProfile.performance.overallRating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProfile.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center gap-3 p-3 border rounded"
                        >
                          <div className="text-2xl">
                            {achievement.badgeIcon}
                          </div>
                          <div>
                            <div className="font-medium">
                              {achievement.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {achievement.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(achievement.earnedDate, "MMM dd, yyyy")} •{" "}
                              {achievement.points} points
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Performance Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          label: "Overall Rating",
                          value: selectedProfile.performance.overallRating * 20,
                          max: 100,
                        },
                        {
                          label: "Quality Score",
                          value: selectedProfile.performance.qualityScore,
                          max: 100,
                        },
                        {
                          label: "Efficiency",
                          value: selectedProfile.performance.efficiencyScore,
                          max: 100,
                        },
                        {
                          label: "Punctuality",
                          value: selectedProfile.performance.punctualityScore,
                          max: 100,
                        },
                        {
                          label: "Teamwork",
                          value: selectedProfile.performance.teamworkScore,
                          max: 100,
                        },
                        {
                          label: "Communication",
                          value: selectedProfile.performance.communicationScore,
                          max: 100,
                        },
                      ].map((metric) => (
                        <div key={metric.label} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{metric.label}</span>
                            <span>{metric.value}%</span>
                          </div>
                          <Progress value={metric.value} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Strengths & Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">
                          Strengths
                        </h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selectedProfile.performance.strengths.map(
                            (strength, idx) => (
                              <li key={idx}>{strength}</li>
                            ),
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-orange-600 mb-2">
                          Areas for Improvement
                        </h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selectedProfile.performance.improvementAreas.map(
                            (area, idx) => (
                              <li key={idx}>{area}</li>
                            ),
                          )}
                        </ul>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="text-sm">
                          <div>
                            <strong>Last Review:</strong>{" "}
                            {format(
                              selectedProfile.performance.lastReviewDate,
                              "PPP",
                            )}
                          </div>
                          <div>
                            <strong>Next Review:</strong>{" "}
                            {format(
                              selectedProfile.performance.nextReviewDate,
                              "PPP",
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Active Goals</h3>
                  <Button onClick={() => handleAddGoal(selectedProfile.id)}>
                    <Target className="mr-1 h-4 w-4" />
                    Add Goal
                  </Button>
                </div>

                <div className="grid gap-4">
                  {selectedProfile.goals.map((goal) => (
                    <Card key={goal.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{goal.title}</h4>
                              <Badge
                                className={`${getGoalStatusColor(
                                  goal.status,
                                )} text-white`}
                              >
                                {goal.status}
                              </Badge>
                              <Badge variant="outline">{goal.priority}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {goal.description}
                            </p>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>
                                  {goal.current} / {goal.target} {goal.unit}
                                </span>
                              </div>
                              <Progress
                                value={(goal.current / goal.target) * 100}
                                className="h-2"
                              />
                            </div>

                            <div className="text-xs text-muted-foreground mt-2">
                              Deadline: {format(goal.deadline, "PPP")}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="training" className="space-y-6">
                <div className="grid gap-4">
                  {selectedProfile.training.map((training) => (
                    <Card key={training.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">
                                {training.courseName}
                              </h4>
                              <Badge
                                className={`${getTrainingStatusColor(
                                  training.status,
                                )} text-white`}
                              >
                                {training.status}
                              </Badge>
                              {training.isRequired && (
                                <Badge variant="destructive">Required</Badge>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{training.progress}%</span>
                              </div>
                              <Progress
                                value={training.progress}
                                className="h-2"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-muted-foreground">
                              {training.startDate && (
                                <div>
                                  Started:{" "}
                                  {format(training.startDate, "MMM dd, yyyy")}
                                </div>
                              )}
                              {training.completionDate && (
                                <div>
                                  Completed:{" "}
                                  {format(
                                    training.completionDate,
                                    "MMM dd, yyyy",
                                  )}
                                </div>
                              )}
                              {training.expiryDate && (
                                <div>
                                  Expires:{" "}
                                  {format(training.expiryDate, "MMM dd, yyyy")}
                                </div>
                              )}
                              {training.score && (
                                <div>Score: {training.score}%</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {training.certificateUrl && (
                              <Button size="sm" variant="outline">
                                <FileText className="w-3 h-3 mr-1" />
                                Certificate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateTraining(
                                  selectedProfile.id,
                                  training.id,
                                )
                              }
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                <div className="grid gap-4">
                  {Object.entries(
                    selectedProfile.skills.reduce(
                      (acc, skill) => {
                        if (!acc[skill.category]) acc[skill.category] = [];
                        acc[skill.category].push(skill);
                        return acc;
                      },
                      {} as Record<string, typeof selectedProfile.skills>,
                    ),
                  ).map(([category, skills]) => (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="text-lg capitalize">
                          {category} Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {skills.map((skill, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div>
                                <div className="font-medium">{skill.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Last used:{" "}
                                  {format(skill.lastUsed, "MMM dd, yyyy")}
                                </div>
                                {skill.certifiedDate && (
                                  <div className="text-xs text-green-600">
                                    Certified:{" "}
                                    {format(
                                      skill.certifiedDate,
                                      "MMM dd, yyyy",
                                    )}
                                  </div>
                                )}
                              </div>
                              <Badge
                                className={`${getSkillLevelColor(
                                  skill.level,
                                )} text-white`}
                              >
                                {skill.level}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Performance Notes</h3>
                  <Button>
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Add Note
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedProfile.notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                note.type === "recognition"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {note.type}
                            </Badge>
                            {note.isPrivate && (
                              <Badge variant="secondary">
                                <Shield className="w-3 h-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(note.date, "PPp")} by {note.author}
                          </div>
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Worker Profile</DialogTitle>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={selectedProfile.personalInfo.name}
                  />
                </div>
                <div>
                  <Label htmlFor="employee-id">Employee ID</Label>
                  <Input
                    id="employee-id"
                    defaultValue={selectedProfile.employment.employeeId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue={selectedProfile.employment.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trainee">Trainee</SelectItem>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                      <SelectItem value="lead">Team Lead</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={selectedProfile.employment.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="probation">Probation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any relevant notes..."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button>Save Changes</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditProfileOpen(false)}
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
