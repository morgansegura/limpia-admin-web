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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Brain,
  Lightbulb,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Settings,
  Download,
  RotateCcw,
  Eye,
} from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";

interface PredictionModel {
  id: string;
  name: string;
  type: "revenue" | "customer_churn" | "demand" | "growth" | "seasonality";
  description: string;
  accuracy: number;
  confidence: number;
  lastTrained: Date;
  dataPoints: number;
  status: "active" | "training" | "needs_update" | "inactive";
  predictions: PredictionResult[];
}

interface PredictionResult {
  id: string;
  date: Date;
  metric: string;
  predicted: number;
  actual?: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  factors: string[];
}

interface Insight {
  id: string;
  type: "opportunity" | "risk" | "trend" | "anomaly";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  priority: number;
  actionable: boolean;
  suggestedActions: string[];
  createdAt: Date;
  category: "revenue" | "operations" | "customers" | "market";
  dataSource: string[];
}

interface MetricForecast {
  metric: string;
  current: number;
  predicted: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  timeframe: string;
}

// Mock data
const mockModels: PredictionModel[] = [
  {
    id: "model-1",
    name: "Revenue Forecasting",
    type: "revenue",
    description:
      "Predicts monthly revenue based on historical data and market trends",
    accuracy: 87.5,
    confidence: 92.0,
    lastTrained: new Date(2024, 7, 15),
    dataPoints: 2847,
    status: "active",
    predictions: [],
  },
  {
    id: "model-2",
    name: "Customer Churn Prediction",
    type: "customer_churn",
    description: "Identifies customers at risk of canceling services",
    accuracy: 91.2,
    confidence: 88.5,
    lastTrained: new Date(2024, 7, 14),
    dataPoints: 1523,
    status: "active",
    predictions: [],
  },
  {
    id: "model-3",
    name: "Service Demand Forecasting",
    type: "demand",
    description: "Predicts demand for cleaning services by region and time",
    accuracy: 84.7,
    confidence: 79.3,
    lastTrained: new Date(2024, 7, 12),
    dataPoints: 3156,
    status: "needs_update",
    predictions: [],
  },
];

const mockInsights: Insight[] = [
  {
    id: "insight-1",
    type: "opportunity",
    title: "Growing Demand in South Miami",
    description:
      "Service demand in South Miami has increased 35% over the past month. Consider expanding crew capacity in this area.",
    impact: "high",
    confidence: 89,
    priority: 1,
    actionable: true,
    suggestedActions: [
      "Hire 2-3 additional crew members for South Miami",
      "Increase marketing budget for South Miami by 25%",
      "Negotiate partnerships with local real estate agents",
    ],
    createdAt: new Date(2024, 7, 16),
    category: "operations",
    dataSource: ["job_bookings", "geo_analytics", "crew_utilization"],
  },
  {
    id: "insight-2",
    type: "risk",
    title: "Customer Churn Risk Detected",
    description:
      "12 high-value customers show early churn indicators. Predicted revenue impact: $8,400/month.",
    impact: "high",
    confidence: 92,
    priority: 1,
    actionable: true,
    suggestedActions: [
      "Launch targeted retention campaign for at-risk customers",
      "Offer loyalty discounts or service upgrades",
      "Schedule customer satisfaction calls",
    ],
    createdAt: new Date(2024, 7, 15),
    category: "customers",
    dataSource: ["customer_behavior", "payment_patterns", "service_feedback"],
  },
  {
    id: "insight-3",
    type: "trend",
    title: "Seasonal Booking Pattern Emerging",
    description:
      "Deep cleaning services show 40% increase during school holiday periods. Plan inventory and staffing accordingly.",
    impact: "medium",
    confidence: 85,
    priority: 2,
    actionable: true,
    suggestedActions: [
      "Increase deep cleaning supply inventory for holiday periods",
      "Hire temporary staff for peak seasons",
      "Create seasonal marketing campaigns",
    ],
    createdAt: new Date(2024, 7, 14),
    category: "market",
    dataSource: ["booking_history", "seasonal_analysis", "service_trends"],
  },
  {
    id: "insight-4",
    type: "anomaly",
    title: "Unusual Pricing Sensitivity",
    description:
      "Customers in Brickell area show higher price sensitivity than model predicted. Consider pricing strategy review.",
    impact: "medium",
    confidence: 76,
    priority: 3,
    actionable: true,
    suggestedActions: [
      "Conduct pricing analysis for Brickell area",
      "Test tiered pricing options",
      "Survey customers about pricing preferences",
    ],
    createdAt: new Date(2024, 7, 13),
    category: "revenue",
    dataSource: [
      "pricing_analytics",
      "booking_conversion",
      "competitor_analysis",
    ],
  },
];

