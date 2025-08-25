"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  Plus,
  Edit,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Smartphone,
  Settings,
  BarChart3,
  Eye,
  Play,
  Pause,
  Users,
} from "lucide-react";
import { format, isToday } from "date-fns";

interface NotificationTemplate {
  id: string;
  name: string;
  type: "email" | "sms" | "push";
  trigger:
    | "job_scheduled"
    | "job_started"
    | "job_completed"
    | "payment_due"
    | "payment_received"
    | "reminder"
    | "custom";
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  channels: ("email" | "sms" | "push")[];
  audience: {
    customerTypes: string[];
    regions?: string[];
    totalRecipients: number;
  };
  schedule: {
    type: "immediate" | "scheduled" | "recurring";
    sendAt?: Date;
    timezone: string;
  };
  template: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
  createdAt: Date;
  sentAt?: Date;
}

interface NotificationLog {
  id: string;
  type: "email" | "sms" | "push";
  recipient: {
    id: string;
    name: string;
    contact: string;
  };
  subject?: string;
  content: string;
  status:
    | "pending"
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "failed"
    | "bounced";
  trigger: string;
  templateId?: string;
  campaignId?: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  cost: number;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    event: string;
    conditions: Record<string, unknown>;
  };
  actions: Array<{
    type: "send_notification";
    templateId: string;
    channels: ("email" | "sms" | "push")[];
    delay?: number; // minutes
  }>;
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  executionCount: number;
}

// Mock data
const mockTemplates: NotificationTemplate[] = [
  {
    id: "template-1",
    name: "Job Confirmation",
    type: "email",
    trigger: "job_scheduled",
    subject: "Your Limpia cleaning is confirmed for {{date}}",
    content:
      "Hi {{customerName}},\n\nYour cleaning service is confirmed for {{date}} at {{time}}. Our team {{crewName}} will arrive at your location.\n\nService: {{serviceName}}\nEstimated duration: {{duration}} hours\n\nIf you have any questions, please contact us at support@limpia.com.\n\nThank you for choosing Limpia!",
    variables: [
      "customerName",
      "date",
      "time",
      "crewName",
      "serviceName",
      "duration",
    ],
    isActive: true,
    createdAt: new Date(2024, 6, 15),
    lastUsed: new Date(2024, 7, 16),
    usageCount: 42,
  },
  {
    id: "template-2",
    name: "Service Complete SMS",
    type: "sms",
    trigger: "job_completed",
    content:
      "Hi {{customerName}}! Your cleaning service is complete. Rate your experience: {{ratingLink}}. Thank you for choosing Limpia!",
    variables: ["customerName", "ratingLink"],
    isActive: true,
    createdAt: new Date(2024, 6, 20),
    lastUsed: new Date(2024, 7, 16),
    usageCount: 38,
  },
  {
    id: "template-3",
    name: "Payment Reminder",
    type: "email",
    trigger: "payment_due",
    subject: "Payment Reminder - Invoice {{invoiceNumber}}",
    content:
      "Dear {{customerName}},\n\nThis is a friendly reminder that payment for invoice {{invoiceNumber}} is due on {{dueDate}}.\n\nAmount due: ${{amount}}\n\nYou can pay securely online: {{paymentLink}}\n\nThank you for your business!",
    variables: [
      "customerName",
      "invoiceNumber",
      "dueDate",
      "amount",
      "paymentLink",
    ],
    isActive: true,
    createdAt: new Date(2024, 6, 25),
    lastUsed: new Date(2024, 7, 15),
    usageCount: 15,
  },
];

const mockCampaigns: NotificationCampaign[] = [
  {
    id: "campaign-1",
    name: "Summer Cleaning Special",
    description: "Promotional campaign for summer deep cleaning services",
    channels: ["email", "sms"],
    audience: {
      customerTypes: ["residential", "recurring"],
      regions: ["Miami", "Fort Lauderdale"],
      totalRecipients: 1250,
    },
    schedule: {
      type: "scheduled",
      sendAt: new Date(2024, 7, 20, 10, 0),
      timezone: "EST",
    },
    template: "template-promo-1",
    status: "scheduled",
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
    },
    createdAt: new Date(2024, 7, 16),
  },
  {
    id: "campaign-2",
    name: "Customer Satisfaction Survey",
    description: "Monthly survey to collect customer feedback",
    channels: ["email"],
    audience: {
      customerTypes: ["all"],
      totalRecipients: 320,
    },
    schedule: {
      type: "immediate" as const,
      timezone: "EST",
    },
    template: "template-survey-1",
    status: "sent",
    metrics: {
      sent: 320,
      delivered: 315,
      opened: 189,
      clicked: 67,
      bounced: 5,
    },
    createdAt: new Date(2024, 7, 1),
    sentAt: new Date(2024, 7, 1, 14, 30),
  },
];

