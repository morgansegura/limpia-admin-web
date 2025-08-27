"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Send, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface NotificationSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  scheduledDate?: string;
  serviceType?: string;
  onNotificationsSent: (notificationData: unknown) => void;
}

const NOTIFICATION_TEMPLATES = {
  service_confirmation: {
    email: {
      subject: "Service Confirmation - {{customerName}}",
      body: `Hi {{customerName}},

Your {{serviceType}} service has been confirmed for {{scheduledDate}} at {{scheduledTime}}.

Service Details:
- Date: {{scheduledDate}}
- Time: {{scheduledTime}}
- Service: {{serviceType}}
- Crew: {{crewName}}

We'll send you a reminder 24 hours before your service.

If you need to reschedule or have any questions, please contact us at {{companyPhone}}.

Best regards,
{{companyName}} Team`,
    },
    sms: {
      body: `Hi {{customerName}}! Your {{serviceType}} is confirmed for {{scheduledDate}} at {{scheduledTime}}. Crew: {{crewName}}. Questions? Call {{companyPhone}}`,
    },
  },
  service_reminder: {
    email: {
      subject: "Reminder: Service Tomorrow - {{customerName}}",
      body: `Hi {{customerName}},

This is a friendly reminder that your {{serviceType}} service is scheduled for tomorrow.

Details:
- Date: {{scheduledDate}}
- Time: {{scheduledTime}}
- Crew: {{crewName}}

Please ensure:
- Someone is available to provide access
- Pets are secured
- Any special instructions are noted

See you tomorrow!

{{companyName}} Team`,
    },
    sms: {
      body: `Reminder: Your {{serviceType}} is tomorrow {{scheduledDate}} at {{scheduledTime}}. Please ensure access is available. {{companyName}}`,
    },
  },
  crew_ontheway: {
    email: {
      subject: "Crew On The Way - {{customerName}}",
      body: `Hi {{customerName}},

Our crew is on their way to your location and should arrive within the scheduled time window.

Crew Details:
- Lead: {{crewLeadName}}
- ETA: {{estimatedArrival}}
- Phone: {{crewPhone}}

They'll call when they arrive. Thank you for choosing {{companyName}}!`,
    },
    sms: {
      body: `Hi {{customerName}}! Our crew is on the way. ETA: {{estimatedArrival}}. Lead: {{crewLeadName}} {{crewPhone}}. {{companyName}}`,
    },
  },
  service_complete: {
    email: {
      subject: "Service Complete - {{customerName}}",
      body: `Hi {{customerName}},

Your {{serviceType}} service has been completed successfully!

Service Summary:
- Completed: {{completedTime}}
- Duration: {{serviceDuration}}
- Notes: {{serviceNotes}}

We hope you're satisfied with our service. Please don't hesitate to reach out if you have any questions.

Your next scheduled service: {{nextServiceDate}}

Thank you for choosing {{companyName}}!`,
    },
    sms: {
      body: `Service complete! Thanks for choosing {{companyName}}. Next service: {{nextServiceDate}}. Rate us: {{reviewLink}}`,
    },
  },
};

const TEMPLATE_VARIABLES = [
  "customerName",
  "serviceType",
  "scheduledDate",
  "scheduledTime",
  "crewName",
  "crewLeadName",
  "crewPhone",
  "companyName",
  "companyPhone",
  "estimatedArrival",
  "completedTime",
  "serviceDuration",
  "serviceNotes",
  "nextServiceDate",
  "reviewLink",
];

