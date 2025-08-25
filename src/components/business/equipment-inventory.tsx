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
  Package,
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  User,
  Plus,
  Edit,
  Eye,
  Download,
  Settings,
  Activity,
  Zap,
  Shield,
  FileText,
  QrCode,
  Truck,
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  category: 'vacuum' | 'mop' | 'chemical_dispenser' | 'pressure_washer' | 'floor_buffer' | 'safety' | 'other';
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  warranty: {
    provider: string;
    expiresAt: Date;
    covered: string[];
  };
  status: 'active' | 'maintenance' | 'retired' | 'damaged';
  location: string;
  assignedTo?: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  usageHours: number;
  specifications: Record<string, string>;
  attachments: string[];
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'routine' | 'repair' | 'inspection' | 'cleaning';
  performedBy: string;
  performedAt: Date;
  description: string;
  parts: string[];
  cost: number;
  nextDueDate: Date;
  notes: string;
  status: 'completed' | 'pending' | 'in_progress';
}

interface InventoryTransaction {
  id: string;
  type: 'purchase' | 'transfer' | 'disposal' | 'repair';
  equipmentId: string;
  equipmentName: string;
  fromLocation?: string;
  toLocation?: string;
  performedBy: string;
  performedAt: Date;
  cost?: number;
  notes: string;
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Commercial Vacuum CV-2000',
    category: 'vacuum',
    brand: 'CleanMaster',
    model: 'CV-2000',
    serialNumber: 'CM2000-001',
    purchaseDate: new Date('2023-06-15'),
    purchasePrice: 850.00,
    currentValue: 680.00,
    warranty: {
      provider: 'CleanMaster',
      expiresAt: new Date('2025-06-15'),
      covered: ['Motor', 'Electrical components', 'Housing'],
    },
    status: 'active',
    location: 'Warehouse A',
    assignedTo: 'Maria Rodriguez',
    lastMaintenance: new Date('2024-01-15'),
    nextMaintenance: new Date('2024-04-15'),
    usageHours: 245,
    specifications: {
      'Power': '1200W',
      'Capacity': '5L',
      'Weight': '8kg',
      'Cord Length': '10m',
    },
    attachments: ['manual.pdf', 'warranty-card.pdf'],
  },
  {
    id: '2',
    name: 'Industrial Mop System',
    category: 'mop',
    brand: 'ProClean',
    model: 'IMS-500',
    serialNumber: 'PC500-023',
    purchaseDate: new Date('2023-08-20'),
    purchasePrice: 320.00,
    currentValue: 280.00,
    warranty: {
      provider: 'ProClean',
      expiresAt: new Date('2024-08-20'),
      covered: ['Frame', 'Wheels', 'Wringer mechanism'],
    },
    status: 'maintenance',
    location: 'Service Center',
    lastMaintenance: new Date('2024-02-01'),
    nextMaintenance: new Date('2024-03-01'),
    usageHours: 180,
    specifications: {
      'Bucket Capacity': '26L',
      'Material': 'Polypropylene',
      'Wheel Type': 'Non-marking',
      'Handle Length': '1.4m',
    },
    attachments: ['care-instructions.pdf'],
  },
  {
    id: '3',
    name: 'Pressure Washer PW-3000',
    category: 'pressure_washer',
    brand: 'PowerJet',
    model: 'PW-3000',
    serialNumber: 'PJ3000-112',
    purchaseDate: new Date('2023-04-10'),
    purchasePrice: 1250.00,
    currentValue: 950.00,
    warranty: {
      provider: 'PowerJet',
      expiresAt: new Date('2026-04-10'),
      covered: ['Pump', 'Motor', 'Hose', 'Gun assembly'],
    },
    status: 'active',
    location: 'Vehicle #3',
    assignedTo: 'James Wilson',
    lastMaintenance: new Date('2024-01-20'),
    nextMaintenance: new Date('2024-07-20'),
    usageHours: 89,
    specifications: {
      'Pressure': '3000 PSI',
      'Flow Rate': '2.5 GPM',
      'Power': '2.3 HP',
      'Hose Length': '25ft',
    },
    attachments: ['manual.pdf', 'parts-diagram.pdf'],
  },
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    equipmentId: '1',
    equipmentName: 'Commercial Vacuum CV-2000',
    type: 'routine',
    performedBy: 'Equipment Technician',
    performedAt: new Date('2024-01-15'),
    description: 'Filter replacement and motor cleaning',
    parts: ['HEPA Filter', 'Motor brush set'],
    cost: 45.50,
    nextDueDate: new Date('2024-04-15'),
    notes: 'Equipment running smoothly after maintenance',
    status: 'completed',
  },
  {
    id: '2',
    equipmentId: '2',
    equipmentName: 'Industrial Mop System',
    type: 'repair',
    performedBy: 'Equipment Technician',
    performedAt: new Date('2024-02-01'),
    description: 'Replace broken wheel and adjust wringer mechanism',
    parts: ['Replacement wheel', 'Wringer spring'],
    cost: 28.00,
    nextDueDate: new Date('2024-03-01'),
    notes: 'Wheel replaced, wringer tension adjusted',
    status: 'completed',
  },
];

