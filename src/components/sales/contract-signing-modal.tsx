'use client';

import { useState } from 'react';
import { FileText, Send, Eye, Download, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ContractSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: string;
  customerName: string;
  customerEmail?: string;
  estimateAmount: number;
  onContractInitiated: (contractData: any) => void;
}

const CONTRACT_TEMPLATES = [
  { id: 'recurring_service', name: 'Recurring Service Agreement', description: 'Standard monthly service contract' },
  { id: 'one_time_service', name: 'One-Time Service Agreement', description: 'Single service contract' },
  { id: 'deep_cleaning', name: 'Deep Cleaning Contract', description: 'Comprehensive cleaning service' },
  { id: 'commercial', name: 'Commercial Service Agreement', description: 'Business cleaning contract' },
];

const SIGNATURE_PROVIDERS = [
  { id: 'docusign', name: 'DocuSign', icon: '📝' },
  { id: 'hellosign', name: 'HelloSign', icon: '✍️' },
  { id: 'adobe_sign', name: 'Adobe Sign', icon: '📄' },
];

export function ContractSigningModal({
  isOpen,
  onClose,
  estimateId,
  customerName,
  customerEmail,
  estimateAmount,
  onContractInitiated
}: ContractSigningModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    templateId: '',
    signatureProvider: 'docusign',
    customerEmail: customerEmail || '',
    customerPhone: '',
    contractTerms: '',
    serviceStartDate: '',
    paymentTerms: 'net_30',
    autoRenewal: true,
    specialInstructions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const contractData = {
        ...formData,
        estimateId,
        customerName,
        estimateAmount,
        templateId: formData.templateId,
        metadata: {
          createdAt: new Date().toISOString(),
          estimateAmount,
          customerName,
        }
      };

      await onContractInitiated(contractData);
      
      toast({
        title: "Contract Initiated",
        description: `Contract sent to ${customerName} for signature via ${SIGNATURE_PROVIDERS.find(p => p.id === formData.signatureProvider)?.name}`,
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Contract Error",
        description: error.message || "Failed to initiate contract signing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewContract = () => {
    toast({
      title: "Contract Preview",
      description: "Opening contract preview in new window...",
    });
    
    const previewUrl = `/contracts/preview?template=${formData.templateId}&estimate=${estimateId}`;
    window.open(previewUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contract Signing - {customerName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estimate Amount</Label>
                  <Input 
                    value={`$${estimateAmount.toFixed(2)}`} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Customer</Label>
                  <Input 
                    value={customerName} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="templateId">Contract Template *</Label>
                <Select 
                  value={formData.templateId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract template" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="signatureProvider">Signature Provider</Label>
                <Select 
                  value={formData.signatureProvider} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, signatureProvider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNATURE_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2">
                          <span>{provider.icon}</span>
                          <span>{provider.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="customer@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contract Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceStartDate">Service Start Date</Label>
                  <Input
                    id="serviceStartDate"
                    type="date"
                    value={formData.serviceStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceStartDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select 
                    value={formData.paymentTerms} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="due_on_service">Due on Service</SelectItem>
                      <SelectItem value="net_15">Net 15 Days</SelectItem>
                      <SelectItem value="net_30">Net 30 Days</SelectItem>
                      <SelectItem value="monthly_auto">Monthly Auto-Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="contractTerms">Additional Contract Terms</Label>
                <Textarea
                  id="contractTerms"
                  value={formData.contractTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractTerms: e.target.value }))}
                  placeholder="Enter any additional terms or conditions..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special cleaning instructions or notes for the crew..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewContract}
                disabled={!formData.templateId}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Contract
              </Button>
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
                type="submit"
                disabled={isLoading || !formData.templateId || !formData.customerEmail}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send for Signature
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}