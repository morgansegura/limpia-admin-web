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
import {
  UserCheck,
  FileText,
  AlertTriangle,
  CheckCircle,
  Users,
  Edit,
  Download,
  Plus,
  Briefcase,
  Award,
  Shield,
} from "lucide-react";

interface WorkerClassification {
  id: string;
  workerId: string;
  workerName: string;
  email: string;
  phone: string;
  address: string;
  classification: "W2" | "1099";
  department: string;
  position: string;
  hireDate: Date;
  hourlyRate?: number;
  salary?: number;
  contractRate?: number;
  benefits: string[];
  taxWithholdings: {
    federal: number;
    state: number;
    social: number;
    medicare: number;
  };
  documents: {
    w4?: string;
    w9?: string;
    contract?: string;
    i9?: string;
  };
  status: "active" | "inactive" | "terminated";
  lastReview: Date;
  complianceChecks: {
    backgroundCheck: boolean;
    drugTest: boolean;
    certification: boolean;
    insurance: boolean;
  };
  performanceMetrics: {
    rating: number;
    completedJobs: number;
    customerSatisfaction: number;
    punctuality: number;
  };
}

interface TaxDocument {
  id: string;
  workerId: string;
  type: "W4" | "W9" | "W2" | "1099-NEC" | "I9";
  year: number;
  status: "pending" | "completed" | "submitted";
  dateCreated: Date;
  dateSubmitted?: Date;
  amount?: number;
}

const mockWorkerClassifications: WorkerClassification[] = [
  {
    id: "1",
    workerId: "W001",
    workerName: "Maria Rodriguez",
    email: "maria@limpia.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Austin, TX 78701",
    classification: "W2",
    department: "Cleaning",
    position: "Senior House Cleaner",
    hireDate: new Date("2023-01-15"),
    hourlyRate: 18.5,
    benefits: ["Health Insurance", "Paid Time Off", "Retirement Plan"],
    taxWithholdings: {
      federal: 12,
      state: 5,
      social: 6.2,
      medicare: 1.45,
    },
    documents: {
      w4: "w4-maria-2024.pdf",
      i9: "i9-maria-2024.pdf",
    },
    status: "active",
    lastReview: new Date("2024-01-15"),
    complianceChecks: {
      backgroundCheck: true,
      drugTest: true,
      certification: true,
      insurance: true,
    },
    performanceMetrics: {
      rating: 4.8,
      completedJobs: 245,
      customerSatisfaction: 4.9,
      punctuality: 96,
    },
  },
  {
    id: "2",
    workerId: "C001",
    workerName: "James Wilson",
    email: "james.wilson@contractor.com",
    phone: "(555) 987-6543",
    address: "456 Oak Ave, Austin, TX 78702",
    classification: "1099",
    department: "Commercial",
    position: "Commercial Cleaning Contractor",
    hireDate: new Date("2023-03-20"),
    contractRate: 45.0,
    benefits: [],
    taxWithholdings: {
      federal: 0,
      state: 0,
      social: 0,
      medicare: 0,
    },
    documents: {
      w9: "w9-james-2024.pdf",
      contract: "contract-james-2024.pdf",
    },
    status: "active",
    lastReview: new Date("2024-03-20"),
    complianceChecks: {
      backgroundCheck: true,
      drugTest: true,
      certification: true,
      insurance: false,
    },
    performanceMetrics: {
      rating: 4.6,
      completedJobs: 89,
      customerSatisfaction: 4.7,
      punctuality: 94,
    },
  },
];

const mockTaxDocuments: TaxDocument[] = [
  {
    id: "1",
    workerId: "W001",
    type: "W2",
    year: 2024,
    status: "completed",
    dateCreated: new Date("2024-01-31"),
    dateSubmitted: new Date("2024-01-31"),
    amount: 38450,
  },
  {
    id: "2",
    workerId: "C001",
    type: "1099-NEC",
    year: 2024,
    status: "completed",
    dateCreated: new Date("2024-01-31"),
    dateSubmitted: new Date("2024-01-31"),
    amount: 67200,
  },
];