const mockTransactions: InventoryTransaction[] = [
  {
    id: '1',
    type: 'purchase',
    equipmentId: '1',
    equipmentName: 'Commercial Vacuum CV-2000',
    toLocation: 'Warehouse A',
    performedBy: 'Equipment Manager',
    performedAt: new Date('2023-06-15'),
    cost: 850.00,
    notes: 'Initial purchase for expansion',
  },
  {
    id: '2',
    type: 'transfer',
    equipmentId: '3',
    equipmentName: 'Pressure Washer PW-3000',
    fromLocation: 'Warehouse A',
    toLocation: 'Vehicle #3',
    performedBy: 'Fleet Manager',
    performedAt: new Date('2024-01-25'),
    notes: 'Assigned to commercial cleaning crew',
  },
];

export function EquipmentInventory() {
  const [equipment] = useState<Equipment[]>(mockEquipment);
  const [maintenanceRecords] = useState<MaintenanceRecord[]>(mockMaintenanceRecords);
  const [transactions] = useState<InventoryTransaction[]>(mockTransactions);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isEquipmentDetailOpen, setIsEquipmentDetailOpen] = useState(false);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('equipment');

  const filteredEquipment = equipment.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterLocation !== 'all' && item.location !== filterLocation) return false;
    return true;
  });

  const inventoryStats = {
    totalEquipment: equipment.length,
    totalValue: equipment.reduce((acc, item) => acc + item.currentValue, 0),
    activeEquipment: equipment.filter(e => e.status === 'active').length,
    maintenanceNeeded: equipment.filter(e => e.nextMaintenance <= new Date()).length,
    avgUsageHours: equipment.reduce((acc, e) => acc + e.usageHours, 0) / equipment.length,
    warrantyExpiring: equipment.filter(e => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return e.warranty.expiresAt <= thirtyDaysFromNow;
    }).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'retired':
        return <Badge className="bg-gray-100 text-gray-800">Retired</Badge>;
      case 'damaged':
        return <Badge className="bg-red-100 text-red-800">Damaged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vacuum':
        return <Zap className="w-4 h-4" />;
      case 'mop':
        return <Activity className="w-4 h-4" />;
      case 'chemical_dispenser':
        return <Settings className="w-4 h-4" />;
      case 'pressure_washer':
        return <Truck className="w-4 h-4" />;
      case 'floor_buffer':
        return <Shield className="w-4 h-4" />;
      case 'safety':
        return <Shield className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMaintenanceStatus = (nextMaintenance: Date) => {
    const today = new Date();
    const daysUntil = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Current</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Inventory</h1>
          <p className="mt-2 text-gray-600">
            Manage equipment assets, maintenance schedules, and inventory tracking
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wrench className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Equipment Maintenance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipmentSelect">Equipment</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maintenanceType">Maintenance Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="cleaning">Deep Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="maintenanceDescription">Description</Label>
                  <Textarea id="maintenanceDescription" placeholder="Describe maintenance work needed" rows={4} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsMaintenanceOpen(false)}>
                    Cancel
                  </Button>
                  <Button>Schedule Maintenance</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddEquipmentOpen} onOpenChange={setIsAddEquipmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipmentName">Equipment Name</Label>
                    <Input id="equipmentName" placeholder="Enter equipment name" />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacuum">Vacuum</SelectItem>
                        <SelectItem value="mop">Mop System</SelectItem>
                        <SelectItem value="chemical_dispenser">Chemical Dispenser</SelectItem>
                        <SelectItem value="pressure_washer">Pressure Washer</SelectItem>
                        <SelectItem value="floor_buffer">Floor Buffer</SelectItem>
                        <SelectItem value="safety">Safety Equipment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" placeholder="Enter brand" />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" placeholder="Enter model" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input id="serialNumber" placeholder="Enter serial number" />
                  </div>
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input id="purchasePrice" type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddEquipmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button>Add Equipment</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.totalEquipment}</div>
            <p className="text-xs text-muted-foreground">
              {inventoryStats.activeEquipment} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Current asset value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.maintenanceNeeded}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warranty Expiring</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.warrantyExpiring}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="equipment">Equipment List</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Records</TabsTrigger>
          <TabsTrigger value="transactions">Inventory Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Equipment Inventory</CardTitle>
                <div className="flex space-x-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="vacuum">Vacuum</SelectItem>
                      <SelectItem value="mop">Mop System</SelectItem>
                      <SelectItem value="chemical_dispenser">Chemical Dispenser</SelectItem>
                      <SelectItem value="pressure_washer">Pressure Washer</SelectItem>
                      <SelectItem value="floor_buffer">Floor Buffer</SelectItem>
                      <SelectItem value="safety">Safety Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                      <SelectItem value="Service Center">Service Center</SelectItem>
                      <SelectItem value="Vehicle #1">Vehicle #1</SelectItem>
                      <SelectItem value="Vehicle #2">Vehicle #2</SelectItem>
                      <SelectItem value="Vehicle #3">Vehicle #3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEquipment.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedEquipment(item);
                      setIsEquipmentDetailOpen(true);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {getCategoryIcon(item.category)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.brand} {item.model} • SN: {item.serialNumber}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(item.status)}
                          {getMaintenanceStatus(item.nextMaintenance)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.currentValue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.location}
                      </p>
                      <p className="text-sm text-gray-400">
                        {item.usageHours}h usage
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRecords.map((record) => (
                  <div key={record.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{record.equipmentName}</h3>
                      <Badge className={record.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {record.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Type:</span> {record.type}
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> {formatCurrency(record.cost)}
                      </div>
                      <div>
                        <span className="font-medium">Performed:</span> {record.performedAt.toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Next Due:</span> {record.nextDueDate.toLocaleDateString()}
                      </div>
                    </div>
                    {record.parts.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Parts used: </span>
                        <span className="text-sm text-gray-600">{record.parts.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {transaction.type === 'purchase' && <DollarSign className="w-4 h-4 text-blue-600" />}
                        {transaction.type === 'transfer' && <MapPin className="w-4 h-4 text-blue-600" />}
                        {transaction.type === 'disposal' && <AlertTriangle className="w-4 h-4 text-blue-600" />}
                        {transaction.type === 'repair' && <Wrench className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </h3>
                        <p className="text-sm text-gray-500">{transaction.equipmentName}</p>
                        <p className="text-sm text-gray-400">
                          {transaction.fromLocation && `${transaction.fromLocation} → `}
                          {transaction.toLocation || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {transaction.cost && (
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.cost)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {transaction.performedAt.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        By {transaction.performedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Equipment Detail Dialog */}
      <Dialog open={isEquipmentDetailOpen} onOpenChange={setIsEquipmentDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Equipment Details</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Equipment Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm">{selectedEquipment.name}</p>
                    </div>
                    <div>
                      <Label>Brand & Model</Label>
                      <p className="text-sm">{selectedEquipment.brand} {selectedEquipment.model}</p>
                    </div>
                    <div>
                      <Label>Serial Number</Label>
                      <p className="text-sm">{selectedEquipment.serialNumber}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedEquipment.status)}
                      </div>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <p className="text-sm">{selectedEquipment.location}</p>
                    </div>
                    {selectedEquipment.assignedTo && (
                      <div>
                        <Label>Assigned To</Label>
                        <p className="text-sm">{selectedEquipment.assignedTo}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Financial Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Purchase Date</Label>
                      <p className="text-sm">{selectedEquipment.purchaseDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label>Purchase Price</Label>
                      <p className="text-sm">{formatCurrency(selectedEquipment.purchasePrice)}</p>
                    </div>
                    <div>
                      <Label>Current Value</Label>
                      <p className="text-sm font-medium">{formatCurrency(selectedEquipment.currentValue)}</p>
                    </div>
                    <div>
                      <Label>Usage Hours</Label>
                      <p className="text-sm">{selectedEquipment.usageHours}h</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Maintenance Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Last Maintenance</Label>
                    <p className="text-sm">{selectedEquipment.lastMaintenance.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Next Maintenance</Label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm">{selectedEquipment.nextMaintenance.toLocaleDateString()}</p>
                      {getMaintenanceStatus(selectedEquipment.nextMaintenance)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Warranty Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Provider</Label>
                    <p className="text-sm">{selectedEquipment.warranty.provider}</p>
                  </div>
                  <div>
                    <Label>Expires</Label>
                    <p className="text-sm">{selectedEquipment.warranty.expiresAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Label>Coverage</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEquipment.warranty.covered.map((item, index) => (
                      <Badge key={index} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                    <div key={key}>
                      <Label>{key}</Label>
                      <p className="text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEquipmentDetailOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Equipment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}