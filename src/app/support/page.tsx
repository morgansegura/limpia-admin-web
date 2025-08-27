"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Search,
} from "lucide-react";

export default function SupportPage() {
  const {} = useAuth();
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "medium",
    description: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmitTicket = () => {
    // TODO: Implement ticket submission API call
    console.log("Submitting support ticket:", ticketForm);
    setTicketForm({
      subject: "",
      category: "",
      priority: "medium",
      description: "",
    });
  };

  const recentTickets = [
    {
      id: "TICKET-001",
      subject: "Dashboard loading issues",
      status: "in_progress",
      priority: "high",
      createdAt: "2024-08-15",
      responses: 2,
    },
    {
      id: "TICKET-002",
      subject: "Need help with crew scheduling",
      status: "resolved",
      priority: "medium",
      createdAt: "2024-08-10",
      responses: 5,
    },
  ];

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer:
        "You can reset your password from the login page by clicking &apos;Forgot Password&apos; or contact your administrator.",
    },
    {
      question: "How do I schedule a new job?",
      answer:
        "Navigate to the Jobs section and click &apos;Schedule New Job&apos;. Fill in the required details and assign a crew.",
    },
    {
      question: "Why can&apos;t I see certain menu items?",
      answer:
        "Menu items are based on your role permissions. Contact your administrator if you need access to additional features.",
    },
    {
      question: "How do I update customer information?",
      answer:
        "Go to the Customers section, find the customer, and click on their profile to edit their information.",
    },
  ];

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">
          Get help with your questions and technical issues
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Help</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Phone className="w-4 h-4 mr-2" />
              Call Support: (555) 123-HELP
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Email: support@limpia.com
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Documentation
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </CardContent>
        </Card>

        {/* Submit New Ticket */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Submit Support Ticket</CardTitle>
            <p className="text-sm text-muted-foreground">
              Describe your issue and we&apos;ll get back to you as soon as
              possible
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={ticketForm.subject}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, subject: e.target.value })
                  }
                  placeholder="Brief description of your issue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(value) =>
                    setTicketForm({ ...ticketForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="account">Account & Billing</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="training">Training & How-to</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={ticketForm.priority}
                onValueChange={(value) =>
                  setTicketForm({ ...ticketForm, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - General question</SelectItem>
                  <SelectItem value="medium">
                    Medium - Non-urgent issue
                  </SelectItem>
                  <SelectItem value="high">High - Urgent issue</SelectItem>
                  <SelectItem value="critical">
                    Critical - System down
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={ticketForm.description}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, description: e.target.value })
                }
                placeholder="Please provide detailed information about your issue..."
                rows={4}
              />
            </div>

            <Button onClick={handleSubmitTicket} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Submit Ticket
            </Button>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Your Recent Tickets</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track the status of your support requests
            </p>
          </CardHeader>
          <CardContent>
            {recentTickets.length > 0 ? (
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <h4 className="font-medium">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ticket.id} • Created {ticket.createdAt} •{" "}
                          {ticket.responses} responses
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No support tickets yet</p>
                <p className="text-sm">
                  Submit a ticket above if you need assistance
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <h4 className="font-medium mb-2">{item.question}</h4>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </div>
              ))}
              {filteredFAQ.length === 0 && searchQuery && (
                <p className="text-center text-muted-foreground py-4">
                  No FAQ items found matching &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
