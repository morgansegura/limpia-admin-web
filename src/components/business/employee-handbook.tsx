"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Book,
  FileText,
  Users,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Download,
  Edit,
  Plus,
  Search,
  Eye,
  Star,
  Award,
  Target,
  Briefcase,
  Heart,
  Globe,
  Settings,
  MessageCircle,
} from 'lucide-react';

interface HandbookSection {
  id: string;
  title: string;
  category: 'policies' | 'procedures' | 'benefits' | 'training' | 'compliance';
  content: string;
  lastUpdated: Date;
  version: string;
  status: 'active' | 'draft' | 'archived';
  requiredReading: boolean;
  estimatedReadTime: number;
  attachments: string[];
}

interface PolicyAcknowledgment {
  id: string;
  workerId: string;
  workerName: string;
  sectionId: string;
  sectionTitle: string;
  acknowledgedAt: Date;
  version: string;
  signatureType: 'digital' | 'physical';
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'procedures' | 'compliance' | 'skills';
  duration: number;
  prerequisites: string[];
  status: 'active' | 'draft';
  completionRate: number;
  lastUpdated: Date;
}

const mockHandbookSections: HandbookSection[] = [
  {
    id: '1',
    title: 'Code of Conduct',
    category: 'policies',
    content: 'Our code of conduct outlines the professional standards and ethical behavior expected from all team members...',
    lastUpdated: new Date('2024-01-01'),
    version: '2.1',
    status: 'active',
    requiredReading: true,
    estimatedReadTime: 15,
    attachments: ['code-of-conduct.pdf'],
  },
  {
    id: '2',
    title: 'Cleaning Procedures',
    category: 'procedures',
    content: 'Standard operating procedures for residential and commercial cleaning services...',
    lastUpdated: new Date('2024-02-15'),
    version: '3.0',
    status: 'active',
    requiredReading: true,
    estimatedReadTime: 30,
    attachments: ['cleaning-checklist.pdf', 'product-safety-sheets.pdf'],
  },
  {
    id: '3',
    title: 'Health Insurance Benefits',
    category: 'benefits',
    content: 'Comprehensive overview of health insurance options, coverage details, and enrollment procedures...',
    lastUpdated: new Date('2024-03-01'),
    version: '1.5',
    status: 'active',
    requiredReading: false,
    estimatedReadTime: 20,
    attachments: ['benefits-guide.pdf', 'insurance-forms.pdf'],
  },
  {
    id: '4',
    title: 'Safety Training Requirements',
    category: 'training',
    content: 'Mandatory safety training modules and certification requirements for all cleaning staff...',
    lastUpdated: new Date('2024-01-20'),
    version: '2.0',
    status: 'active',
    requiredReading: true,
    estimatedReadTime: 45,
    attachments: ['safety-manual.pdf', 'training-schedule.pdf'],
  },
  {
    id: '5',
    title: 'OSHA Compliance Guidelines',
    category: 'compliance',
    content: 'Guidelines for maintaining OSHA compliance in all cleaning operations...',
    lastUpdated: new Date('2024-02-01'),
    version: '1.2',
    status: 'active',
    requiredReading: true,
    estimatedReadTime: 25,
    attachments: ['osha-guidelines.pdf'],
  },
];

const mockAcknowledgments: PolicyAcknowledgment[] = [
  {
    id: '1',
    workerId: 'W001',
    workerName: 'Maria Rodriguez',
    sectionId: '1',
    sectionTitle: 'Code of Conduct',
    acknowledgedAt: new Date('2024-01-15'),
    version: '2.1',
    signatureType: 'digital',
  },
  {
    id: '2',
    workerId: 'W001',
    workerName: 'Maria Rodriguez',
    sectionId: '2',
    sectionTitle: 'Cleaning Procedures',
    acknowledgedAt: new Date('2024-02-20'),
    version: '3.0',
    signatureType: 'digital',
  },
];

const mockTrainingModules: TrainingModule[] = [
  {
    id: '1',
    title: 'Chemical Safety Training',
    description: 'Learn proper handling, storage, and use of cleaning chemicals',
    category: 'safety',
    duration: 120,
    prerequisites: [],
    status: 'active',
    completionRate: 85,
    lastUpdated: new Date('2024-01-10'),
  },
  {
    id: '2',
    title: 'Customer Service Excellence',
    description: 'Best practices for customer interaction and service delivery',
    category: 'skills',
    duration: 90,
    prerequisites: ['1'],
    status: 'active',
    completionRate: 78,
    lastUpdated: new Date('2024-02-05'),
  },
  {
    id: '3',
    title: 'Equipment Operation & Maintenance',
    description: 'Proper use and maintenance of cleaning equipment',
    category: 'procedures',
    duration: 150,
    prerequisites: ['1'],
    status: 'active',
    completionRate: 92,
    lastUpdated: new Date('2024-01-25'),
  },
];

