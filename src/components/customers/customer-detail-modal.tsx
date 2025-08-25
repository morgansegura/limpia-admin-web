"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Star,
  Clock,
  Edit,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: string;
    joinDate: string;
    totalSpent: number;
    totalBookings: number;
    rating: number;
    lastService?: string;
    nextService?: string;
    serviceType: string;
    preferences?: {
      communicationMethod: string;
      cleaningProducts: string;
      specialRequests: string;
    };
  };
  onEdit?: () => void;
  onMessage?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
}

const mockServiceHistory = [
  {
    id: "SVC-001",
    date: "2024-01-15",
    service: "Deep Cleaning",
    duration: "4 hours",
    crew: "Team Alpha",
    amount: 350,
    status: "Completed",
    rating: 5,
    notes: "Excellent service, customer very satisfied",
  },
  {
    id: "SVC-002",
    date: "2024-01-01",
    service: "Regular Cleaning",
    duration: "2 hours",
    crew: "Team Beta",
    amount: 150,
    status: "Completed",
    rating: 4,
    notes: "Good service, minor feedback on bathroom cleaning",
  },
  {
    id: "SVC-003",
    date: "2023-12-15",
    service: "Regular Cleaning",
    duration: "2 hours",
    crew: "Team Alpha",
    amount: 150,
    status: "Completed",
    rating: 5,
    notes: "Perfect as always",
  },
];

const mockCommunicationHistory = [
  {
    id: "COM-001",
    type: "email",
    subject: "Service Confirmation - January 15th",
    date: "2024-01-14",
    direction: "outbound",
    status: "delivered",
  },
  {
    id: "COM-002",
    type: "call",
    subject: "Follow-up on service quality",
    date: "2024-01-10",
    direction: "outbound",
    duration: "5 minutes",
    status: "completed",
  },
  {
    id: "COM-003",
    type: "sms",
    subject: "Crew arriving in 30 minutes",
    date: "2024-01-01",
    direction: "outbound",
    status: "delivered",
  },
];

const mockPaymentHistory = [
  {
    id: "PAY-001",
    date: "2024-01-15",
    amount: 350,
    method: "Credit Card",
    status: "Paid",
    invoice: "INV-001",
  },
  {
    id: "PAY-002",
    date: "2024-01-01",
    amount: 150,
    method: "Credit Card",
    status: "Paid",
    invoice: "INV-002",
  },
  {
    id: "PAY-003",
    date: "2023-12-15",
    amount: 150,
    method: "Bank Transfer",
    status: "Paid",
    invoice: "INV-003",
  },
];

export function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  onEdit,
  onMessage,
  onCall,
  onEmail,
}: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-lg">
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{customer.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                  <div className="flex items-center">
                    {renderStars(customer.rating)}
                    <span className="ml-1 text-sm text-gray-600">
                      ({customer.rating}/5)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onMessage}>
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onCall}>
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onEmail}>
                <Mail className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Service History</TabsTrigger>
            <TabsTrigger value="communication">Communications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-gray-600">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-sm text-gray-600">
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-sm text-gray-600">
                        {customer.address}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Account Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${customer?.totalSpent?.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {customer.totalBookings}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Services
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Customer Since</div>
                    <div className="text-sm text-gray-600">
                      {new Date(customer.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Service Type</div>
                    <div className="text-sm text-gray-600">
                      {customer.serviceType}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">Last Service</div>
                      <div className="text-sm text-gray-600">
                        {customer.lastService
                          ? new Date(customer.lastService).toLocaleDateString()
                          : "No recent service"}
                      </div>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div>
                      <div className="font-medium">Next Scheduled Service</div>
                      <div className="text-sm text-gray-600">
                        {customer.nextService
                          ? new Date(customer.nextService).toLocaleDateString()
                          : "Not scheduled"}
                      </div>
                    </div>
                    <Badge>Upcoming</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Crew</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockServiceHistory.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          {new Date(service.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{service.service}</TableCell>
                        <TableCell>{service.crew}</TableCell>
                        <TableCell>{service.duration}</TableCell>
                        <TableCell>${service.amount}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {renderStars(service.rating)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject/Description</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCommunicationHistory.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell>
                          {new Date(comm.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {comm.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{comm.subject}</TableCell>
                        <TableCell>{comm.direction}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{comm.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPaymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payment.invoice}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">
                    Preferred Communication Method
                  </div>
                  <div className="text-sm text-gray-600">
                    {customer.preferences?.communicationMethod || "Email"}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Cleaning Products</div>
                  <div className="text-sm text-gray-600">
                    {customer.preferences?.cleaningProducts ||
                      "Standard eco-friendly products"}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Special Requests</div>
                  <div className="text-sm text-gray-600">
                    {customer.preferences?.specialRequests || "None"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
