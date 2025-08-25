"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
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
  Camera,
  CheckCircle,
  Star,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  AlertTriangle,
  ThumbsUp,
  Filter,
  Download,
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

interface QualityPhoto {
  id: string;
  type: "before" | "after" | "during" | "issue" | "completion";
  url: string;
  thumbnail: string;
  timestamp: Date;
  location?: {
    room: string;
    area: string;
  };
  annotation?: string;
  uploadedBy: {
    id: string;
    name: string;
    role: string;
  };
}

interface QualityChecklistItem {
  id: string;
  category: string;
  task: string;
  required: boolean;
  completed: boolean;
  notes?: string;
  photosRequired: boolean;
  photos: QualityPhoto[];
  completedBy?: {
    id: string;
    name: string;
    timestamp: Date;
  };
}

interface CustomerFeedback {
  id: string;
  rating: number; // 1-5 stars
  review?: string;
  photos?: QualityPhoto[];
  categories: {
    quality: number;
    punctuality: number;
    professionalism: number;
    value: number;
  };
  wouldRecommend: boolean;
  submittedAt: Date;
  respondedAt?: Date;
  response?: string;
}

interface QualityAssurance {
  id: string;
  jobId: string;
  customerName: string;
  serviceType: string;
  crewName: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "approved";
  checklist: QualityChecklistItem[];
  photos: QualityPhoto[];
  customerFeedback?: CustomerFeedback;
  overallScore: number;
  completedAt?: Date;
  approvedBy?: {
    id: string;
    name: string;
    timestamp: Date;
  };
  issues: Array<{
    id: string;
    description: string;
    severity: "low" | "medium" | "high";
    resolved: boolean;
    photos: QualityPhoto[];
    reportedBy: string;
    reportedAt: Date;
  }>;
}

// Mock quality checklist templates
const qualityChecklists = {
  deep_clean: [
    {
      category: "Kitchen",
      task: "Clean and sanitize all countertops",
      required: true,
      photosRequired: true,
    },
    {
      category: "Kitchen",
      task: "Clean inside and outside of appliances",
      required: true,
      photosRequired: true,
    },
    {
      category: "Kitchen",
      task: "Scrub sink and faucet",
      required: true,
      photosRequired: false,
    },
    {
      category: "Kitchen",
      task: "Clean cabinet fronts and handles",
      required: true,
      photosRequired: false,
    },
    {
      category: "Bathroom",
      task: "Scrub and disinfect toilet",
      required: true,
      photosRequired: true,
    },
    {
      category: "Bathroom",
      task: "Clean shower/tub thoroughly",
      required: true,
      photosRequired: true,
    },
    {
      category: "Bathroom",
      task: "Clean mirrors and fixtures",
      required: true,
      photosRequired: false,
    },
    {
      category: "Living Areas",
      task: "Vacuum all carpets and rugs",
      required: true,
      photosRequired: false,
    },
    {
      category: "Living Areas",
      task: "Mop all hard floors",
      required: true,
      photosRequired: false,
    },
    {
      category: "Living Areas",
      task: "Dust all surfaces and furniture",
      required: true,
      photosRequired: false,
    },
    {
      category: "General",
      task: "Empty all trash bins",
      required: true,
      photosRequired: false,
    },
    {
      category: "General",
      task: "Final walkthrough completed",
      required: true,
      photosRequired: true,
    },
  ],
  regular_clean: [
    {
      category: "Kitchen",
      task: "Wipe down countertops",
      required: true,
      photosRequired: false,
    },
    {
      category: "Kitchen",
      task: "Clean sink",
      required: true,
      photosRequired: false,
    },
    {
      category: "Bathroom",
      task: "Clean toilet and sink",
      required: true,
      photosRequired: false,
    },
    {
      category: "Living Areas",
      task: "Vacuum main areas",
      required: true,
      photosRequired: false,
    },
    {
      category: "Living Areas",
      task: "Dust visible surfaces",
      required: true,
      photosRequired: false,
    },
    {
      category: "General",
      task: "Empty trash",
      required: true,
      photosRequired: false,
    },
  ],
};