export function EmployeeHandbook() {
  const [sections] = useState<HandbookSection[]>(mockHandbookSections);
  const [acknowledgments] = useState<PolicyAcknowledgment[]>(mockAcknowledgments);
  const [trainingModules] = useState<TrainingModule[]>(mockTrainingModules);
  const [selectedSection, setSelectedSection] = useState<HandbookSection | null>(null);
  const [isSectionDetailOpen, setIsSectionDetailOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('handbook');

  const filteredSections = sections.filter(section => {
    if (filterCategory !== 'all' && section.category !== filterCategory) return false;
    if (filterStatus !== 'all' && section.status !== filterStatus) return false;
    return true;
  });

  const handbookStats = {
    totalSections: sections.length,
    activeSections: sections.filter(s => s.status === 'active').length,
    requiredSections: sections.filter(s => s.requiredReading).length,
    totalReadTime: sections.reduce((acc, s) => acc + s.estimatedReadTime, 0),
    acknowledgedSections: acknowledgments.length,
    avgCompletionRate: trainingModules.reduce((acc, m) => acc + m.completionRate, 0) / trainingModules.length,
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'policies':
        return <Shield className="w-4 h-4" />;
      case 'procedures':
        return <Settings className="w-4 h-4" />;
      case 'benefits':
        return <Heart className="w-4 h-4" />;
      case 'training':
        return <Award className="w-4 h-4" />;
      case 'compliance':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      policies: 'bg-blue-100 text-blue-800',
      procedures: 'bg-green-100 text-green-800',
      benefits: 'bg-purple-100 text-purple-800',
      training: 'bg-orange-100 text-orange-800',
      compliance: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Handbook</h1>
          <p className="mt-2 text-gray-600">
            Manage company policies, procedures, and training materials
          </p>
        </div>
        <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Section Title</Label>
                  <Input id="title" placeholder="Enter section title" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policies">Policies</SelectItem>
                      <SelectItem value="procedures">Procedures</SelectItem>
                      <SelectItem value="benefits">Benefits</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" placeholder="Enter section content" rows={8} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddSectionOpen(false)}>
                  Cancel
                </Button>
                <Button>Add Section</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{handbookStats.totalSections}</div>
            <p className="text-xs text-muted-foreground">
              {handbookStats.activeSections} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Required Reading</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{handbookStats.requiredSections}</div>
            <p className="text-xs text-muted-foreground">
              Mandatory sections
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Read Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{handbookStats.totalReadTime}</div>
            <p className="text-xs text-muted-foreground">
              Minutes estimated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{handbookStats.avgCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="handbook">Handbook Sections</TabsTrigger>
          <TabsTrigger value="training">Training Modules</TabsTrigger>
          <TabsTrigger value="acknowledgments">Acknowledgments</TabsTrigger>
        </TabsList>

        <TabsContent value="handbook">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Handbook Sections</CardTitle>
                <div className="flex space-x-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="policies">Policies</SelectItem>
                      <SelectItem value="procedures">Procedures</SelectItem>
                      <SelectItem value="benefits">Benefits</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedSection(section);
                      setIsSectionDetailOpen(true);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {getCategoryIcon(section.category)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-500">
                          Version {section.version} • {section.estimatedReadTime} min read
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getCategoryBadge(section.category)}
                          {getStatusBadge(section.status)}
                          {section.requiredReading && (
                            <Badge className="bg-red-100 text-red-800">Required</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Updated {section.lastUpdated.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        {section.attachments.length} attachments
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingModules.map((module) => (
                  <div key={module.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{module.title}</h3>
                      <Badge className={module.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {module.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{module.duration} minutes</span>
                        <span className="text-sm text-gray-500">
                          {module.prerequisites.length} prerequisites
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{module.completionRate}% completion</span>
                        <div className="w-20 h-2 bg-gray-200 rounded">
                          <div
                            className="h-2 bg-green-600 rounded"
                            style={{ width: `${module.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acknowledgments">
          <Card>
            <CardHeader>
              <CardTitle>Policy Acknowledgments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {acknowledgments.map((ack) => (
                  <div key={ack.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{ack.workerName}</h3>
                        <p className="text-sm text-gray-500">
                          {ack.sectionTitle} (v{ack.version})
                        </p>
                        <p className="text-sm text-gray-400">
                          Acknowledged on {ack.acknowledgedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {ack.signatureType} signature
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Section Detail Dialog */}
      <Dialog open={isSectionDetailOpen} onOpenChange={setIsSectionDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Section Details</DialogTitle>
          </DialogHeader>
          {selectedSection && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedSection.title}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    {getCategoryBadge(selectedSection.category)}
                    {getStatusBadge(selectedSection.status)}
                    {selectedSection.requiredReading && (
                      <Badge className="bg-red-100 text-red-800">Required Reading</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Version {selectedSection.version}</p>
                  <p className="text-sm text-gray-500">{selectedSection.estimatedReadTime} min read</p>
                  <p className="text-sm text-gray-500">
                    Updated {selectedSection.lastUpdated.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700">{selectedSection.content}</p>
              </div>

              {selectedSection.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedSection.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsSectionDetailOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Section
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}