"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  AlertTriangle,
  FileText,
  Download,
  Edit,
  Plus,
  Award,
  Activity,
  Heart,
  Zap,
  Settings,
  Phone,
  Mail,
} from "lucide-react";

interface SafetyProtocol {
  id: string;
  title: string;
  category: "chemical" | "equipment" | "emergency" | "ppe" | "environmental";
  description: string;
  steps: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  requiredPPE: string[];
  trainingRequired: boolean;
  lastUpdated: Date;
  version: string;
  status: "active" | "draft" | "archived";
  attachments: string[];
}

interface TrainingRecord {
  id: string;
  workerId: string;
  workerName: string;
  protocolId: string;
  protocolTitle: string;
  completedAt: Date;
  expiresAt: Date;
  score: number;
  instructor: string;
  certificateNumber: string;
  status: "current" | "expired" | "pending";
}

interface IncidentReport {
  id: string;
  reportedBy: string;
  reportedAt: Date;
  incidentType:
    | "injury"
    | "near_miss"
    | "equipment_damage"
    | "chemical_spill"
    | "other";
  severity: "minor" | "moderate" | "severe" | "critical";
  location: string;
  description: string;
  immediateActions: string;
  followUpRequired: boolean;
  status: "open" | "investigating" | "resolved" | "closed";
  assignedTo: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  available24h: boolean;
  specialties: string[];
}

const mockSafetyProtocols: SafetyProtocol[] = [
  {
    id: "1",
    title: "Chemical Handling & Storage",
    category: "chemical",
    description:
      "Proper procedures for handling, mixing, and storing cleaning chemicals safely",
    steps: [
      "Read and understand Safety Data Sheet (SDS) before use",
      "Wear appropriate PPE including gloves, eye protection, and apron",
      "Use chemicals in well-ventilated areas only",
      "Never mix different chemicals unless specifically instructed",
      "Store chemicals in original containers with proper labeling",
      "Keep chemicals away from heat sources and incompatible materials",
    ],
    riskLevel: "high",
    requiredPPE: [
      "Chemical-resistant gloves",
      "Safety goggles",
      "Apron",
      "Respirator if needed",
    ],
    trainingRequired: true,
    lastUpdated: new Date("2024-01-15"),
    version: "2.1",
    status: "active",
    attachments: ["chemical-sds-sheets.pdf", "mixing-chart.pdf"],
  },
  {
    id: "2",
    title: "Equipment Safety Procedures",
    category: "equipment",
    description: "Safe operation and maintenance of cleaning equipment",
    steps: [
      "Inspect equipment before each use",
      "Ensure all safety guards are in place",
      "Use equipment only for intended purposes",
      "Follow manufacturer operating instructions",
      "Report any defects or malfunctions immediately",
      "Properly clean and store equipment after use",
    ],
    riskLevel: "medium",
    requiredPPE: ["Work gloves", "Safety shoes", "Eye protection"],
    trainingRequired: true,
    lastUpdated: new Date("2024-02-01"),
    version: "1.3",
    status: "active",
    attachments: ["equipment-manual.pdf"],
  },
  {
    id: "3",
    title: "Emergency Response Procedures",
    category: "emergency",
    description: "Actions to take during various emergency situations",
    steps: [
      "Assess the situation and ensure personal safety first",
      "Call emergency services if needed (911)",
      "Notify supervisor and safety officer immediately",
      "Evacuate area if necessary following evacuation routes",
      "Provide first aid if trained and safe to do so",
      "Document incident details as soon as possible",
    ],
    riskLevel: "critical",
    requiredPPE: [],
    trainingRequired: true,
    lastUpdated: new Date("2024-01-10"),
    version: "3.0",
    status: "active",
    attachments: ["emergency-contacts.pdf", "evacuation-map.pdf"],
  },
];

const mockTrainingRecords: TrainingRecord[] = [
  {
    id: "1",
    workerId: "W001",
    workerName: "Maria Rodriguez",
    protocolId: "1",
    protocolTitle: "Chemical Handling & Storage",
    completedAt: new Date("2024-01-20"),
    expiresAt: new Date("2025-01-20"),
    score: 95,
    instructor: "Safety Officer John Smith",
    certificateNumber: "CH-2024-001",
    status: "current",
  },
  {
    id: "2",
    workerId: "W001",
    workerName: "Maria Rodriguez",
    protocolId: "2",
    protocolTitle: "Equipment Safety Procedures",
    completedAt: new Date("2024-02-05"),
    expiresAt: new Date("2025-02-05"),
    score: 88,
    instructor: "Safety Officer John Smith",
    certificateNumber: "ES-2024-001",
    status: "current",
  },
];