// Mock data
const mockQARecords: QualityAssurance[] = [
  {
    id: "qa-1",
    jobId: "job-1",
    customerName: "Sofia Martinez",
    serviceType: "Deep Clean Blue",
    crewName: "Alpha Team",
    status: "completed",
    overallScore: 4.8,
    completedAt: new Date(2024, 7, 16, 15, 30),
    checklist: qualityChecklists.deep_clean.map((item, index) => ({
      id: `item-${index}`,
      ...item,
      completed: true,
      photos: item.photosRequired
        ? [
            {
              id: `photo-${index}`,
              type: "after" as const,
              url: `/api/photos/placeholder-${index}.jpg`,
              thumbnail: `/api/photos/thumb-${index}.jpg`,
              timestamp: new Date(2024, 7, 16, 14, 30 + index),
              location: { room: item.category, area: item.task },
              uploadedBy: {
                id: "user-1",
                name: "Carlos Rodriguez",
                role: "Team Lead",
              },
            },
          ]
        : [],
      completedBy: {
        id: "user-1",
        name: "Carlos Rodriguez",
        timestamp: new Date(2024, 7, 16, 14, 30 + index),
      },
    })),
    photos: [],
    customerFeedback: {
      id: "feedback-1",
      rating: 5,
      review:
        "Excellent service! The team was professional and thorough. My apartment looks amazing!",
      categories: { quality: 5, punctuality: 5, professionalism: 5, value: 4 },
      wouldRecommend: true,
      submittedAt: new Date(2024, 7, 16, 18, 0),
    },
    issues: [],
    approvedBy: {
      id: "supervisor-1",
      name: "Ana Silva",
      timestamp: new Date(2024, 7, 16, 16, 0),
    },
  },
  {
    id: "qa-2",
    jobId: "job-2",
    customerName: "Robert Kim",
    serviceType: "Regular House Cleaning",
    crewName: "Beta Team",
    status: "in_progress",
    overallScore: 0,
    checklist: qualityChecklists.regular_clean.map((item, index) => ({
      id: `item-${index}`,
      ...item,
      completed: index < 4,
      photos: [],
      completedBy:
        index < 4
          ? {
              id: "user-2",
              name: "Luis Martinez",
              timestamp: new Date(2024, 7, 16, 15, 0 + index * 10),
            }
          : undefined,
    })),
    photos: [],
    issues: [],
  },
];