const mockLogs: NotificationLog[] = [
  {
    id: "log-1",
    type: "email",
    recipient: {
      id: "cus-1",
      name: "Sofia Martinez",
      contact: "sofia@email.com",
    },
    subject: "Your Limpia cleaning is confirmed for Aug 16",
    content: "Hi Sofia, Your cleaning service is confirmed...",
    status: "opened",
    trigger: "job_scheduled",
    templateId: "template-1",
    sentAt: new Date(2024, 7, 16, 9, 0),
    deliveredAt: new Date(2024, 7, 16, 9, 1),
    openedAt: new Date(2024, 7, 16, 10, 15),
    cost: 0.012,
  },
  {
    id: "log-2",
    type: "sms",
    recipient: { id: "cus-2", name: "Robert Kim", contact: "+1-305-555-0456" },
    content: "Hi Robert! Your cleaning service is complete...",
    status: "delivered",
    trigger: "job_completed",
    templateId: "template-2",
    sentAt: new Date(2024, 7, 16, 15, 30),
    deliveredAt: new Date(2024, 7, 16, 15, 32),
    cost: 0.045,
  },
  {
    id: "log-3",
    type: "email",
    recipient: {
      id: "cus-3",
      name: "Maria Rodriguez",
      contact: "maria@email.com",
    },
    subject: "Payment Reminder - Invoice INV-2024-003",
    content: "Dear Maria, This is a friendly reminder...",
    status: "bounced",
    trigger: "payment_due",
    templateId: "template-3",
    sentAt: new Date(2024, 7, 15, 16, 0),
    errorMessage: "Invalid email address",
    cost: 0.012,
  },
];

const mockAutomations: AutomationRule[] = [
  {
    id: "automation-1",
    name: "Job Confirmation Sequence",
    trigger: {
      event: "job_scheduled",
      conditions: { serviceType: "all" },
    },
    actions: [
      {
        type: "send_notification",
        templateId: "template-1",
        channels: ["email"],
        delay: 0,
      },
      {
        type: "send_notification",
        templateId: "reminder-24h",
        channels: ["sms"],
        delay: 1440, // 24 hours
      },
    ],
    isActive: true,
    createdAt: new Date(2024, 6, 15),
    lastTriggered: new Date(2024, 7, 16),
    executionCount: 156,
  },
];