const mockIncidents: IncidentReport[] = [
  {
    id: "1",
    reportedBy: "Maria Rodriguez",
    reportedAt: new Date("2024-02-10"),
    incidentType: "near_miss",
    severity: "minor",
    location: "123 Oak Street - Residential",
    description:
      "Nearly slipped on wet floor in bathroom due to inadequate signage",
    immediateActions: "Placed wet floor signs, cleaned up excess water",
    followUpRequired: true,
    status: "resolved",
    assignedTo: "Safety Officer",
  },
  {
    id: "2",
    reportedBy: "James Wilson",
    reportedAt: new Date("2024-02-15"),
    incidentType: "equipment_damage",
    severity: "moderate",
    location: "Downtown Office Building",
    description: "Vacuum cleaner motor overheated during use",
    immediateActions: "Unplugged equipment, removed from service",
    followUpRequired: true,
    status: "investigating",
    assignedTo: "Equipment Manager",
  },
];

const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: "1",
    name: "John Smith",
    role: "Safety Officer",
    phone: "(555) 123-4567",
    email: "safety@limpia.com",
    available24h: true,
    specialties: ["Chemical spills", "Equipment safety", "Training"],
  },
  {
    id: "2",
    name: "Dr. Sarah Johnson",
    role: "Medical Advisor",
    phone: "(555) 987-6543",
    email: "medical@limpia.com",
    available24h: false,
    specialties: ["First aid", "Chemical exposure", "Injury assessment"],
  },
];

