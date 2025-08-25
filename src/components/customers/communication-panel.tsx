"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  communicationsApi,
  CustomerCommunication,
  SendCommunicationRequest,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  preferences?: {
    communicationMethod?: "email" | "sms" | "phone";
  };
}

interface CommunicationPanelProps {
  customer: Customer;
  onSendCommunication?: (data: SendCommunicationRequest) => Promise<void>;
}

const COMMUNICATION_METHODS = {
  email: { name: "Email", icon: Mail, color: "bg-blue-500" },
  sms: { name: "SMS", icon: MessageSquare, color: "bg-green-500" },
  phone: { name: "Phone", icon: Phone, color: "bg-purple-500" },
  app: { name: "App", icon: Smartphone, color: "bg-orange-500" },
};

const COMMUNICATION_TYPES = {
  BOOKING_CONFIRMATION: "Booking Confirmation",
  BOOKING_REMINDER: "Booking Reminder",
  SERVICE_UPDATE: "Service Update",
  MARKETING: "Marketing",
  SURVEY: "Survey",
};

const STATUS_ICONS = {
  sent: { icon: Clock, color: "text-yellow-500", label: "Sent" },
  delivered: { icon: CheckCircle, color: "text-green-500", label: "Delivered" },
  read: { icon: CheckCircle, color: "text-blue-500", label: "Read" },
  failed: { icon: AlertCircle, color: "text-red-500", label: "Failed" },
};

export function CommunicationPanel({
  customer,
  onSendCommunication,
}: CommunicationPanelProps) {
  const [communications, setCommunications] = useState<CustomerCommunication[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState({
    method: customer.preferences?.communicationMethod || "email",
    type: "SERVICE_UPDATE",
    subject: "",
    message: "",
  });
  const { toast } = useToast();

  // Load communications on component mount
  useEffect(() => {
    loadCommunications();
  }, [customer.id]);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const data = await communicationsApi.getCustomerCommunications(
        customer.id,
      );
      setCommunications(data);
    } catch (error) {
      console.error("Failed to load communications:", error);
      toast({
        title: "Error",
        description: "Failed to load communication history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.message.trim() || !newMessage.subject.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const communicationData: SendCommunicationRequest = {
        method: newMessage.method,
        type: newMessage.type,
        subject: newMessage.subject,
        message: newMessage.message,
      };

      const sentCommunication = await communicationsApi.sendCommunication(
        customer.id,
        communicationData,
      );

      // Add to local state
      setCommunications((prev) => [sentCommunication, ...prev]);

      // Call parent callback if provided
      if (onSendCommunication) {
        await onSendCommunication(communicationData);
      }

      // Reset form
      setNewMessage({
        method: customer.preferences?.communicationMethod || "email",
        type: "SERVICE_UPDATE",
        subject: "",
        message: "",
      });
      setIsNewMessageOpen(false);

      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    const MethodIcon =
      COMMUNICATION_METHODS[method as keyof typeof COMMUNICATION_METHODS]
        ?.icon || Mail;
    return MethodIcon;
  };

  const getStatusIcon = (status: string) => {
    const statusInfo = STATUS_ICONS[status as keyof typeof STATUS_ICONS];
    return statusInfo || STATUS_ICONS.sent;
  };

  const getMethodFromMetadata = (metadata: any) => {
    return metadata?.method || "email";
  };

  const getStatusFromCommunication = (communication: CustomerCommunication) => {
    if (communication.readAt) return "read";
    if (communication.deliveredAt) return "delivered";
    if (communication.sentAt) return "sent";
    return "sent";
  };

  return (
    <div className="space-y-6">
      {/* Header with New Message Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Communication History</h3>
          <p className="text-sm text-muted-foreground">
            All messages sent to {customer.firstName} {customer.lastName}
          </p>
        </div>

        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-1 h-4 w-4" />
              Send Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Send Message to {customer.firstName} {customer.lastName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="method">Communication Method</Label>
                  <Select
                    value={newMessage.method}
                    onValueChange={(value) =>
                      setNewMessage({ ...newMessage, method: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="phone">Phone Call Notes</SelectItem>
                      <SelectItem value="app">App Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Message Type</Label>
                  <Select
                    value={newMessage.type}
                    onValueChange={(value) =>
                      setNewMessage({ ...newMessage, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COMMUNICATION_TYPES).map(
                        ([key, name]) => (
                          <SelectItem key={key} value={key}>
                            {name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newMessage.subject}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, subject: e.target.value })
                  }
                  placeholder="Enter message subject"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newMessage.message}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, message: e.target.value })
                  }
                  placeholder="Type your message here..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewMessageOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-1 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Communication History */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="text-muted-foreground">
                Loading communication history...
              </div>
            </CardContent>
          </Card>
        ) : communications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No communications yet
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start a conversation with {customer.firstName} by sending your
                first message.
              </p>
              <Button
                className="mt-4"
                onClick={() => setIsNewMessageOpen(true)}
              >
                <Send className="mr-1 h-4 w-4" />
                Send First Message
              </Button>
            </CardContent>
          </Card>
        ) : (
          communications.map((communication) => {
            const method = getMethodFromMetadata(communication.metadata);
            const MethodIcon = getMethodIcon(method);
            const status = getStatusFromCommunication(communication);
            const statusInfo = getStatusIcon(status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={communication.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          COMMUNICATION_METHODS[
                            method as keyof typeof COMMUNICATION_METHODS
                          ]?.color || "bg-gray-500"
                        } text-white`}
                      >
                        <MethodIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">
                          {communication.subject}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {COMMUNICATION_TYPES[
                              communication.type as keyof typeof COMMUNICATION_TYPES
                            ] || communication.type}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <StatusIcon
                              className={`h-3 w-3 ${statusInfo.color}`}
                            />
                            <span>{statusInfo.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(communication.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm">{communication.content}</p>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>
                        {communication.initiatedBy
                          ? `${communication.initiatedBy.firstName} ${communication.initiatedBy.lastName}`
                          : "System"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{method.toUpperCase()}</span>
                      {communication.sentAt && (
                        <span>
                          • Sent{" "}
                          {formatDistanceToNow(new Date(communication.sentAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