const mockForecasts: MetricForecast[] = [
  {
    metric: "Monthly Revenue",
    current: 28500,
    predicted: 31200,
    change: 2700,
    changePercent: 9.5,
    trend: "up",
    confidence: 87,
    timeframe: "Next 30 days",
  },
  {
    metric: "New Customers",
    current: 45,
    predicted: 52,
    change: 7,
    changePercent: 15.6,
    trend: "up",
    confidence: 92,
    timeframe: "Next 30 days",
  },
  {
    metric: "Crew Utilization",
    current: 78,
    predicted: 85,
    change: 7,
    changePercent: 9.0,
    trend: "up",
    confidence: 84,
    timeframe: "Next 2 weeks",
  },
  {
    metric: "Customer Satisfaction",
    current: 4.7,
    predicted: 4.6,
    change: -0.1,
    changePercent: -2.1,
    trend: "down",
    confidence: 79,
    timeframe: "Next 30 days",
  },
];

export function PredictiveAnalytics() {
  const { toast } = useToast();
  const [models] = useState<PredictionModel[]>(mockModels);
  const [insights] = useState<Insight[]>(mockInsights);
  const [forecasts] = useState<MetricForecast[]>(mockForecasts);
  const [selectedModel, setSelectedModel] = useState<PredictionModel | null>(
    null,
  );
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Filter insights
  const filteredInsights = useMemo(() => {
    let filtered = insights;

    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (insight) => insight.category === filterCategory,
      );
    }

    if (filterImpact !== "all") {
      filtered = filtered.filter((insight) => insight.impact === filterImpact);
    }

    return filtered.sort((a, b) => b.priority - a.priority);
  }, [insights, filterCategory, filterImpact]);

  // Calculate model statistics
  const modelStats = useMemo(() => {
    const totalModels = models.length;
    const activeModels = models.filter((m) => m.status === "active").length;
    const avgAccuracy =
      models.reduce((sum, m) => sum + m.accuracy, 0) / totalModels;
    const avgConfidence =
      models.reduce((sum, m) => sum + m.confidence, 0) / totalModels;
    const needsUpdate = models.filter(
      (m) => m.status === "needs_update",
    ).length;

    return {
      totalModels,
      activeModels,
      avgAccuracy,
      avgConfidence,
      needsUpdate,
    };
  }, [models]);

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "bg-green-500";
      case "risk":
        return "bg-red-500";
      case "trend":
        return "bg-blue-500";
      case "anomaly":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return TrendingUp;
      case "risk":
        return AlertTriangle;
      case "trend":
        return LineChart;
      case "anomaly":
        return Eye;
      default:
        return Brain;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return ArrowUp;
      case "down":
        return ArrowDown;
      default:
        return ArrowRight;
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "training":
        return "bg-blue-500";
      case "needs_update":
        return "bg-yellow-500";
      case "inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleTrainModel = (modelId: string) => {
    console.log("Training model:", modelId);
  };

  const handleImplementInsight = (insightId: string) => {
    console.log("Implementing insight:", insightId);
  };

  const handleExportReport = useCallback(async () => {
    try {
      // Generate CSV data based on current active tab
      let csvData = [];
      let filename = "";

      switch (activeTab) {
        case "overview":
        case "insights":
          csvData = [
            [
              "Insight Title",
              "Type",
              "Category",
              "Impact",
              "Priority",
              "Confidence",
              "Description",
              "Status",
              "Created Date",
            ],
            ...filteredInsights.map((insight) => [
              insight.title,
              insight.type,
              insight.category,
              insight.impact,
              insight.priority,
              `${insight.confidence}%`,
              insight.description,
              insight.actionable ? "Actionable" : "Not Actionable",
              format(insight.createdAt, "yyyy-MM-dd"),
            ]),
          ];
          filename = `predictive-insights`;
          break;

        case "models":
          csvData = [
            [
              "Model Name",
              "Type",
              "Status",
              "Accuracy",
              "Confidence",
              "Last Trained",
              "Data Points",
              "Predictions Count",
              "Description",
            ],
            ...models.map((model) => [
              model.name,
              model.type,
              model.status,
              `${model.accuracy}%`,
              `${model.confidence}%`,
              format(model.lastTrained, "yyyy-MM-dd"),
              model.dataPoints,
              model.predictions.length,
              model.description,
            ]),
          ];
          filename = `prediction-models`;
          break;

        case "forecasts":
          csvData = [
            [
              "Metric",
              "Current Value",
              "Predicted Value",
              "Change",
              "Change Percent",
              "Trend",
              "Confidence",
              "Timeframe",
            ],
            ...forecasts.map((forecast) => [
              forecast.metric,
              forecast.current,
              forecast.predicted,
              forecast.change,
              `${forecast.changePercent.toFixed(1)}%`,
              forecast.trend,
              `${forecast.confidence}%`,
              forecast.timeframe,
            ]),
          ];
          filename = `metric-forecasts`;
          break;

        default:
          csvData = [["No data available"]];
          filename = "predictive-analytics";
      }

      // Convert to CSV string
      const csvContent = csvData.map((row) => row.join(",")).join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Predictive analytics report exported successfully`,
      });
    } catch (error) {
      console.error("Error exporting predictive analytics:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export predictive analytics. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeTab, filteredInsights, models, forecasts, toast]);

  const handleModelSettings = useCallback(async () => {
    try {
      // Show model settings dialog or perform settings action
      toast({
        title: "Model Settings",
        description: "Model settings dialog opened successfully",
      });

      // In a real app, this would open a settings dialog or navigate to settings
      setIsModelDialogOpen(true);
    } catch (error) {
      console.error("Error opening model settings:", error);
      toast({
        title: "Settings Failed",
        description: "Failed to open model settings. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleUpdateModels = useCallback(async () => {
    try {
      // Simulate model update process
      toast({
        title: "Updating Models",
        description:
          "Model update process started. This may take a few minutes...",
      });

      // In a real app, this would trigger API calls to retrain/update models
      setTimeout(() => {
        toast({
          title: "Update Complete",
          description: `${modelStats.needsUpdate} models have been updated successfully`,
        });
      }, 2000);
    } catch (error) {
      console.error("Error updating models:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update models. Please try again.",
        variant: "destructive",
      });
    }
  }, [modelStats.needsUpdate, toast]);

  const InsightCard = ({ insight }: { insight: Insight }) => {
    const TypeIcon = getInsightTypeIcon(insight.type);

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedInsight(insight);
          setIsInsightDialogOpen(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {insight.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                className={`${getInsightTypeColor(insight.type)} text-white`}
              >
                <TypeIcon className="w-3 h-3 mr-1" />
                {insight.type}
              </Badge>
              <Badge className={`${getImpactColor(insight.impact)} text-white`}>
                {insight.impact}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{insight.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Confidence: </span>
                <span className="font-medium">{insight.confidence}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Priority: </span>
                <span className="font-medium">{insight.priority}</span>
              </div>
            </div>

            {insight.actionable && (
              <Badge variant="outline" className="text-xs">
                <Lightbulb className="w-3 h-3 mr-1" />
                Actionable
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {format(insight.createdAt, "MMM dd, yyyy")} • {insight.category}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ModelCard = ({ model }: { model: PredictionModel }) => {
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedModel(model);
          setIsModelDialogOpen(true);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
            <Badge
              className={`${getModelStatusColor(model.status)} text-white`}
            >
              {model.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{model.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Accuracy</div>
              <div className="font-bold">{model.accuracy.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Confidence</div>
              <div className="font-bold">{model.confidence.toFixed(1)}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {model.dataPoints.toLocaleString()} data points
            </span>
            <span className="text-muted-foreground">
              Updated {format(model.lastTrained, "MMM dd")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ForecastCard = ({ forecast }: { forecast: MetricForecast }) => {
    const TrendIcon = getTrendIcon(forecast.trend);
    const isPositive = forecast.trend === "up";

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {forecast.metric}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {forecast.predicted.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Predicted</div>
            </div>
            <div
              className={`flex items-center ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendIcon className="w-4 h-4 mr-1" />
              <span className="font-medium">
                {forecast.changePercent > 0 ? "+" : ""}
                {forecast.changePercent.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Confidence</span>
              <span>{forecast.confidence}%</span>
            </div>
            <Progress value={forecast.confidence} className="h-2" />
          </div>

          <div className="text-xs text-muted-foreground">
            {forecast.timeframe}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Predictive Analytics
          </h1>
          <p className="text-muted-foreground">
            AI-powered insights and forecasting for business optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="mr-1 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleModelSettings}>
            <Settings className="mr-1 h-4 w-4" />
            Model Settings
          </Button>
          <Button onClick={handleUpdateModels}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Update Models
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelStats.activeModels}</div>
            <p className="text-xs text-muted-foreground">
              {modelStats.totalModels} total models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelStats.avgAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {modelStats.avgConfidence.toFixed(1)}% confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Insights
            </CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              {insights.filter((i) => i.actionable).length} actionable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecasts.length}</div>
            <p className="text-xs text-muted-foreground">
              {modelStats.needsUpdate} need updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.slice(0, 3).map((insight) => {
                  const TypeIcon = getInsightTypeIcon(insight.type);

                  return (
                    <div
                      key={insight.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <div
                        className={`p-2 rounded ${getInsightTypeColor(
                          insight.type,
                        )}`}
                      >
                        <TypeIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {insight.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {insight.confidence}% confidence • {insight.impact}{" "}
                          impact
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Forecasts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {forecasts.slice(0, 3).map((forecast) => {
                  const TrendIcon = getTrendIcon(forecast.trend);
                  const isPositive = forecast.trend === "up";

                  return (
                    <div
                      key={forecast.metric}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {forecast.metric}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {forecast.timeframe}
                        </div>
                      </div>
                      <div
                        className={`flex items-center ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <TrendIcon className="w-4 h-4 mr-1" />
                        <span className="font-medium">
                          {forecast.changePercent > 0 ? "+" : ""}
                          {forecast.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* Filters */}
          <Card className="bg-(--muted) py-4 px-0 rounded-sm border-none">
            <CardContent>
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
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="market">Market</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterImpact} onValueChange={setFilterImpact}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Impact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Impact</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Insights Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {forecasts.map((forecast) => (
              <ForecastCard key={forecast.metric} forecast={forecast} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Model Details Dialog */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Model Details
            </DialogTitle>
          </DialogHeader>

          {selectedModel && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Model Name</Label>
                  <p className="font-bold">{selectedModel.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    className={`${getModelStatusColor(
                      selectedModel.status,
                    )} text-white mt-1`}
                  >
                    {selectedModel.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-muted-foreground">
                  {selectedModel.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Accuracy</Label>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={selectedModel.accuracy}
                      className="flex-1"
                    />
                    <span className="font-medium">
                      {selectedModel.accuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Confidence</Label>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={selectedModel.confidence}
                      className="flex-1"
                    />
                    <span className="font-medium">
                      {selectedModel.confidence.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data Points</Label>
                  <p className="font-bold">
                    {selectedModel.dataPoints.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Trained</Label>
                  <p className="font-bold">
                    {format(selectedModel.lastTrained, "PPpp")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button onClick={() => handleTrainModel(selectedModel.id)}>
                  <Zap className="mr-1 h-4 w-4" />
                  Retrain Model
                </Button>
                <Button variant="outline">
                  <Settings className="mr-1 h-4 w-4" />
                  Configure
                </Button>
                <Button variant="outline">
                  <Download className="mr-1 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Insight Details Dialog */}
      <Dialog open={isInsightDialogOpen} onOpenChange={setIsInsightDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insight Details
            </DialogTitle>
          </DialogHeader>

          {selectedInsight && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge
                  className={`${getInsightTypeColor(
                    selectedInsight.type,
                  )} text-white`}
                >
                  {selectedInsight.type}
                </Badge>
                <Badge
                  className={`${getImpactColor(
                    selectedInsight.impact,
                  )} text-white`}
                >
                  {selectedInsight.impact} impact
                </Badge>
                <Badge variant="outline">
                  {selectedInsight.confidence}% confidence
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  {selectedInsight.title}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {selectedInsight.description}
                </p>
              </div>

              {selectedInsight.actionable &&
                selectedInsight.suggestedActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Suggested Actions</h4>
                    <ul className="space-y-2">
                      {selectedInsight.suggestedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Category</div>
                  <div className="font-medium capitalize">
                    {selectedInsight.category}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Priority</div>
                  <div className="font-medium">{selectedInsight.priority}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {format(selectedInsight.createdAt, "MMM dd, yyyy")}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Data Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInsight.dataSource.map((source) => (
                    <Badge key={source} variant="secondary">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleImplementInsight(selectedInsight.id)}
                >
                  <ArrowRight className="mr-1 h-4 w-4" />
                  Implement Actions
                </Button>
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="mr-1 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