export function WorkerClassification() {
  const [workers] = useState<WorkerClassification[]>(mockWorkerClassifications);
  const [taxDocuments] = useState<TaxDocument[]>(mockTaxDocuments);
  const [selectedWorker, setSelectedWorker] =
    useState<WorkerClassification | null>(null);
  const [isWorkerDetailOpen, setIsWorkerDetailOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [filterClassification, setFilterClassification] =
    useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("workers");

  const filteredWorkers = workers.filter((worker) => {
    if (
      filterClassification !== "all" &&
      worker.classification !== filterClassification
    )
      return false;
    if (filterDepartment !== "all" && worker.department !== filterDepartment)
      return false;
    if (filterStatus !== "all" && worker.status !== filterStatus) return false;
    return true;
  });

  const classificationStats = {
    total: workers.length,
    w2Workers: workers.filter((w) => w.classification === "W2").length,
    contractorWorkers: workers.filter((w) => w.classification === "1099")
      .length,
    activeWorkers: workers.filter((w) => w.status === "active").length,
    avgHourlyRate:
      workers
        .filter((w) => w.hourlyRate)
        .reduce((acc, w) => acc + (w.hourlyRate || 0), 0) /
      workers.filter((w) => w.hourlyRate).length,
    complianceRate:
      (workers.filter(
        (w) =>
          w.complianceChecks.backgroundCheck &&
          w.complianceChecks.drugTest &&
          w.complianceChecks.certification,
      ).length /
        workers.length) *
      100,
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case "W2":
        return <Badge className="bg-blue-100 text-blue-800">W2 Employee</Badge>;
      case "1099":
        return (
          <Badge className="bg-green-100 text-green-800">1099 Contractor</Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
        );
      case "terminated":
        return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Worker Classification
          </h1>
          <p className="mt-2 text-gray-600">
            Manage employee and contractor classifications, tax documents, and
            compliance
          </p>
        </div>
        <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workerName">Worker Name</Label>
                  <Input id="workerName" placeholder="Enter worker name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="classification">Classification</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="W2">W2 Employee</SelectItem>
                      <SelectItem value="1099">1099 Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cleaning">Cleaning</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddWorkerOpen(false)}
                >
                  Cancel
                </Button>
                <Button>Add Worker</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classificationStats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {classificationStats.activeWorkers} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">W2 Employees</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classificationStats.w2Workers}
            </div>
            <p className="text-xs text-muted-foreground">Full-time employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              1099 Contractors
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classificationStats.contractorWorkers}
            </div>
            <p className="text-xs text-muted-foreground">
              Independent contractors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classificationStats.complianceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              All checks completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="tax-documents">Tax Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="workers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Worker Directory</CardTitle>
                <div className="flex space-x-2">
                  <Select
                    value={filterClassification}
                    onValueChange={setFilterClassification}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classifications</SelectItem>
                      <SelectItem value="W2">W2 Employees</SelectItem>
                      <SelectItem value="1099">1099 Contractors</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterDepartment}
                    onValueChange={setFilterDepartment}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Cleaning">Cleaning</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedWorker(worker);
                      setIsWorkerDetailOpen(true);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {worker.workerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {worker.position} • {worker.department}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getClassificationBadge(worker.classification)}
                          {getStatusBadge(worker.status)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {worker.classification === "W2"
                          ? formatCurrency(worker.hourlyRate || 0) + "/hr"
                          : formatCurrency(worker.contractRate || 0) + "/hr"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Rating: {worker.performanceMetrics.rating}/5.0
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-documents">
          <Card>
            <CardHeader>
              <CardTitle>Tax Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxDocuments.map((doc) => {
                  const worker = workers.find(
                    (w) => w.workerId === doc.workerId,
                  );
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {doc.type} - {doc.year}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {worker?.workerName} • {doc.status}
                          </p>
                          {doc.amount && (
                            <p className="text-sm font-medium text-green-600">
                              {formatCurrency(doc.amount)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workers.map((worker) => (
                  <div key={worker.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {worker.workerName}
                      </h3>
                      {getClassificationBadge(worker.classification)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        {worker.complianceChecks.backgroundCheck ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">Background Check</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {worker.complianceChecks.drugTest ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">Drug Test</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {worker.complianceChecks.certification ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">Certification</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {worker.complianceChecks.insurance ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">Insurance</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Worker Detail Dialog */}
      <Dialog open={isWorkerDetailOpen} onOpenChange={setIsWorkerDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Worker Details</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm">{selectedWorker.workerName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">{selectedWorker.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{selectedWorker.phone}</p>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <p className="text-sm">{selectedWorker.address}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Employment Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Classification</Label>
                      <div className="mt-1">
                        {getClassificationBadge(selectedWorker.classification)}
                      </div>
                    </div>
                    <div>
                      <Label>Department</Label>
                      <p className="text-sm">{selectedWorker.department}</p>
                    </div>
                    <div>
                      <Label>Position</Label>
                      <p className="text-sm">{selectedWorker.position}</p>
                    </div>
                    <div>
                      <Label>Hire Date</Label>
                      <p className="text-sm">
                        {selectedWorker.hireDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label>Rate</Label>
                      <p className="text-sm font-medium">
                        {selectedWorker.classification === "W2"
                          ? formatCurrency(selectedWorker.hourlyRate || 0) +
                            "/hr"
                          : formatCurrency(selectedWorker.contractRate || 0) +
                            "/hr"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedWorker.classification === "W2" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Tax Withholdings</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Federal</Label>
                      <p className="text-sm">
                        {selectedWorker.taxWithholdings.federal}%
                      </p>
                    </div>
                    <div>
                      <Label>State</Label>
                      <p className="text-sm">
                        {selectedWorker.taxWithholdings.state}%
                      </p>
                    </div>
                    <div>
                      <Label>Social Security</Label>
                      <p className="text-sm">
                        {selectedWorker.taxWithholdings.social}%
                      </p>
                    </div>
                    <div>
                      <Label>Medicare</Label>
                      <p className="text-sm">
                        {selectedWorker.taxWithholdings.medicare}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Rating</Label>
                    <p className="text-sm font-medium">
                      {selectedWorker.performanceMetrics.rating}/5.0
                    </p>
                  </div>
                  <div>
                    <Label>Completed Jobs</Label>
                    <p className="text-sm">
                      {selectedWorker.performanceMetrics.completedJobs}
                    </p>
                  </div>
                  <div>
                    <Label>Customer Satisfaction</Label>
                    <p className="text-sm">
                      {selectedWorker.performanceMetrics.customerSatisfaction}
                      /5.0
                    </p>
                  </div>
                  <div>
                    <Label>Punctuality</Label>
                    <p className="text-sm">
                      {selectedWorker.performanceMetrics.punctuality}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsWorkerDetailOpen(false)}
                >
                  Close
                </Button>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Worker
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
