"use client";

import { useState, useEffect, useCallback } from "react";
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
  FileText,
  Plus,
  Copy,
  Mail,
  MessageSquare,
  Calendar,
  Star,
  MessageCircle,
} from "lucide-react";
import { FormItem } from "../ui/form";
import {
  templatesApi,
  MessageTemplate as ApiMessageTemplate,
  CreateTemplateRequest,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Use the API interface directly - keep createdAt as string for consistency
type MessageTemplate = ApiMessageTemplate;

interface MessageTemplatesProps {
  onSelectTemplate: (template: MessageTemplate) => void;
  onCreateTemplate?: (template: CreateTemplateRequest) => void;
}

const TEMPLATE_TYPES = {
  BOOKING_CONFIRMATION: {
    name: "Booking Confirmation",
    icon: Calendar,
    color: "bg-blue-500",
  },
  BOOKING_REMINDER: {
    name: "Booking Reminder",
    icon: Calendar,
    color: "bg-green-500",
  },
  SERVICE_UPDATE: {
    name: "Service Update",
    icon: MessageCircle,
    color: "bg-orange-500",
  },
  MARKETING: { name: "Marketing", icon: Star, color: "bg-purple-500" },
  SURVEY: { name: "Survey", icon: MessageSquare, color: "bg-yellow-500" },
};

const METHOD_ICONS = {
  email: Mail,
  sms: MessageSquare,
  phone: MessageSquare,
  app: MessageSquare,
};

export function MessageTemplates({
  onSelectTemplate,
  onCreateTemplate,
}: MessageTemplatesProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "SERVICE_UPDATE",
    method: "email",
    subject: "",
    message: "",
    variables: [] as string[],
  });
  const { toast } = useToast();

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const apiTemplates = await templatesApi.getAll();
      setTemplates(apiTemplates);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast({
        title: "Error",
        description: "Failed to load message templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load templates from API
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const filteredTemplates = templates.filter((template) => {
    const matchesType =
      selectedType === "all" || template.type === selectedType;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCreateTemplate = async () => {
    if (
      !newTemplate.name.trim() ||
      !newTemplate.subject.trim() ||
      !newTemplate.message.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extract variables from message (look for {{variable}} patterns)
      const variables = Array.from(
        newTemplate.message.match(/\{\{([^}]+)\}\}/g) || [],
      ).map((match) => match.replace(/[{}]/g, ""));

      const templateData: CreateTemplateRequest = {
        ...newTemplate,
        variables: [...new Set(variables)], // Remove duplicates
      };

      const createdTemplate = await templatesApi.create(templateData);

      // Add to local state
      setTemplates((prev) => [...prev, createdTemplate]);

      // Call parent callback if provided
      onCreateTemplate?.(templateData);

      // Reset form
      setNewTemplate({
        name: "",
        type: "SERVICE_UPDATE",
        method: "email",
        subject: "",
        message: "",
        variables: [],
      });
      setIsCreateModalOpen(false);

      toast({
        title: "Success",
        description: "Template created successfully",
      });
    } catch (error) {
      console.error("Failed to create template:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = async (template: MessageTemplate) => {
    try {
      // Increment usage count
      await templatesApi.incrementUsage(template.id);

      // Update local state
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t,
        ),
      );

      // Call parent callback
      onSelectTemplate(template);
    } catch (error) {
      console.error("Failed to track template usage:", error);
      // Still allow template selection even if tracking fails
      onSelectTemplate(template);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Message Templates</h3>
          <p className="text-sm text-muted-foreground">
            Pre-built templates for common customer communications
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Message Template</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    placeholder="e.g., Weather Delay Notification"
                  />
                </FormItem>
                <FormItem>
                  <Label htmlFor="templateType">Template Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(value) =>
                      setNewTemplate({ ...newTemplate, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_TYPES).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>

              <FormItem>
                <Label htmlFor="templateMethod">Communication Method</Label>
                <Select
                  value={newTemplate.method}
                  onValueChange={(value) =>
                    setNewTemplate({ ...newTemplate, method: value })
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
              </FormItem>

              <FormItem>
                <Label htmlFor="templateSubject">Subject</Label>
                <Input
                  id="templateSubject"
                  value={newTemplate.subject}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, subject: e.target.value })
                  }
                  placeholder="Enter subject line"
                />
              </FormItem>

              <FormItem>
                <Label htmlFor="templateMessage">Message</Label>
                <Textarea
                  id="templateMessage"
                  value={newTemplate.message}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, message: e.target.value })
                  }
                  placeholder="Enter your message. Use {{variableName}} for dynamic content."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use double curly braces for variables: {"{{customerName}}"},{" "}
                  {"{{date}}"}, {"{{time}}"}, etc.
                </p>
              </FormItem>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>Create Template</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-none bg-neutral-100 border-none">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                className="bg-white"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TEMPLATE_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="col-span-2 text-center py-8">
            <div className="text-muted-foreground">Loading templates...</div>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const TypeInfo =
              TEMPLATE_TYPES[template.type as keyof typeof TEMPLATE_TYPES];
            const MethodIcon =
              METHOD_ICONS[template.method as keyof typeof METHOD_ICONS];

            return (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          TypeInfo?.color || "bg-gray-500"
                        } text-white`}
                      >
                        {TypeInfo?.icon && (
                          <TypeInfo.icon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-sm">
                          {template.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {TypeInfo?.name || template.type}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            {MethodIcon && <MethodIcon className="h-3 w-3" />}
                            <span>{template.method.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {template.isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        System
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div>
                    <div className="font-medium text-sm">
                      {template.subject}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {template.message}
                    </div>
                  </div>

                  {template.variables.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Variables:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.variables
                          .slice(0, 3)
                          .map((variable: string) => (
                            <Badge
                              key={variable}
                              variant="outline"
                              className="text-xs"
                            >
                              {variable}
                            </Badge>
                          ))}
                        {template.variables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Used {template.usageCount} times
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard.writeText(template.message)
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Empty State */}
      {!loading && filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || selectedType !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Create your first custom template to get started."}
            </p>
            <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
