"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  DollarSign,
  Link,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Users,
  MapPin,
  CreditCard,
  FileText,
  Bell,
  Mail,
  MessageSquare,
  Database,
  Cloud,
  Zap,
  Download,
  Upload,
  Eye,
  Shield,
  Key,
} from "lucide-react";
import { format, subDays } from "date-fns";

interface Integration {
  id: string;
  name: string;
  provider: string;
  category:
    | "calendar"
    | "accounting"
    | "payment"
    | "communication"
    | "crm"
    | "productivity";
  description: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  isEnabled: boolean;
  lastSync?: Date;
  nextSync?: Date;
  syncFrequency: "realtime" | "hourly" | "daily" | "weekly" | "manual";
  connectedAt?: Date;
  credentials: {
    isConfigured: boolean;
    expiresAt?: Date;
    scopes: string[];
  };
  settings: {
    bidirectionalSync: boolean;
    autoCreateEvents: boolean;
    notifyOnSync: boolean;
    customMapping: Record<string, string>;
  };
  metrics: {
    totalSyncs: number;
    lastSyncDuration: number;
    errorCount: number;
    recordsSynced: number;
  };
  features: string[];
  requirements: string[];
}

interface SyncLog {
  id: string;
  integrationId: string;
  timestamp: Date;
  status: "success" | "error" | "warning";
  recordsProcessed: number;
  duration: number;
  message: string;
  details?: string;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastDelivery?: Date;
  successRate: number;
}

// Mock data
const mockIntegrations: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    provider: "Google",
    category: "calendar",
    description:
      "Sync appointments and schedule crew assignments directly to Google Calendar",
    status: "connected",
    isEnabled: true,
    lastSync: new Date(2024, 7, 16, 14, 30),
    nextSync: new Date(2024, 7, 16, 15, 30),
    syncFrequency: "hourly",
    connectedAt: new Date(2024, 7, 1),
    credentials: {
      isConfigured: true,
      expiresAt: new Date(2024, 11, 1),
      scopes: ["calendar.events", "calendar.readonly"],
    },
    settings: {
      bidirectionalSync: true,
      autoCreateEvents: true,
      notifyOnSync: false,
      customMapping: {
        job_title: "event_summary",
        customer_address: "event_location",
        crew_notes: "event_description",
      },
    },
    metrics: {
      totalSyncs: 245,
      lastSyncDuration: 1200,
      errorCount: 3,
      recordsSynced: 1247,
    },
    features: [
      "Two-way sync",
      "Automatic event creation",
      "Crew scheduling",
      "Customer notifications",
    ],
    requirements: ["Google Workspace account", "Calendar access permissions"],
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    provider: "Intuit",
    category: "accounting",
    description:
      "Automatically sync invoices, payments, and financial data with QuickBooks",
    status: "connected",
    isEnabled: true,
    lastSync: new Date(2024, 7, 16, 12, 0),
    nextSync: new Date(2024, 7, 17, 12, 0),
    syncFrequency: "daily",
    connectedAt: new Date(2024, 6, 15),
    credentials: {
      isConfigured: true,
      expiresAt: new Date(2025, 6, 15),
      scopes: ["accounting.read", "accounting.write"],
    },
    settings: {
      bidirectionalSync: false,
      autoCreateEvents: true,
      notifyOnSync: true,
      customMapping: {
        customer_name: "qb_customer",
        service_total: "qb_amount",
        service_description: "qb_memo",
      },
    },
    metrics: {
      totalSyncs: 89,
      lastSyncDuration: 3400,
      errorCount: 1,
      recordsSynced: 456,
    },
    features: [
      "Invoice sync",
      "Payment tracking",
      "Customer data sync",
      "Tax reporting",
    ],
    requirements: ["QuickBooks Online subscription", "Company file access"],
  },
  {
    id: "stripe",
    name: "Stripe",
    provider: "Stripe",
    category: "payment",
    description: "Process payments and sync transaction data automatically",
    status: "connected",
    isEnabled: true,
    lastSync: new Date(2024, 7, 16, 16, 15),
    nextSync: new Date(2024, 7, 16, 16, 30),
    syncFrequency: "realtime",
    connectedAt: new Date(2024, 5, 10),
    credentials: {
      isConfigured: true,
      scopes: ["payments.read", "payments.write", "customers.read"],
    },
    settings: {
      bidirectionalSync: false,
      autoCreateEvents: true,
      notifyOnSync: true,
      customMapping: {},
    },
    metrics: {
      totalSyncs: 1847,
      lastSyncDuration: 450,
      errorCount: 8,
      recordsSynced: 3621,
    },
    features: [
      "Real-time payment processing",
      "Subscription management",
      "Refund handling",
      "Customer portal",
    ],
    requirements: ["Stripe account", "Business verification"],
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    provider: "Mailchimp",
    category: "communication",
    description: "Sync customer data and automate marketing campaigns",
    status: "disconnected",
    isEnabled: false,
    syncFrequency: "daily",
    credentials: {
      isConfigured: false,
      scopes: ["audiences.read", "audiences.write", "campaigns.read"],
    },
    settings: {
      bidirectionalSync: false,
      autoCreateEvents: true,
      notifyOnSync: false,
      customMapping: {},
    },
    metrics: {
      totalSyncs: 0,
      lastSyncDuration: 0,
      errorCount: 0,
      recordsSynced: 0,
    },
    features: [
      "Customer segmentation",
      "Automated campaigns",
      "Email templates",
      "Analytics",
    ],
    requirements: ["Mailchimp account", "Audience setup"],
  },
];