export function SafetyProtocols() {
  const [protocols] = useState<SafetyProtocol[]>(mockSafetyProtocols);
  const [trainingRecords] = useState<TrainingRecord[]>(mockTrainingRecords);
  const [incidents] = useState<IncidentReport[]>(mockIncidents);
  const [emergencyContacts] = useState<EmergencyContact[]>(
    mockEmergencyContacts,
  );
  const [selectedProtocol, setSelectedProtocol] =
    useState<SafetyProtocol | null>(null);
  const [isProtocolDetailOpen, setIsProtocolDetailOpen] = useState(false);
  const [isAddProtocolOpen, setIsAddProtocolOpen] = useState(false);
  const [isIncidentReportOpen, setIsIncidentReportOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("protocols");

  const filteredProtocols = protocols.filter((protocol) => {
    if (filterCategory !== "all" && protocol.category !== filterCategory)
      return false;
    if (filterRiskLevel !== "all" && protocol.riskLevel !== filterRiskLevel)
      return false;
    return true;
  });

  const safetyStats = {
    totalProtocols: protocols.length,
    activeProtocols: protocols.filter((p) => p.status === "active").length,
    highRiskProtocols: protocols.filter(
      (p) => p.riskLevel === "high" || p.riskLevel === "critical",
    ).length,
    trainingCompliance:
      (trainingRecords.filter((tr) => tr.status === "current").length /
        trainingRecords.length) *
      100,
    openIncidents: incidents.filter(
      (i) => i.status === "open" || i.status === "investigating",
    ).length,
    monthlyIncidents: incidents.filter((i) => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return i.reportedAt >= monthAgo;
    }).length,
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[riskLevel] || "bg-gray-100 text-gray-800"}>
        {riskLevel.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "chemical":
        return <Zap className="w-4 h-4" />;
      case "equipment":
        return <Settings className="w-4 h-4" />;
      case "emergency":
        return <AlertTriangle className="w-4 h-4" />;
      case "ppe":
        return <Shield className="w-4 h-4" />;
      case "environmental":
        return <Heart className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "current":
        return <Badge className="bg-green-100 text-green-800">Current</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "open":
        return <Badge className="bg-red-100 text-red-800">Open</Badge>;
      case "investigating":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Investigating</Badge>
        );
      case "resolved":
        return <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Safety Protocols & Training
          </h1>
          <p className="mt-2 text-gray-600">
            Manage safety procedures, training records, and incident reporting
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog
            open={isIncidentReportOpen}
            onOpenChange={setIsIncidentReportOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report Safety Incident</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incidentType">Incident Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="injury">Injury</SelectItem>
                        <SelectItem value="near_miss">Near Miss</SelectItem>
                        <SelectItem value="equipment_damage">
                          Equipment Damage
                        </SelectItem>
                        <SelectItem value="chemical_spill">
                          Chemical Spill
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Enter incident location" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what happened"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsIncidentReportOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button>Submit Report</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddProtocolOpen} onOpenChange={setIsAddProtocolOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Protocol
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Safety Protocol</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="protocolTitle">Protocol Title</Label>
                    <Input
                      id="protocolTitle"
                      placeholder="Enter protocol title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chemical">
                          Chemical Safety
                        </SelectItem>
                        <SelectItem value="equipment">
                          Equipment Safety
                        </SelectItem>
                        <SelectItem value="emergency">
                          Emergency Procedures
                        </SelectItem>
                        <SelectItem value="ppe">
                          Personal Protective Equipment
                        </SelectItem>
                        <SelectItem value="environmental">
                          Environmental Safety
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="protocolDescription">Description</Label>
                  <Textarea
                    id="protocolDescription"
                    placeholder="Enter protocol description"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddProtocolOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button>Add Protocol</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Protocols
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safetyStats.activeProtocols}
            </div>
            <p className="text-xs text-muted-foreground">
              {safetyStats.highRiskProtocols} high risk
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Training Compliance
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safetyStats.trainingCompliance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Current certifications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Incidents
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safetyStats.openIncidents}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Incidents
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safetyStats.monthlyIncidents}
            </div>
            <p className="text-xs text-muted-foreground">Past 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="protocols">Safety Protocols</TabsTrigger>
          <TabsTrigger value="training">Training Records</TabsTrigger>
          <TabsTrigger value="incidents">Incident Reports</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Safety Protocols</CardTitle>
                <div className="flex space-x-2">
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="chemical">Chemical</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="ppe">PPE</SelectItem>
                      <SelectItem value="environmental">
                        Environmental
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterRiskLevel}
                    onValueChange={setFilterRiskLevel}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProtocols.map((protocol) => (
                  <div
                    key={protocol.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedProtocol(protocol);
                      setIsProtocolDetailOpen(true);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {getCategoryIcon(protocol.category)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {protocol.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Version {protocol.version} • {protocol.steps.length}{" "}
                          steps
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRiskLevelBadge(protocol.riskLevel)}
                          {protocol.trainingRequired && (
                            <Badge className="bg-purple-100 text-purple-800">
                              Training Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Updated {protocol.lastUpdated.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        {protocol.requiredPPE.length} PPE items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Award className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {record.workerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {record.protocolTitle}
                        </p>
                        <p className="text-sm text-gray-400">
                          Score: {record.score}% • Cert:{" "}
                          {record.certificateNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        {getStatusBadge(record.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        Expires: {record.expiresAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle>Incident Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {incident.incidentType.replace("_", " ").toUpperCase()}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getRiskLevelBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {incident.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Reported by {incident.reportedBy}</span>
                      <span>{incident.reportedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Location: {incident.location}</span>
                      <span>Assigned to: {incident.assignedTo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </h3>
                        <p className="text-sm text-gray-500">{contact.role}</p>
                        <p className="text-sm text-gray-400">
                          {contact.phone} • {contact.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {contact.available24h && (
                            <Badge className="bg-green-100 text-green-800">
                              24/7 Available
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {contact.specialties.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Protocol Detail Dialog */}
      <Dialog
        open={isProtocolDetailOpen}
        onOpenChange={setIsProtocolDetailOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Safety Protocol Details</DialogTitle>
          </DialogHeader>
          {selectedProtocol && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedProtocol.title}
                  </h2>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRiskLevelBadge(selectedProtocol.riskLevel)}
                    {selectedProtocol.trainingRequired && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Training Required
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Version {selectedProtocol.version}
                  </p>
                  <p className="text-sm text-gray-500">
                    Updated {selectedProtocol.lastUpdated.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700">{selectedProtocol.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Safety Steps</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {selectedProtocol.steps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Required PPE</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProtocol.requiredPPE.map((ppe, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800">
                      {ppe}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedProtocol.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedProtocol.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsProtocolDetailOpen(false)}
                >
                  Close
                </Button>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Protocol
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
