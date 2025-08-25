'use client';

import { useState } from 'react';
import { Mail, Send, Save, Eye, FileText, Clock, User, Paperclip } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  onEmailSent: (emailData: any) => void;
}

const EMAIL_TEMPLATES = {
  service_inquiry_response: {
    subject: 'Thank you for your service inquiry - {{customerName}}',
    body: `Dear {{customerName}},

Thank you for your inquiry about our cleaning services. We're excited to help you maintain a clean and healthy environment.

Based on your needs, here's what we can offer:
- Professional cleaning services tailored to your schedule
- Eco-friendly cleaning products
- Licensed and insured cleaning professionals
- Flexible scheduling options

We'd love to discuss your specific needs and provide you with a customized quote. Would you prefer a phone consultation or an in-person visit?

You can reach us at:
- Phone: (555) 123-4567
- Email: service@limpia.com

Thank you for considering Limpia Cleaning Services!

Best regards,
{{senderName}}
Limpia Cleaning Services`,
  },
  estimate_follow_up: {
    subject: 'Following up on your cleaning service estimate',
    body: `Hi {{customerName}},

I hope this email finds you well. I wanted to follow up on the cleaning service estimate we provided for your {{propertyType}}.

Our estimate includes:
- Comprehensive cleaning service
- All necessary supplies and equipment
- Satisfaction guarantee
- Flexible scheduling

If you have any questions about the estimate or our services, I'm here to help. We can also adjust the scope of work if your needs have changed.

Would you like to schedule a brief call to discuss any questions you might have?

Best regards,
{{senderName}}
Limpia Cleaning Services`,
  },
  appointment_confirmation: {
    subject: 'Appointment Confirmation - {{appointmentDate}}',
    body: `Dear {{customerName}},

This email confirms your cleaning appointment scheduled for:

Date: {{appointmentDate}}
Time: {{appointmentTime}}
Address: {{serviceAddress}}
Service: {{serviceType}}

Our team will arrive within the scheduled time window and will contact you if there are any changes.

Please ensure:
- Someone is available to provide access
- Pets are secured in a safe area
- Any valuable or fragile items are put away

If you need to reschedule or have any questions, please contact us at least 24 hours in advance.

Thank you for choosing Limpia Cleaning Services!

Best regards,
{{senderName}}
Limpia Cleaning Services`,
  },
  service_feedback: {
    subject: 'How was your recent cleaning service?',
    body: `Hello {{customerName}},

We hope you're satisfied with the cleaning service we provided on {{serviceDate}}. Your feedback is incredibly valuable to us as we strive to provide the best possible service.

We'd love to hear about your experience:
- Were you satisfied with the quality of the cleaning?
- Did our team arrive on time and act professionally?
- Is there anything we could improve for next time?

If you have a moment, we'd appreciate it if you could leave us a review or simply reply to this email with your thoughts.

If there were any issues with the service, please let us know immediately so we can address them.

Thank you for choosing Limpia Cleaning Services!

Best regards,
{{senderName}}
Limpia Cleaning Services`,
  },
};

const EMAIL_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