const mockSyncLogs: SyncLog[] = [
  {
    id: "log-1",
    integrationId: "google-calendar",
    timestamp: new Date(2024, 7, 16, 14, 30),
    status: "success",
    recordsProcessed: 15,
    duration: 1200,
    message: "Successfully synced 15 calendar events",
  },
  {
    id: "log-2",
    integrationId: "quickbooks",
    timestamp: new Date(2024, 7, 16, 12, 0),
    status: "success",
    recordsProcessed: 8,
    duration: 3400,
    message: "Synced 8 invoices and 3 payments to QuickBooks",
  },
  {
    id: "log-3",
    integrationId: "stripe",
    timestamp: new Date(2024, 7, 16, 16, 15),
    status: "success",
    recordsProcessed: 2,
    duration: 450,
    message: "Processed 2 new payments",
  },
  {
    id: "log-4",
    integrationId: "google-calendar",
    timestamp: new Date(2024, 7, 16, 13, 30),
    status: "error",
    recordsProcessed: 0,
    duration: 5000,
    message: "Failed to sync due to API rate limit",
    details: "Google Calendar API rate limit exceeded. Retrying in 1 hour.",
  },
];

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: "webhook-1",
    name: "Stripe Payments",
    url: "https://api.limpia.com/webhooks/stripe",
    events: [
      "payment_intent.succeeded",
      "invoice.payment_failed",
      "customer.subscription.updated",
    ],
    isActive: true,
    secret: "whsec_*********************",
    lastDelivery: new Date(2024, 7, 16, 16, 15),
    successRate: 99.2,
  },
  {
    id: "webhook-2",
    name: "QuickBooks Sync",
    url: "https://api.limpia.com/webhooks/quickbooks",
    events: ["invoice.created", "payment.received", "customer.updated"],
    isActive: true,
    secret: "whsec_*********************",
    lastDelivery: new Date(2024, 7, 16, 12, 0),
    successRate: 97.8,
  },
];