export function NotificationSystemModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  scheduledDate,
  serviceType,
  onNotificationsSent,
}: NotificationSystemModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [notificationMethods, setNotificationMethods] = useState({
    email: !!customerEmail,
    sms: !!customerPhone,
  });
  const [customContent, setCustomContent] = useState({
    email: { subject: "", body: "" },
    sms: { body: "" },
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [scheduledSend, setScheduledSend] = useState({
    enabled: false,
    dateTime: "",
  });

  const templateData = selectedTemplate
    ? NOTIFICATION_TEMPLATES[
        selectedTemplate as keyof typeof NOTIFICATION_TEMPLATES
      ]
    : null;

  const replaceVariables = (text: string) => {
    const variables = {
      customerName,
      serviceType: serviceType || "Cleaning Service",
      scheduledDate: scheduledDate
        ? new Date(scheduledDate).toLocaleDateString()
        : "TBD",
      scheduledTime: scheduledDate
        ? new Date(scheduledDate).toLocaleTimeString()
        : "TBD",
      crewName: "Crew Alpha",
      crewLeadName: "John Smith",
      crewPhone: "(555) 123-4567",
      companyName: "Limpia Cleaning Services",
      companyPhone: "(555) 987-6543",
      estimatedArrival: "15 minutes",
      completedTime: new Date().toLocaleTimeString(),
      serviceDuration: "2 hours",
      serviceNotes: "Service completed successfully",
      nextServiceDate: "Next month",
      reviewLink: "https://reviews.limpia.com",
    };

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key as keyof typeof variables] || match;
    });
  };

  const getPreviewContent = (method: "email" | "sms") => {
    if (
      customContent[method].body ||
      (method === "email" && customContent.email.subject)
    ) {
      return method === "email"
        ? {
            subject: replaceVariables(customContent.email.subject),
            body: replaceVariables(customContent.email.body),
          }
        : {
            body: replaceVariables(customContent.sms.body),
          };
    }

    if (templateData) {
      return method === "email"
        ? {
            subject: replaceVariables(templateData.email.subject),
            body: replaceVariables(templateData.email.body),
          }
        : {
            body: replaceVariables(templateData.sms.body),
          };
    }

    return null;
  };

  const handleSendNotifications = async () => {
    setIsLoading(true);

    try {
      const notifications = [];

      if (notificationMethods.email && customerEmail) {
        const emailContent = getPreviewContent("email");
        if (emailContent) {
          notifications.push({
            type: "email",
            recipient: customerEmail,
            subject: emailContent.subject,
            content: emailContent.body,
            scheduled: scheduledSend.enabled ? scheduledSend.dateTime : null,
          });
        }
      }

      if (notificationMethods.sms && customerPhone) {
        const smsContent = getPreviewContent("sms");
        if (smsContent) {
          notifications.push({
            type: "sms",
            recipient: customerPhone,
            content: smsContent.body,
            scheduled: scheduledSend.enabled ? scheduledSend.dateTime : null,
          });
        }
      }

      const notificationData = {
        customerId,
        templateType: selectedTemplate,
        notifications,
        metadata: {
          customerName,
          serviceType,
          scheduledDate,
          sentAt: new Date().toISOString(),
        },
      };

      await onNotificationsSent(notificationData);

      toast({
        title: "Notifications Sent",
        description: `${notifications.length} notification(s) sent to ${customerName}`,
      });

      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send notifications";
      toast({
        title: "Notification Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template =
      NOTIFICATION_TEMPLATES[
        templateKey as keyof typeof NOTIFICATION_TEMPLATES
      ];
    setCustomContent({
      email: {
        subject: template.email.subject,
        body: template.email.body,
      },
      sms: {
        body: template.sms.body,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Send Notifications - {customerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notification Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a notification template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_confirmation">
                      Service Confirmation
                    </SelectItem>
                    <SelectItem value="service_reminder">
                      Service Reminder (24h)
                    </SelectItem>
                    <SelectItem value="crew_ontheway">
                      Crew On The Way
                    </SelectItem>
                    <SelectItem value="service_complete">
                      Service Complete
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Delivery Methods</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={notificationMethods.email}
                      onCheckedChange={(checked) =>
                        setNotificationMethods((prev) => ({
                          ...prev,
                          email: checked as boolean,
                        }))
                      }
                      disabled={!customerEmail}
                    />
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                      {!customerEmail && (
                        <Badge variant="destructive">No Email</Badge>
                      )}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={notificationMethods.sms}
                      onCheckedChange={(checked) =>
                        setNotificationMethods((prev) => ({
                          ...prev,
                          sms: checked as boolean,
                        }))
                      }
                      disabled={!customerPhone}
                    />
                    <Label htmlFor="sms" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      SMS
                      {!customerPhone && (
                        <Badge variant="destructive">No Phone</Badge>
                      )}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scheduledSend"
                  checked={scheduledSend.enabled}
                  onCheckedChange={(checked) =>
                    setScheduledSend((prev) => ({
                      ...prev,
                      enabled: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="scheduledSend">Schedule for later</Label>
              </div>

              {scheduledSend.enabled && (
                <div>
                  <Label htmlFor="scheduleDateTime">Send Date & Time</Label>
                  <Input
                    id="scheduleDateTime"
                    type="datetime-local"
                    value={scheduledSend.dateTime}
                    onChange={(e) =>
                      setScheduledSend((prev) => ({
                        ...prev,
                        dateTime: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Message Content</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {previewMode ? "Edit" : "Preview"}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={notificationMethods.email ? "email" : "sms"}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="email"
                      disabled={!notificationMethods.email}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger
                      value="sms"
                      disabled={!notificationMethods.sms}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      SMS
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-4">
                    {previewMode ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Subject (Preview)</Label>
                          <div className="p-3 bg-gray-50 rounded border">
                            {getPreviewContent("email")?.subject}
                          </div>
                        </div>
                        <div>
                          <Label>Body (Preview)</Label>
                          <div className="p-3 bg-gray-50 rounded border whitespace-pre-wrap">
                            {getPreviewContent("email")?.body}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="emailSubject">Subject</Label>
                          <Input
                            id="emailSubject"
                            value={customContent.email.subject}
                            onChange={(e) =>
                              setCustomContent((prev) => ({
                                ...prev,
                                email: {
                                  ...prev.email,
                                  subject: e.target.value,
                                },
                              }))
                            }
                            placeholder="Email subject..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="emailBody">Body</Label>
                          <Textarea
                            id="emailBody"
                            value={customContent.email.body}
                            onChange={(e) =>
                              setCustomContent((prev) => ({
                                ...prev,
                                email: { ...prev.email, body: e.target.value },
                              }))
                            }
                            placeholder="Email body..."
                            rows={8}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sms" className="space-y-4">
                    {previewMode ? (
                      <div>
                        <Label>Message (Preview)</Label>
                        <div className="p-3 bg-gray-50 rounded border">
                          {getPreviewContent("sms")?.body}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Character count:{" "}
                          {getPreviewContent("sms")?.body?.length || 0}/160
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="smsBody">Message</Label>
                        <Textarea
                          id="smsBody"
                          value={customContent.sms.body}
                          onChange={(e) =>
                            setCustomContent((prev) => ({
                              ...prev,
                              sms: { ...prev.sms, body: e.target.value },
                            }))
                          }
                          placeholder="SMS message..."
                          rows={4}
                          maxLength={160}
                        />
                        <div className="text-sm text-gray-600 mt-1">
                          {customContent.sms.body.length}/160 characters
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="mt-4">
                  <Label>Available Variables</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {TEMPLATE_VARIABLES.map((variable) => (
                      <Badge
                        key={variable}
                        variant="outline"
                        className="text-xs"
                      >
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedTemplate && (
                <span>
                  Will send{" "}
                  {notificationMethods.email && notificationMethods.sms
                    ? "email and SMS"
                    : notificationMethods.email
                      ? "email"
                      : "SMS"}{" "}
                  to {customerName}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendNotifications}
                disabled={
                  isLoading ||
                  !selectedTemplate ||
                  (!notificationMethods.email && !notificationMethods.sms)
                }
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {scheduledSend.enabled
                  ? "Schedule Notifications"
                  : "Send Notifications"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
