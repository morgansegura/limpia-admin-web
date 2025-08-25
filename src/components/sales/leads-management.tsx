"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { customersApi } from '@/lib/api';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  Star
} from 'lucide-react';
import { LeadCreationForm } from './lead-creation-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
  priority: string;
  propertyType?: string;
  squareFootage?: number;
  serviceNeeded?: string;
  budget?: number;
  timeline?: string;
  score: number;
  lastContact?: string;
  nextFollowUp?: string;
  notes?: string;
  createdAt: string;
}

interface LeadsManagementProps {
  userRole: 'SALES_REP' | 'SALES_MANAGER';
}

export function LeadsManagement({ userRole }: LeadsManagementProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await customersApi.getAll({ isLead: true });
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lead action handlers
  const handleCallLead = (lead: Lead) => {
    if (lead.phone) {
      // Open phone dialer
      window.open(`tel:${lead.phone}`);
      
      // Log the contact attempt
      customersApi.sendCommunication(lead.id, {
        type: 'call',
        method: 'phone',
        notes: `Called ${lead.firstName} ${lead.lastName}`,
        timestamp: new Date().toISOString(),
      }).catch(console.error);
    } else {
      alert('No phone number available for this lead');
    }
  };

  const handleEmailLead = (lead: Lead) => {
    if (lead.email) {
      // Open email client
      const subject = encodeURIComponent(`Follow-up: ${lead.serviceNeeded || 'Cleaning Services'}`);
      const body = encodeURIComponent(`Hi ${lead.firstName},\n\nThank you for your interest in our cleaning services. I wanted to follow up on your inquiry.\n\nBest regards,\nLimpia Cleaning Team`);
      window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`);
      
      // Log the contact attempt
      customersApi.sendCommunication(lead.id, {
        type: 'email',
        method: 'email',
        notes: `Emailed ${lead.firstName} ${lead.lastName}`,
        timestamp: new Date().toISOString(),
      }).catch(console.error);
    } else {
      alert('No email address available for this lead');
    }
  };

  const handleScheduleFollowUp = (lead: Lead) => {
    const followUpDate = prompt('Enter follow-up date and time (e.g., 2024-08-20 14:00):');
    if (followUpDate) {
      // In a real app, this would integrate with calendar system
      customersApi.sendCommunication(lead.id, {
        type: 'scheduled_followup',
        method: 'system',
        notes: `Follow-up scheduled for ${followUpDate}`,
        scheduledFor: followUpDate,
        timestamp: new Date().toISOString(),
      }).then(() => {
        alert(`Follow-up scheduled for ${lead.firstName} ${lead.lastName} on ${followUpDate}`);
      }).catch(error => {
        console.error('Error scheduling follow-up:', error);
        alert('Failed to schedule follow-up. Please try again.');
      });
    }
  };

  const handleAddNewLead = () => {
    setIsLeadFormOpen(true);
  };

  const handleLeadCreated = (newLead: any) => {
    setLeads(prev => [newLead, ...prev]);
    // Filtering will be handled by useEffect
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'proposal': 'bg-purple-100 text-purple-800',
      'won': 'bg-emerald-100 text-emerald-800',
      'lost': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            Track and manage your sales prospects
          </p>
        </div>
        <Button onClick={handleAddNewLead}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {lead.firstName} {lead.lastName}
                    </h3>
                    <Badge className={getStatusBadgeColor(lead.status)}>
                      {lead.status}
                    </Badge>
                    <Badge className={getPriorityBadgeColor(lead.priority)}>
                      {lead.priority}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{lead.score}/100</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.serviceNeeded && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{lead.serviceNeeded}</span>
                      </div>
                    )}
                    {lead.budget && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>${lead.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Property:</span>
                      <span className="ml-2 text-gray-600">
                        {lead.propertyType} 
                        {lead.squareFootage && ` (${lead.squareFootage.toLocaleString()} sqft)`}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Source:</span>
                      <span className="ml-2 text-gray-600">{lead.source}</span>
                    </div>
                    <div>
                      <span className="font-medium">Timeline:</span>
                      <span className="ml-2 text-gray-600">{lead.timeline || 'Not specified'}</span>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{lead.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => handleCallLead(lead)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEmailLead(lead)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleScheduleFollowUp(lead)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No leads found</h3>
              <p>Try adjusting your search criteria or add new leads to get started.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lead Creation Dialog */}
      <Dialog open={isLeadFormOpen} onOpenChange={setIsLeadFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Add New Lead
            </DialogTitle>
          </DialogHeader>
          <LeadCreationForm 
            onClose={() => setIsLeadFormOpen(false)} 
            onLeadCreated={handleLeadCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}