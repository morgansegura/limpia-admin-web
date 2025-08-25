"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  MessageSquare,
  FileText,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunicationPanel } from "@/components/customers/communication-panel";
import { MessageTemplates } from "@/components/customers/message-templates";
import { FeedbackSystem } from "@/components/customers/feedback-system";
import { CustomerCreationForm } from "@/components/customers/customer-creation-form";
import { PhoneCallModal } from "@/components/customers/phone-call-modal";
import { EmailComposeModal } from "@/components/customers/email-compose-modal";
import { InstantMessageModal } from "@/components/customers/instant-message-modal";
import { CustomerDetailModal } from "@/components/customers/customer-detail-modal";
import { customersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Fallback customer data for when API is not available
const fallbackCustomers = [
  {
    id: "1",
    firstName: "Customer",
    lastName: "A",
    email: "customer.a@email.com",
    phone: "+1 (305) 555-0123",
    address: "1200 Brickell Ave, Miami, FL 33131",
    status: "VIP",
    totalBookings: 24,
    totalSpent: 6800,
    lastBooking: new Date("2024-08-14T10:00:00"),
    averageRating: 4.9,
    joinedDate: new Date("2023-03-15"),
    preferences: ["Eco-friendly products", "No pets"],
    preferredContactMethod: "email" as "email" | "sms" | "phone",
  },
  {
    id: "2",
    firstName: "Robert",
    lastName: "Kim",
    email: "robert.kim@email.com",
    phone: "+1 (305) 555-0124",
    address: "500 Biscayne Blvd, Miami, FL 33132",
    status: "Regular",
    totalBookings: 18,
    totalSpent: 5400,
    lastBooking: new Date("2024-08-12T14:30:00"),
    averageRating: 4.7,
    joinedDate: new Date("2023-06-22"),
    preferences: ["Two small dogs", "Flexible timing"],
    preferredContactMethod: "sms" as "email" | "sms" | "phone",
  },
  {
    id: "3",
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@email.com",
    phone: "+1 (305) 555-0125",
    address: "850 Miami Ave, Miami, FL 33130",
    status: "Regular",
    totalBookings: 15,
    totalSpent: 4200,
    lastBooking: new Date("2024-08-16T08:00:00"),
    averageRating: 4.8,
    joinedDate: new Date("2023-09-10"),
    preferences: ["Weekly service", "Morning appointments"],
    preferredContactMethod: "phone" as "email" | "sms" | "phone",
  },
  {
    id: "4",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@email.com",
    phone: "+1 (305) 555-0126",
    address: "2000 Ocean Dr, Miami Beach, FL 33139",
    status: "VIP",
    totalBookings: 21,
    totalSpent: 7350,
    lastBooking: new Date("2024-08-11T16:00:00"),
    averageRating: 4.6,
    joinedDate: new Date("2023-01-20"),
    preferences: ["Luxury service", "Weekend availability"],
    preferredContactMethod: "email" as "email" | "sms" | "phone",
  },
  {
    id: "5",
    firstName: "Anna",
    lastName: "Taylor",
    email: "anna.taylor@email.com",
    phone: "+1 (305) 555-0127",
    address: "1500 Collins Ave, Miami Beach, FL 33140",
    status: "New",
    totalBookings: 3,
    totalSpent: 890,
    lastBooking: new Date("2024-08-15T11:00:00"),
    averageRating: 5.0,
    joinedDate: new Date("2024-07-28"),
    preferences: ["First-time customer", "Pet-friendly"],
    preferredContactMethod: "sms" as "email" | "sms" | "phone",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "VIP":
      return "default";
    case "Regular":
      return "secondary";
    case "New":
      return "outline";
    default:
      return "secondary";
  }
};

export default function CustomersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isCrmDialogOpen, setIsCrmDialogOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [customersList, setCustomersList] = useState<any[]>([]);
  
  // CRM Modal states
  const [phoneCallModalOpen, setPhoneCallModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [customerDetailModalOpen, setCustomerDetailModalOpen] = useState(false);

  // Load customers from API
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const customersData = await customersApi.getAll();
        setCustomers(customersData);
        setCustomersList(customersData);
      } catch (error) {
        console.error("Error loading customers:", error);
        // Use fallback data if API fails
        setCustomers(fallbackCustomers);
        setCustomersList(fallbackCustomers);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const handleSendCommunication = async (data: {
    method: string;
    type: string;
    subject: string;
    message: string;
    bookingIds?: string[];
  }) => {
    // Here you would integrate with your API
    console.log("Sending communication:", data);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // CRM Handler Functions
  const handlePhoneCall = (customer: any) => {
    setSelectedCustomer(customer);
    setPhoneCallModalOpen(true);
  };

  const handleEmail = (customer: any) => {
    setSelectedCustomer(customer);
    setEmailModalOpen(true);
  };

  const handleMessage = (customer: any) => {
    setSelectedCustomer(customer);
    setMessageModalOpen(true);
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerDetailModalOpen(true);
  };

  const handleCallLogged = async (callData: any) => {
    try {
      // This would normally call the API to log the call
      console.log('Call logged:', callData);
      toast({
        title: "Call Logged",
        description: `Call with ${callData.customerName} has been logged`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log call",
        variant: "destructive",
      });
    }
  };

  const handleEmailSent = async (emailData: any) => {
    try {
      // This would normally call the API to send the email
      console.log('Email sent:', emailData);
      toast({
        title: "Email Sent",
        description: `Email sent to ${emailData.customerName}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const handleMessageSent = async (messageData: any) => {
    try {
      // This would normally call the API to log the message
      console.log('Message sent:', messageData);
      toast({
        title: "Message Sent",
        description: `Message sent to ${messageData.customerName}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSelectTemplate = (template: {
    id: string;
    name: string;
    type: string;
    method: string;
    subject: string;
    message: string;
    variables: string[];
  }) => {
    console.log("Selected template:", template);
    // Here you would populate the communication form with the template
  };

  const handleCreateTemplate = (template: {
    name: string;
    type: string;
    method: string;
    subject: string;
    message: string;
    variables?: string[];
  }) => {
    console.log("Creating template:", template);
    // Here you would save the template to your backend
  };

  const handleCustomerCreated = (newCustomer: any) => {
    setCustomersList((prev) => [newCustomer, ...prev]);
  };

  const filteredCustomers = customersList.filter((customer) => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customersList.length;
  const vipCustomers = customersList.filter((c) => c.status === "VIP").length;
  const newCustomers = customersList.filter((c) => c.status === "New").length;
  const avgCustomerValue =
    customersList.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Customer Management
          </h1>
          <p className="text-muted-foreground">
            Manage customer relationships and service history
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCrmDialogOpen} onOpenChange={setIsCrmDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="mr-1 h-4 w-4" />
                CRM Tools
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Customer Communication & CRM
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="templates" className="h-full">
                <TabsList>
                  <TabsTrigger value="templates" className="flex items-center">
                    <FileText className="mr-1 h-4 w-4" />
                    Message Templates
                  </TabsTrigger>
                  {selectedCustomer && (
                    <TabsTrigger
                      value="communication"
                      className="flex items-center"
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Communication History
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="feedback" className="flex items-center">
                    <BarChart3 className="mr-1 h-4 w-4" />
                    Customer Feedback
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="templates"
                  className="overflow-y-auto max-h-[70vh]"
                >
                  <MessageTemplates
                    onSelectTemplate={handleSelectTemplate}
                    onCreateTemplate={handleCreateTemplate}
                  />
                </TabsContent>
                {selectedCustomer && (
                  <TabsContent
                    value="communication"
                    className="overflow-y-auto max-h-[70vh]"
                  >
                    <CommunicationPanel
                      customer={selectedCustomer}
                      onSendCommunication={handleSendCommunication}
                    />
                  </TabsContent>
                )}
                <TabsContent
                  value="feedback"
                  className="overflow-y-auto max-h-[70vh]"
                >
                  <FeedbackSystem customerId={selectedCustomer?.id} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button onClick={() => setIsCustomerFormOpen(true)}>
            <UserPlus className="mr-1 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customer base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vipCustomers}</div>
            <p className="text-xs text-muted-foreground">
              High-value customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomers}</div>
            <p className="text-xs text-muted-foreground">Recent acquisitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Customer Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgCustomerValue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="New">New</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Booking</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading customers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all"
                        ? "No customers found matching your criteria"
                        : "No customers found"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {totalCustomers > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer?.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {customer.firstName[0]}
                                {customer.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {customer.firstName} {customer.lastName}
                              </div>
                              {customer?.address?.length > 0 ? (
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {customer?.address?.split(",")[0]}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStatusColor(customer.status) as
                                | "default"
                                | "secondary"
                                | "outline"
                                | "destructive"
                                | null
                                | undefined
                            }
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.totalBookings}</TableCell>
                        <TableCell className="font-medium">
                          ${customer?.totalSpent?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {customer?.lastBooking ? (
                                formatDistanceToNow(customer?.lastBooking, {
                                  addSuffix: true,
                                })
                              ) : (
                                <p>There are currently no bookings.</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {customer.averageRating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMessage(customer)}
                              title="Instant message"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePhoneCall(customer)}
                              title="Call customer"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEmail(customer)}
                              title="Email customer"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <p>There are currently no customers.</p>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Creation Dialog */}
      <Dialog open={isCustomerFormOpen} onOpenChange={setIsCustomerFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Add New Customer
            </DialogTitle>
          </DialogHeader>
          <CustomerCreationForm
            onClose={() => setIsCustomerFormOpen(false)}
            onCustomerCreated={handleCustomerCreated}
          />
        </DialogContent>
      </Dialog>

      {/* CRM Modals */}
      {selectedCustomer && (
        <>
          <PhoneCallModal
            isOpen={phoneCallModalOpen}
            onClose={() => setPhoneCallModalOpen(false)}
            customer={{
              id: selectedCustomer.id,
              name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
              phone: selectedCustomer.phone,
              email: selectedCustomer.email,
            }}
            onCallLogged={handleCallLogged}
          />

          <EmailComposeModal
            isOpen={emailModalOpen}
            onClose={() => setEmailModalOpen(false)}
            customer={{
              id: selectedCustomer.id,
              name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
              email: selectedCustomer.email,
              phone: selectedCustomer.phone,
            }}
            onEmailSent={handleEmailSent}
          />

          <InstantMessageModal
            isOpen={messageModalOpen}
            onClose={() => setMessageModalOpen(false)}
            customer={{
              id: selectedCustomer.id,
              name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
              phone: selectedCustomer.phone,
              email: selectedCustomer.email,
            }}
            onMessageSent={handleMessageSent}
          />

          <CustomerDetailModal
            isOpen={customerDetailModalOpen}
            onClose={() => setCustomerDetailModalOpen(false)}
            customer={{
              id: selectedCustomer.id,
              name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
              email: selectedCustomer.email,
              phone: selectedCustomer.phone,
              address: selectedCustomer.address,
              status: selectedCustomer.status,
              joinDate: selectedCustomer.joinedDate?.toISOString() || new Date().toISOString(),
              totalSpent: selectedCustomer.totalSpent,
              totalBookings: selectedCustomer.totalBookings,
              rating: selectedCustomer.averageRating,
              lastService: selectedCustomer.lastBooking?.toISOString(),
              nextService: undefined,
              serviceType: 'Regular Cleaning',
              preferences: {
                communicationMethod: selectedCustomer.preferredContactMethod,
                cleaningProducts: selectedCustomer.preferences?.[0] || 'Standard eco-friendly products',
                specialRequests: selectedCustomer.preferences?.[1] || 'None',
              },
            }}
            onEdit={() => {
              setCustomerDetailModalOpen(false);
              // Add edit functionality here
            }}
            onMessage={() => {
              setCustomerDetailModalOpen(false);
              setMessageModalOpen(true);
            }}
            onCall={() => {
              setCustomerDetailModalOpen(false);
              setPhoneCallModalOpen(true);
            }}
            onEmail={() => {
              setCustomerDetailModalOpen(false);
              setEmailModalOpen(true);
            }}
          />
        </>
      )}
    </div>
  );
}
