"use client";

import { useState } from "react";
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
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  TrendingDown,
  ShoppingCart,
} from "lucide-react";

// Mock inventory data
const inventoryItems = [
  {
    id: "1",
    name: "All-Purpose Cleaner",
    category: "Cleaning Supplies",
    currentStock: 5,
    minimumStock: 10,
    maximumStock: 50,
    unit: "bottles",
    costPerUnit: 4.5,
    supplier: "CleanCorp",
    lastOrdered: "2024-08-10",
    status: "low_stock",
  },
  {
    id: "2",
    name: "Microfiber Cloths",
    category: "Equipment",
    currentStock: 25,
    minimumStock: 15,
    maximumStock: 100,
    unit: "pieces",
    costPerUnit: 2.99,
    supplier: "TextilePro",
    lastOrdered: "2024-08-05",
    status: "in_stock",
  },
  {
    id: "3",
    name: "Bathroom Cleaner",
    category: "Cleaning Supplies",
    currentStock: 8,
    minimumStock: 12,
    maximumStock: 40,
    unit: "bottles",
    costPerUnit: 5.25,
    supplier: "CleanCorp",
    lastOrdered: "2024-08-12",
    status: "low_stock",
  },
  {
    id: "4",
    name: "Vacuum Bags",
    category: "Equipment",
    currentStock: 0,
    minimumStock: 5,
    maximumStock: 30,
    unit: "boxes",
    costPerUnit: 12.99,
    supplier: "VacuumParts Inc",
    lastOrdered: "2024-07-28",
    status: "out_of_stock",
  },
  {
    id: "5",
    name: "Glass Cleaner",
    category: "Cleaning Supplies",
    currentStock: 18,
    minimumStock: 8,
    maximumStock: 35,
    unit: "bottles",
    costPerUnit: 3.75,
    supplier: "CleanCorp",
    lastOrdered: "2024-08-14",
    status: "in_stock",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "in_stock":
      return "default";
    case "low_stock":
      return "secondary";
    case "out_of_stock":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "low_stock":
      return "Low Stock";
    case "out_of_stock":
      return "Out of Stock";
    default:
      return "Unknown";
  }
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = inventoryItems.filter(
    (item) => item.status === "low_stock",
  ).length;
  const outOfStockItems = inventoryItems.filter(
    (item) => item.status === "out_of_stock",
  ).length;
  const totalValue = inventoryItems.reduce(
    (sum, item) => sum + item.currentStock * item.costPerUnit,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Track supplies, equipment, and stock levels
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <ShoppingCart className="mr-1 h-4 w-4" />
            Create Order
          </Button>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Items below minimum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent reorder needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
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
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Cleaning Supplies">
                  Cleaning Supplies
                </SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min/Max</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost/Unit</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.currentStock}</span>
                      <span className="text-muted-foreground text-sm">
                        {item.unit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Min: {item.minimumStock}</div>
                      <div className="text-muted-foreground">
                        Max: {item.maximumStock}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getStatusColor(item.status) as
                          | "default"
                          | "secondary"
                          | "outline"
                          | "destructive"
                          | null
                          | undefined
                      }
                    >
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>${item.costPerUnit.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">
                    ${(item.currentStock * item.costPerUnit).toFixed(2)}
                  </TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      {(item.status === "low_stock" ||
                        item.status === "out_of_stock") && (
                        <Button size="sm">Reorder</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