export function QualityAssuranceSystem() {
  const [qaRecords] = useState<QualityAssurance[]>(mockQARecords);
  const [selectedRecord, setSelectedRecord] = useState<QualityAssurance | null>(
    null,
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<QualityPhoto | null>(null);

  // Filter QA records
  const filteredRecords = useMemo(() => {
    let filtered = qaRecords;

    if (filterStatus !== "all") {
      filtered = filtered.filter((record) => record.status === filterStatus);
    }

    if (filterService !== "all") {
      filtered = filtered.filter((record) =>
        record.serviceType.toLowerCase().includes(filterService.toLowerCase()),
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.crewName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [qaRecords, filterStatus, filterService, searchTerm]);

  // Calculate statistics
  const qaStats = useMemo(() => {
    const total = qaRecords.length;
    const completed = qaRecords.filter(
      (qa) => qa.status === "completed",
    ).length;
    const approved = qaRecords.filter((qa) => qa.status === "approved").length;
    const inProgress = qaRecords.filter(
      (qa) => qa.status === "in_progress",
    ).length;
    const failed = qaRecords.filter((qa) => qa.status === "failed").length;

    const avgScore =
      qaRecords
        .filter((qa) => qa.overallScore > 0)
        .reduce((sum, qa) => sum + qa.overallScore, 0) /
        qaRecords.filter((qa) => qa.overallScore > 0).length || 0;

    const customerSatisfaction =
      qaRecords
        .filter((qa) => qa.customerFeedback)
        .reduce((sum, qa) => sum + qa.customerFeedback!.rating, 0) /
        qaRecords.filter((qa) => qa.customerFeedback).length || 0;

    const totalIssues = qaRecords.reduce(
      (sum, qa) => sum + qa.issues.length,
      0,
    );
    const resolvedIssues = qaRecords.reduce(
      (sum, qa) => sum + qa.issues.filter((issue) => issue.resolved).length,
      0,
    );

    return {
      total,
      completed,
      approved,
      inProgress,
      failed,
      avgScore,
      customerSatisfaction,
      totalIssues,
      resolvedIssues,
    };
  }, [qaRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 4.0) return "text-yellow-600";
    if (score >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const QARecordCard = ({ record }: { record: QualityAssurance }) => {
    const completionPercentage =
      (record.checklist.filter((item) => item.completed).length /
        record.checklist.length) *
      100;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedRecord(record)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {record.customerName}
            </CardTitle>
            <Badge className={`${getStatusColor(record.status)} text-white`}>
              {record.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {record.serviceType}
            </span>
            <span className="text-sm font-medium">{record.crewName}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {record.overallScore > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Quality Score
              </span>
              <div className="flex items-center gap-1">
                <Star
                  className={`h-4 w-4 ${getScoreColor(record.overallScore)}`}
                />
                <span
                  className={`font-medium ${getScoreColor(
                    record.overallScore,
                  )}`}
                >
                  {record.overallScore.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {record.customerFeedback && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Customer Rating
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= record.customerFeedback!.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {record.issues.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              <span>
                {record.issues.length} issue
                {record.issues.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const PhotoGallery = ({
    photos,
    title,
  }: {
    photos: QualityPhoto[];
    title: string;
  }) => (
    <div className="space-y-2">
      <h4 className="font-medium">{title}</h4>
      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square bg-muted rounded-lg cursor-pointer overflow-hidden"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <Badge className="absolute top-1 left-1 text-xs">
              {photo.type}
            </Badge>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs">
              {photo.location?.room}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quality Assurance
          </h1>
          <p className="text-muted-foreground">
            Photo documentation and quality control for all services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Camera className="mr-1 h-4 w-4" />
            New QA Check
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total QA Checks
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qaStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {qaStats.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((qaStats.completed / qaStats.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {qaStats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Quality Score
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getScoreColor(
                qaStats.avgScore,
              )}`}
            >
              {qaStats.avgScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Satisfaction
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {qaStats.customerSatisfaction.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Issues Resolved
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qaStats.totalIssues > 0
                ? Math.round(
                    (qaStats.resolvedIssues / qaStats.totalIssues) * 100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {qaStats.resolvedIssues} of {qaStats.totalIssues}
            </p>
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
                placeholder="Search QA records..."
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
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="deep">Deep Clean</SelectItem>
                <SelectItem value="regular">Regular Clean</SelectItem>
                <SelectItem value="move">Move-out Clean</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QA Records Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecords.map((record) => (
          <QARecordCard key={record.id} record={record} />
        ))}
      </div>

      {/* QA Record Details Dialog */}
      <Dialog
        open={!!selectedRecord}
        onOpenChange={() => setSelectedRecord(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quality Assurance - {selectedRecord?.customerName}
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <Tabs defaultValue="checklist" className="w-full">
              <TabsList>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="feedback">Customer Feedback</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
              </TabsList>

              <TabsContent value="checklist" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Service</Label>
                    <p>{selectedRecord.serviceType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Crew</Label>
                    <p>{selectedRecord.crewName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge
                      className={`${getStatusColor(
                        selectedRecord.status,
                      )} text-white mt-1`}
                    >
                      {selectedRecord.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Progress</Label>
                    <p>
                      {
                        selectedRecord.checklist.filter(
                          (item) => item.completed,
                        ).length
                      }{" "}
                      / {selectedRecord.checklist.length} tasks
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(
                    selectedRecord.checklist.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {} as Record<string, QualityChecklistItem[]>),
                  ).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        {category}
                      </h4>
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              item.completed ? "bg-green-500" : "bg-gray-200"
                            }`}
                          >
                            {item.completed && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  item.completed
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }
                              >
                                {item.task}
                              </span>
                              {item.required && (
                                <Badge variant="outline" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              {item.photosRequired && (
                                <Camera className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                            {item.completedBy && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Completed by {item.completedBy.name} at{" "}
                                {format(item.completedBy.timestamp, "HH:mm")}
                              </div>
                            )}
                          </div>
                          {item.photos.length > 0 && (
                            <div className="flex gap-1">
                              {item.photos.slice(0, 3).map((photo) => (
                                <div
                                  key={photo.id}
                                  className="w-8 h-8 bg-muted rounded cursor-pointer flex items-center justify-center"
                                  onClick={() => setSelectedPhoto(photo)}
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PhotoGallery
                    photos={selectedRecord.photos.filter(
                      (p) => p.type === "before",
                    )}
                    title="Before Photos"
                  />
                  <PhotoGallery
                    photos={selectedRecord.photos.filter(
                      (p) => p.type === "after",
                    )}
                    title="After Photos"
                  />
                </div>

                <div className="border-t pt-4">
                  <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Photos
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-4">
                {selectedRecord.customerFeedback ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          Customer Review
                        </h3>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= selectedRecord.customerFeedback!.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <Badge
                        variant={
                          selectedRecord.customerFeedback.wouldRecommend
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedRecord.customerFeedback.wouldRecommend
                          ? "Would Recommend"
                          : "Would Not Recommend"}
                      </Badge>
                    </div>

                    {selectedRecord.customerFeedback.review && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="italic">
                          &quot;{selectedRecord.customerFeedback.review}&quot;
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(
                        selectedRecord.customerFeedback.categories,
                      ).map(([category, rating]) => (
                        <div
                          key={category}
                          className="text-center p-3 border rounded-lg"
                        >
                          <div className="text-sm text-muted-foreground capitalize">
                            {category}
                          </div>
                          <div className="text-lg font-bold">{rating}.0</div>
                          <div className="flex justify-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      No Customer Feedback
                    </h3>
                    <p className="text-muted-foreground">
                      Customer feedback has not been submitted yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                {selectedRecord.issues.length > 0 ? (
                  <div className="space-y-3">
                    {selectedRecord.issues.map((issue) => (
                      <div key={issue.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={
                                  issue.severity === "high"
                                    ? "destructive"
                                    : issue.severity === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {issue.severity} priority
                              </Badge>
                              <Badge
                                variant={
                                  issue.resolved ? "default" : "secondary"
                                }
                              >
                                {issue.resolved ? "Resolved" : "Open"}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{issue.description}</p>
                            <div className="text-xs text-muted-foreground">
                              Reported by {issue.reportedBy} on{" "}
                              {format(issue.reportedAt, "MMM dd, yyyy HH:mm")}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {issue.photos.length > 0 && (
                          <div className="mt-3">
                            <PhotoGallery
                              photos={issue.photos}
                              title="Issue Photos"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium mb-2">
                      No Issues Reported
                    </h3>
                    <p className="text-muted-foreground">
                      This quality check has no reported issues.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Dialog */}
      <Dialog
        open={!!selectedPhoto}
        onOpenChange={() => setSelectedPhoto(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Photo Details</DialogTitle>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="capitalize">{selectedPhoto.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p>{format(selectedPhoto.timestamp, "PPpp")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p>
                    {selectedPhoto.location?.room} -{" "}
                    {selectedPhoto.location?.area}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uploaded By</Label>
                  <p>{selectedPhoto.uploadedBy.name}</p>
                </div>
              </div>

              {selectedPhoto.annotation && (
                <div>
                  <Label className="text-sm font-medium">Annotation</Label>
                  <p className="text-sm bg-muted p-2 rounded">
                    {selectedPhoto.annotation}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