export function IntegrationHub() {
  const { toast } = useToast();
  const [integrations] = useState<Integration[]>(mockIntegrations);
  const [syncLogs] = useState<SyncLog[]>(mockSyncLogs);
  const [webhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    let filtered = integrations;

    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (integration) => integration.category === filterCategory,
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (integration) => integration.status === filterStatus,
      );
    }

    return filtered;
  }, [integrations, filterCategory, filterStatus]);

  // Calculate statistics
  const integrationStats = useMemo(() => {
    const total = integrations.length;
    const connected = integrations.filter(
      (i) => i.status === "connected",
    ).length;
    const enabled = integrations.filter((i) => i.isEnabled).length;
    const withErrors = integrations.filter((i) => i.status === "error").length;

    const totalSyncs = integrations.reduce(
      (sum, i) => sum + i.metrics.totalSyncs,
      0,
    );
    const totalErrors = integrations.reduce(
      (sum, i) => sum + i.metrics.errorCount,
      0,
    );
    const successRate =
      totalSyncs > 0 ? ((totalSyncs - totalErrors) / totalSyncs) * 100 : 0;

    return {
      total,
      connected,
      enabled,
      withErrors,
      totalSyncs,
      successRate,
    };
  }, [integrations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "disconnected":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      case "syncing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return CheckCircle;
      case "disconnected":
        return AlertTriangle;
      case "error":
        return AlertTriangle;
      case "syncing":
        return RotateCcw;
      default:
        return Clock;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "calendar":
        return Calendar;
      case "accounting":
        return DollarSign;
      case "payment":
        return CreditCard;
      case "communication":
        return Mail;
      case "crm":
        return Users;
      case "productivity":
        return Zap;
      default:
        return Link;
    }
  };

  const getSyncLogIcon = (status: string) => {
    switch (status) {
      case "success":
        return CheckCircle;
      case "error":
        return AlertTriangle;
      case "warning":
        return Clock;
      default:
        return Activity;
    }
  };

  const getSyncLogColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const handleConnect = (integrationId: string) => {
    console.log("Connecting integration:", integrationId);
  };

  const handleDisconnect = (integrationId: string) => {
    console.log("Disconnecting integration:", integrationId);
  };

  const handleSync = (integrationId: string) => {
    console.log("Triggering sync for:", integrationId);
  };

  const handleToggleEnabled = (integrationId: string, enabled: boolean) => {
    console.log("Toggling integration:", integrationId, enabled);
  };

  const handleExportConfig = useCallback(async () => {
    try {
      // Generate CSV data for integration configurations
      const csvData = [
        [
          "Integration Name",
          "Provider", 
          "Category",
          "Status",
          "Enabled",
          "Last Sync",
          "Sync Frequency",
          "Connected At",
          "Total Syncs",
          "Error Count",
          "Records Synced",
          "Bidirectional Sync",
          "Auto Create Events",
          "Features"
        ],
        ...integrations.map(integration => [
          integration.name,
          integration.provider,
          integration.category,
          integration.status,
          integration.isEnabled ? "Yes" : "No",
          integration.lastSync ? format(integration.lastSync, "yyyy-MM-dd HH:mm") : "Never",
          integration.syncFrequency,
          integration.connectedAt ? format(integration.connectedAt, "yyyy-MM-dd") : "Never",
          integration.metrics.totalSyncs,
          integration.metrics.errorCount,
          integration.metrics.recordsSynced,
          integration.settings.bidirectionalSync ? "Yes" : "No",
          integration.settings.autoCreateEvents ? "Yes" : "No",
          integration.features.join("; ")
        ])
      ];

      // Convert to CSV string
      const csvContent = csvData.map(row => row.join(",")).join("\n");
      
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `integration-config-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Integration configuration exported successfully`,
      });
    } catch (error) {
      console.error("Error exporting integration config:", error);
      toast({
        title: "Export Failed", 
        description: "Failed to export integration configuration. Please try again.",
        variant: "destructive",
      });
    }
  }, [integrations, toast]);

  const handleExportLogs = useCallback(async () => {
    try {
      // Generate CSV data for sync logs
      const csvData = [
        [
          "Integration",
          "Timestamp",
          "Status",
          "Records Processed",
          "Duration (seconds)",
          "Message",
          "Details"
        ],
        ...syncLogs.map(log => {
          const integration = integrations.find(i => i.id === log.integrationId);
          return [
            integration?.name || "Unknown",
            format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
            log.status,
            log.recordsProcessed,
            (log.duration / 1000).toFixed(2),
            log.message,
            log.details || ""
          ];
        })
      ];

      // Convert to CSV string
      const csvContent = csvData.map(row => row.join(",")).join("\n");
      
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `integration-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Integration logs exported successfully`,
      });
    } catch (error) {
      console.error("Error exporting integration logs:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export integration logs. Please try again.",
        variant: "destructive",
      });
    }
  }, [syncLogs, integrations, toast]);

  const IntegrationCard = ({ integration }: { integration: Integration }) => {
    const StatusIcon = getStatusIcon(integration.status);
    const CategoryIcon = getCategoryIcon(integration.category);

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedIntegration(integration);
          setIsSettingsOpen(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CategoryIcon className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                {integration.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`${getStatusColor(integration.status)} text-white`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {integration.status}
              </Badge>
              <Switch
                checked={integration.isEnabled}
                onCheckedChange={(checked) =>
                  handleToggleEnabled(integration.id, checked)
                }
                size="sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {integration.description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Syncs</div>
              <div className="font-bold">{integration.metrics.totalSyncs}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Success Rate</div>
              <div className="font-bold">
                {integration.metrics.totalSyncs > 0
                  ? (
                      ((integration.metrics.totalSyncs -
                        integration.metrics.errorCount) /
                        integration.metrics.totalSyncs) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>

          {integration.lastSync && (
            <div className="text-xs text-muted-foreground">
              Last sync: {format(integration.lastSync, "MMM dd, HH:mm")}
            </div>
          )}

          <div className="flex items-center gap-2">
            {integration.status === "connected" ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSync(integration.id);
                  }}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Sync Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisconnect(integration.id);
                  }}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConnect(integration.id);
                }}
              >
                <Link className="w-3 h-3 mr-1" />
                Connect
              </Button>
            )}
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
          <h1 className="text-2xl font-bold tracking-tight">Integration Hub</h1>
          <p className="text-muted-foreground">
            Connect and manage third-party services and APIs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportConfig}>
            <Download className="mr-1 h-4 w-4" />
            Export Config
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWebhookDialogOpen(true)}
          >
            <Settings className="mr-1 h-4 w-4" />
            Webhooks
          </Button>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Integrations
            </CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {integrationStats.connected} connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.enabled}</div>
            <p className="text-xs text-muted-foreground">
              {integrationStats.withErrors} with errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Syncs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrationStats.totalSyncs}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrationStats.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {integrations
                  .filter((i) => i.status === "connected")
                  .map((integration) => {
                    const CategoryIcon = getCategoryIcon(integration.category);

                    return (
                      <div
                        key={integration.id}
                        className="flex items-center gap-3 p-2 border rounded"
                      >
                        <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {integration.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {integration.metrics.totalSyncs} syncs •{" "}
                            {integration.syncFrequency}
                          </div>
                        </div>
                        <Badge variant="outline">{integration.category}</Badge>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {syncLogs.slice(0, 5).map((log) => {
                  const LogIcon = getSyncLogIcon(log.status);
                  const integration = integrations.find(
                    (i) => i.id === log.integrationId,
                  );

                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <div className={`${getSyncLogColor(log.status)}`}>
                        <LogIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {integration?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.message}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(log.timestamp, "HH:mm")}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="accounting">Accounting</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="syncing">Syncing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Integrations Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncLogs.map((log) => {
                  const LogIcon = getSyncLogIcon(log.status);
                  const integration = integrations.find(
                    (i) => i.id === log.integrationId,
                  );

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded"
                    >
                      <div className={`mt-1 ${getSyncLogColor(log.status)}`}>
                        <LogIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{integration?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(log.timestamp, "MMM dd, HH:mm")}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.message}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{log.recordsProcessed} records</span>
                          <span>
                            {(log.duration / 1000).toFixed(1)}s duration
                          </span>
                        </div>
                        {log.details && (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                            {log.details}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{webhook.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={webhook.isActive ? "default" : "secondary"}
                      >
                        {webhook.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {webhook.successRate.toFixed(1)}% success
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Endpoint URL</Label>
                    <div className="font-mono text-sm bg-muted p-2 rounded">
                      {webhook.url}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Events</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {webhook.events.map((event) => (
                        <Badge
                          key={event}
                          variant="outline"
                          className="text-xs"
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Last Delivery</div>
                      <div className="font-medium">
                        {webhook.lastDelivery
                          ? format(webhook.lastDelivery, "MMM dd, HH:mm")
                          : "Never"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-medium">
                        {webhook.successRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Integration Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Integration Settings - {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedIntegration && (
            <div className="space-y-6">
              {/* Connection Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Connection Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getStatusColor(
                          selectedIntegration.status,
                        )} text-white`}
                      >
                        {selectedIntegration.status}
                      </Badge>
                      <span className="text-sm">
                        {selectedIntegration.status === "connected"
                          ? "Successfully connected"
                          : "Not connected"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedIntegration.isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleEnabled(selectedIntegration.id, checked)
                        }
                      />
                      <Label>Enabled</Label>
                    </div>
                  </div>

                  {selectedIntegration.connectedAt && (
                    <div className="text-sm text-muted-foreground">
                      Connected on{" "}
                      {format(selectedIntegration.connectedAt, "PPP")}
                    </div>
                  )}

                  {selectedIntegration.credentials.expiresAt && (
                    <div className="text-sm text-muted-foreground">
                      Credentials expire on{" "}
                      {format(selectedIntegration.credentials.expiresAt, "PPP")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sync Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sync Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sync-frequency">Sync Frequency</Label>
                      <Select value={selectedIntegration.syncFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="manual">Manual only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={
                              selectedIntegration.settings.bidirectionalSync
                            }
                            id="bidirectional"
                          />
                          <Label htmlFor="bidirectional" className="text-sm">
                            Bidirectional sync
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={
                              selectedIntegration.settings.autoCreateEvents
                            }
                            id="auto-create"
                          />
                          <Label htmlFor="auto-create" className="text-sm">
                            Auto-create events
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedIntegration.settings.notifyOnSync}
                            id="notify"
                          />
                          <Label htmlFor="notify" className="text-sm">
                            Notify on sync
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedIntegration.nextSync && (
                    <div className="text-sm text-muted-foreground">
                      Next sync scheduled for{" "}
                      {format(selectedIntegration.nextSync, "PPpp")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Syncs</div>
                      <div className="font-bold">
                        {selectedIntegration.metrics.totalSyncs}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Records Synced
                      </div>
                      <div className="font-bold">
                        {selectedIntegration.metrics.recordsSynced}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Error Count</div>
                      <div className="font-bold">
                        {selectedIntegration.metrics.errorCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Duration</div>
                      <div className="font-bold">
                        {(
                          selectedIntegration.metrics.lastSyncDuration / 1000
                        ).toFixed(1)}
                        s
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button onClick={() => handleSync(selectedIntegration.id)}>
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Sync Now
                </Button>
                <Button variant="outline">
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Reset Connection
                </Button>
                <Button variant="outline" onClick={handleExportLogs}>
                  <Download className="mr-1 h-4 w-4" />
                  Export Logs
                </Button>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Webhook Management Dialog */}
      <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Webhook Management</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-name">Webhook Name</Label>
              <Input placeholder="Enter webhook name" />
            </div>

            <div>
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input placeholder="https://your-app.com/webhook" />
            </div>

            <div>
              <Label htmlFor="webhook-events">Events</Label>
              <Textarea
                placeholder="payment.succeeded, invoice.created, customer.updated"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="webhook-active" />
              <Label htmlFor="webhook-active">Active</Label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                Create Webhook
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsWebhookDialogOpen(false)}
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