export function NotificationCenter() {
  const [templates] = useState<NotificationTemplate[]>(mockTemplates);
  const [campaigns] = useState<NotificationCampaign[]>(mockCampaigns);
  const [logs] = useState<NotificationLog[]>(mockLogs);
  const [automations] = useState<AutomationRule[]>(mockAutomations);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (filterType !== "all") {
      filtered = filtered.filter((log) => log.type === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((log) => log.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.recipient.contact
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (log.subject &&
            log.subject.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    return filtered.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }, [logs, filterType, filterStatus, searchTerm]);

  // Calculate statistics
  const notificationStats = useMemo(() => {
    const totalSent = logs.length;
    const delivered = logs.filter((log) =>
      ["delivered", "opened", "clicked"].includes(log.status),
    ).length;
    const opened = logs.filter((log) =>
      ["opened", "clicked"].includes(log.status),
    ).length;
    const clicked = logs.filter((log) => log.status === "clicked").length;
    const failed = logs.filter((log) =>
      ["failed", "bounced"].includes(log.status),
    ).length;

    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
    const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;

    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const todayLogs = logs.filter((log) => isToday(log.sentAt));

    return {
      totalSent,
      delivered,
      opened,
      clicked,
      failed,
      deliveryRate,
      openRate,
      clickRate,
      totalCost,
      sentToday: todayLogs.length,
    };
  }, [logs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "opened":
      case "clicked":
        return "bg-green-500";
      case "sent":
      case "pending":
        return "bg-blue-500";
      case "failed":
      case "bounced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
      case "opened":
      case "clicked":
        return CheckCircle;
      case "failed":
      case "bounced":
        return AlertTriangle;
      case "pending":
        return Clock;
      default:
        return Bell;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail;
      case "sms":
        return MessageSquare;
      case "push":
        return Smartphone;
      default:
        return Bell;
    }
  };

  const handleSendTest = (templateId: string) => {
    console.log("Sending test notification for template:", templateId);
  };

  const handleCreateTemplate = () => {
    console.log("Creating new template");
    setIsTemplateDialogOpen(false);
  };

  const handleCreateCampaign = () => {
    console.log("Creating new campaign");
    setIsCampaignDialogOpen(false);
  };

  const TemplateCard = ({ template }: { template: NotificationTemplate }) => {
    const ChannelIcon = getChannelIcon(template.type);

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => console.log("Template selected:", template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {template.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={template.isActive ? "default" : "secondary"}>
                <ChannelIcon className="w-3 h-3 mr-1" />
                {template.type}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Trigger: {template.trigger.replace("_", " ")}
          </div>
          <div className="text-xs text-muted-foreground">
            Used {template.usageCount} times
          </div>
          {template.lastUsed && (
            <div className="text-xs text-muted-foreground">
              Last used: {format(template.lastUsed, "MMM dd, yyyy")}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const CampaignCard = ({ campaign }: { campaign: NotificationCampaign }) => {
    const completionRate =
      campaign.metrics.sent > 0
        ? (campaign.metrics.delivered / campaign.metrics.sent) * 100
        : 0;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => console.log("Campaign selected:", campaign)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {campaign.name}
            </CardTitle>
            <Badge className={`${getStatusColor(campaign.status)} text-white`}>
              {campaign.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{campaign.audience.totalRecipients} recipients</span>
          </div>
          <div className="flex items-center gap-1">
            {campaign.channels.map((channel) => {
              const Icon = getChannelIcon(channel);
              return (
                <Icon key={channel} className="w-3 h-3 text-muted-foreground" />
              );
            })}
          </div>
          {campaign.metrics.sent > 0 && (
            <div className="text-xs text-muted-foreground">
              {completionRate.toFixed(1)}% delivery rate
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
            Notification Center
          </h1>
          <p className="text-muted-foreground">
            Multi-channel communication management for customers and teams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-1 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-1 h-4 w-4" />
            Analytics
          </Button>
          <Button onClick={() => setIsTemplateDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationStats.sentToday}
            </div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.totalSent} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationStats.deliveryRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.delivered} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationStats.openRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.opened} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationStats.clickRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.clicked} clicked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${notificationStats.totalCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {logs.slice(0, 5).map((log) => {
                  const StatusIcon = getStatusIcon(log.status);
                  const ChannelIcon = getChannelIcon(log.type);

                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {log.recipient.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.subject || log.content.substring(0, 40) + "..."}
                        </div>
                      </div>
                      <Badge
                        className={`${getStatusColor(log.status)} text-white`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {log.status}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates
                  .filter((t) => t.isActive)
                  .slice(0, 5)
                  .map((template) => {
                    const ChannelIcon = getChannelIcon(template.type);

                    return (
                      <div
                        key={template.id}
                        className="flex items-center gap-3 p-2 border rounded"
                      >
                        <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {template.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {template.usageCount} uses
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendTest(template.id)}
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsTemplateDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              New Template
            </Button>
            <div className="flex-1" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsCampaignDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              New Campaign
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="clicked">Clicked</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject/Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const StatusIcon = getStatusIcon(log.status);
                    const ChannelIcon = getChannelIcon(log.type);

                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.recipient.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.recipient.contact}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="capitalize">{log.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {log.subject && (
                              <div className="font-medium text-sm">
                                {log.subject}
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground truncate">
                              {log.content}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getStatusColor(
                              log.status,
                            )} text-white`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(log.sentAt, "MMM dd, HH:mm")}
                        </TableCell>
                        <TableCell className="text-sm">
                          ${log.cost.toFixed(3)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <div className="flex items-center gap-4">
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              New Automation
            </Button>
          </div>

          <div className="grid gap-4">
            {automations.map((automation) => (
              <Card key={automation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{automation.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={automation.isActive ? "default" : "secondary"}
                      >
                        {automation.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        {automation.isActive ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Trigger:</strong>{" "}
                    {automation.trigger.event.replace("_", " ")}
                  </div>
                  <div className="text-sm">
                    <strong>Actions:</strong> {automation.actions.length} step
                    {automation.actions.length > 1 ? "s" : ""}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Executed {automation.executionCount} times
                    {automation.lastTriggered && (
                      <span>
                        {" "}
                        • Last triggered{" "}
                        {format(automation.lastTriggered, "MMM dd, yyyy")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input placeholder="Enter template name" />
              </div>
              <div>
                <Label htmlFor="template-type">Channel</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-trigger">Trigger Event</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_scheduled">Job Scheduled</SelectItem>
                  <SelectItem value="job_started">Job Started</SelectItem>
                  <SelectItem value="job_completed">Job Completed</SelectItem>
                  <SelectItem value="payment_due">Payment Due</SelectItem>
                  <SelectItem value="payment_received">
                    Payment Received
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="template-subject">Subject (Email only)</Label>
              <Input placeholder="Enter email subject" />
            </div>

            <div>
              <Label htmlFor="template-content">Message Content</Label>
              <Textarea
                placeholder="Enter message content. Use {{variable}} for dynamic content."
                className="min-h-32"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleCreateTemplate}>Create Template</Button>
              <Button
                variant="outline"
                onClick={() => setIsTemplateDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Dialog */}
      <Dialog
        open={isCampaignDialogOpen}
        onOpenChange={setIsCampaignDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input placeholder="Enter campaign name" />
            </div>

            <div>
              <Label htmlFor="campaign-description">Description</Label>
              <Textarea placeholder="Describe your campaign" />
            </div>

            <div>
              <Label>Channels</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <MessageSquare className="w-4 h-4" />
                  SMS
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <Smartphone className="w-4 h-4" />
                  Push
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="campaign-template">Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleCreateCampaign}>Create Campaign</Button>
              <Button
                variant="outline"
                onClick={() => setIsCampaignDialogOpen(false)}
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
