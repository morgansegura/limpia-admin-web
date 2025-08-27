"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, Building } from "lucide-react";

interface Franchise {
  id: string;
  name: string;
  slug: string;
  status: string;
  userCount: number;
  monthlyRevenue: number;
  customerCount: number;
}

interface FranchiseSwitcherProps {
  onFranchiseChange?: (franchiseId: string | null) => void;
}

export function FranchiseSwitcher({
  onFranchiseChange,
}: FranchiseSwitcherProps) {
  const { user } = useAuth();
  const [selectedFranchise, setSelectedFranchise] = useState<string>("all");
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [aggregateData, setAggregateData] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    activeFranchises: 0,
  });

  // Only show for corporate executives
  const isCorporateExecutive = user?.role === "CORPORATE_EXECUTIVE";

  useEffect(() => {
    if (isCorporateExecutive) {
      fetchFranchiseData();
    }
  }, [isCorporateExecutive]);

  const fetchFranchiseData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/franchises`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setFranchises(data.franchises || []);
        setAggregateData(
          data.aggregate || {
            totalRevenue: 0,
            totalCustomers: 0,
            totalEmployees: 0,
            activeFranchises: 0,
          },
        );
      }
    } catch (error) {
      console.error("Failed to fetch franchise data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFranchiseChange = (value: string) => {
    setSelectedFranchise(value);
    onFranchiseChange?.(value === "all" ? null : value);
  };

  if (!isCorporateExecutive) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading franchise data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Franchise Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Franchise Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                View Data For:
              </label>
              <Select
                value={selectedFranchise}
                onValueChange={handleFranchiseChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select franchise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Franchises (Aggregate)
                  </SelectItem>
                  {franchises.map((franchise) => (
                    <SelectItem key={franchise.id} value={franchise.id}>
                      <div className="flex items-center gap-2">
                        <span>{franchise.name}</span>
                        <Badge
                          variant={
                            franchise.status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {franchise.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aggregate Stats */}
      {selectedFranchise === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    Active Franchises
                  </p>
                  <p className="text-2xl font-bold">
                    {aggregateData.activeFranchises}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    ${aggregateData.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">
                    {aggregateData.totalCustomers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    Total Employees
                  </p>
                  <p className="text-2xl font-bold">
                    {aggregateData.totalEmployees}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual Franchise Stats */}
      {selectedFranchise !== "all" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            const franchise = franchises.find(
              (f) => f.id === selectedFranchise,
            );
            if (!franchise) return null;

            return (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">
                          Monthly Revenue
                        </p>
                        <p className="text-2xl font-bold">
                          ${franchise.monthlyRevenue.toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">
                          Customers
                        </p>
                        <p className="text-2xl font-bold">
                          {franchise.customerCount}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">
                          Employees
                        </p>
                        <p className="text-2xl font-bold">
                          {franchise.userCount}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      )}

      {/* Franchise List */}
      {selectedFranchise === "all" && franchises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Franchise Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {franchises.map((franchise) => (
                <div
                  key={franchise.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleFranchiseChange(franchise.id)}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{franchise.name}</p>
                      <p className="text-sm text-gray-500">
                        Slug: {franchise.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${franchise.monthlyRevenue.toLocaleString()}/mo
                      </p>
                      <p className="text-xs text-gray-500">
                        {franchise.customerCount} customers
                      </p>
                    </div>
                    <Badge
                      variant={
                        franchise.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {franchise.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