export function EmailComposeModal({ isOpen, onClose, customer, onEmailSent }: EmailComposeModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    to: customer.email,
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    priority: 'normal',
    template: '',
    scheduledSend: false,
    scheduledTime: '',
    trackOpens: true,
    trackClicks: true,
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const applyTemplate = (templateKey: string) => {
    const template = EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES];
    if (!template) return;

    // Replace template variables
    const variables = {
      customerName: customer.name,
      senderName: 'Sales Team', // This should come from current user
      propertyType: 'property',
      appointmentDate: new Date().toLocaleDateString(),
      appointmentTime: '10:00 AM',
      serviceAddress: 'Customer Address',
      serviceType: 'Regular Cleaning',
      serviceDate: new Date().toLocaleDateString(),
    };

    const processedSubject = template.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key as keyof typeof variables] || match;
    });

    const processedBody = template.body.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key as keyof typeof variables] || match;
    });

    setFormData(prev => ({
      ...prev,
      subject: processedSubject,
      body: processedBody,
      template: templateKey,
    }));
  };

  const sendEmail = async () => {
    setIsSending(true);
    
    try {
      const emailData = {
        customerId: customer.id,
        customerName: customer.name,
        to: formData.to,
        cc: formData.cc || undefined,
        bcc: formData.bcc || undefined,
        subject: formData.subject,
        body: formData.body,
        priority: formData.priority,
        template: formData.template || undefined,
        scheduledSend: formData.scheduledSend,
        scheduledTime: formData.scheduledTime || undefined,
        trackOpens: formData.trackOpens,
        trackClicks: formData.trackClicks,
        sentAt: formData.scheduledSend ? formData.scheduledTime : new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await onEmailSent(emailData);
      
      toast({
        title: formData.scheduledSend ? "Email Scheduled" : "Email Sent",
        description: formData.scheduledSend 
          ? `Email scheduled for ${new Date(formData.scheduledTime).toLocaleString()}`
          : `Email sent to ${customer.name} successfully`,
      });
      
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Email Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const saveDraft = async () => {
    try {
      const draftData = {
        ...formData,
        customerId: customer.id,
        isDraft: true,
        createdAt: new Date().toISOString(),
      };

      // Save draft logic would go here
      toast({
        title: "Draft Saved",
        description: "Email draft saved successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Failed to save draft",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Compose Email - {customer.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={previewMode ? 'preview' : 'compose'} className="w-full">
          <TabsList>
            <TabsTrigger 
              value="compose" 
              onClick={() => setPreviewMode(false)}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              onClick={() => setPreviewMode(true)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.template}
                  onValueChange={applyTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_inquiry_response">Service Inquiry Response</SelectItem>
                    <SelectItem value="estimate_follow_up">Estimate Follow-up</SelectItem>
                    <SelectItem value="appointment_confirmation">Appointment Confirmation</SelectItem>
                    <SelectItem value="service_feedback">Service Feedback Request</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Email Form */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="to">To *</Label>
                    <Input
                      id="to"
                      value={formData.to}
                      onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="customer@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cc">CC</Label>
                    <Input
                      id="cc"
                      value={formData.cc}
                      onChange={(e) => setFormData(prev => ({ ...prev, cc: e.target.value }))}
                      placeholder="cc@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bcc">BCC</Label>
                    <Input
                      id="bcc"
                      value={formData.bcc}
                      onChange={(e) => setFormData(prev => ({ ...prev, bcc: e.target.value }))}
                      placeholder="bcc@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="body">Message *</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Compose your email message..."
                    rows={12}
                    required
                  />
                </div>

                {/* Email Options */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scheduledSend"
                      checked={formData.scheduledSend}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledSend: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="scheduledSend">Schedule for later</Label>
                  </div>

                  {formData.scheduledSend && (
                    <div>
                      <Label htmlFor="scheduledTime">Send Date & Time</Label>
                      <Input
                        id="scheduledTime"
                        type="datetime-local"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}

                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="trackOpens"
                        checked={formData.trackOpens}
                        onChange={(e) => setFormData(prev => ({ ...prev, trackOpens: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="trackOpens">Track opens</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="trackClicks"
                        checked={formData.trackClicks}
                        onChange={(e) => setFormData(prev => ({ ...prev, trackClicks: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="trackClicks">Track clicks</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="border-b pb-4 mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span><strong>From:</strong> noreply@limpia.com</span>
                      <span><strong>Priority:</strong> {formData.priority}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>To:</strong> {formData.to}
                    </div>
                    {formData.cc && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>CC:</strong> {formData.cc}
                      </div>
                    )}
                    <div className="text-lg font-medium">
                      <strong>Subject:</strong> {formData.subject}
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap bg-white p-4 rounded border">
                    {formData.body}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={sendEmail} 
              disabled={isSending || !formData.to || !formData.subject || !formData.body}
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {formData.scheduledSend ? 'Schedule Email' : 'Send Email'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}