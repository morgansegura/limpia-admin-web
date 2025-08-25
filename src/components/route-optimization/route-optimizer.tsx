"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Route,
  Clock,
  Fuel,
  DollarSign,
  Users,
  Navigation,
  Settings,
  Play,
  RotateCcw,
  Download,
  Eye,
  Zap,
  TrendingUp,
} from "lucide-react";
import { format, addMinutes } from "date-fns";

interface Location {
  id: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  jobId?: string;
  type: "depot" | "customer" | "supply_stop";
}

interface Job {
  id: string;
  customer: {
    name: string;
    address: string;
  };
  location: Location;
  estimatedDuration: number; // minutes
  priority: "low" | "normal" | "high" | "urgent";
  timeWindow: {
    earliest: Date;
    latest: Date;
  };
  requirements: string[];
  status: "pending" | "assigned" | "in_progress" | "completed";
}

interface Crew {
  id: string;
  name: string;
  vehicle: {
    type: string;
    fuelEfficiency: number; // miles per gallon
    capacity: number;
  };
  workingHours: {
    start: string;
    end: string;
  };
  homeBase: Location;
  skills: string[];
  currentLocation?: Location;
}

interface RouteSegment {
  from: Location;
  to: Location;
  distance: number; // miles
  duration: number; // minutes
  fuelCost: number;
}

interface OptimizedRoute {
  crewId: string;
  segments: RouteSegment[];
  jobs: Job[];
  totalDistance: number;
  totalDuration: number;
  totalFuelCost: number;
  estimatedRevenue: number;
  efficiency: number;
  startTime: Date;
  endTime: Date;
}

// Mock data
const mockJobs: Job[] = [
  {
    id: "job-1",
    customer: {
      name: "Sofia Martinez",
      address: "1200 Brickell Ave, Miami, FL 33131",
    },
    location: {
      id: "loc-1",
      address: "1200 Brickell Ave, Miami, FL 33131",
      coordinates: { lat: 25.7617, lng: -80.1918 },
      type: "customer",
      jobId: "job-1",
    },
    estimatedDuration: 120,
    priority: "high",
    timeWindow: {
      earliest: new Date(2024, 7, 16, 9, 0),
      latest: new Date(2024, 7, 16, 12, 0),
    },
    requirements: ["deep_clean", "eco_friendly"],
    status: "pending",
  },
  {
    id: "job-2",
    customer: {
      name: "Robert Kim",
      address: "500 Biscayne Blvd, Miami, FL 33132",
    },
    location: {
      id: "loc-2",
      address: "500 Biscayne Blvd, Miami, FL 33132",
      coordinates: { lat: 25.7753, lng: -80.1901 },
      type: "customer",
      jobId: "job-2",
    },
    estimatedDuration: 90,
    priority: "normal",
    timeWindow: {
      earliest: new Date(2024, 7, 16, 10, 0),
      latest: new Date(2024, 7, 16, 15, 0),
    },
    requirements: ["regular_clean", "pet_safe"],
    status: "pending",
  },
  {
    id: "job-3",
    customer: {
      name: "Maria Rodriguez",
      address: "850 Miami Ave, Miami, FL 33130",
    },
    location: {
      id: "loc-3",
      address: "850 Miami Ave, Miami, FL 33130",
      coordinates: { lat: 25.7663, lng: -80.1936 },
      type: "customer",
      jobId: "job-3",
    },
    estimatedDuration: 150,
    priority: "urgent",
    timeWindow: {
      earliest: new Date(2024, 7, 16, 8, 0),
      latest: new Date(2024, 7, 16, 11, 0),
    },
    requirements: ["move_out", "deep_clean"],
    status: "pending",
  },
];

const mockCrews: Crew[] = [
  {
    id: "crew-1",
    name: "Alpha Team",
    vehicle: {
      type: "Van",
      fuelEfficiency: 18,
      capacity: 8,
    },
    workingHours: { start: "08:00", end: "17:00" },
    homeBase: {
      id: "depot-1",
      address: "Limpia HQ, 1000 NW 7th St, Miami, FL 33136",
      coordinates: { lat: 25.7814, lng: -80.2056 },
      type: "depot",
    },
    skills: ["deep_clean", "move_out", "residential"],
  },
  {
    id: "crew-2",
    name: "Beta Team",
    vehicle: {
      type: "Truck",
      fuelEfficiency: 14,
      capacity: 12,
    },
    workingHours: { start: "09:00", end: "18:00" },
    homeBase: {
      id: "depot-2",
      address: "Limpia Warehouse, 2500 NW 79th Ave, Miami, FL 33122",
      coordinates: { lat: 25.7967, lng: -80.3193 },
      type: "depot",
    },
    skills: ["commercial", "deep_clean", "post_construction"],
  },
];

// Utility functions for route optimization
const calculateDistance = (loc1: Location, loc2: Location): number => {
  // Haversine formula for calculating distance between two coordinates
  const R = 3959; // Earth radius in miles
  const dLat = ((loc2.coordinates.lat - loc1.coordinates.lat) * Math.PI) / 180;
  const dLng = ((loc2.coordinates.lng - loc1.coordinates.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.coordinates.lat * Math.PI) / 180) *
      Math.cos((loc2.coordinates.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateTravelTime = (distance: number): number => {
  // Estimate travel time based on distance (assuming average city speed of 25 mph)
  return Math.round((distance / 25) * 60); // minutes
};

const calculateFuelCost = (
  distance: number,
  fuelEfficiency: number,
  fuelPrice = 3.5,
): number => {
  return (distance / fuelEfficiency) * fuelPrice;
};

export function RouteOptimizer() {
  const [jobs] = useState<Job[]>(mockJobs);
  const [crews] = useState<Crew[]>(mockCrews);
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [optimizationSettings, setOptimizationSettings] = useState({
    prioritizeTimeWindows: true,
    minimizeFuelCost: true,
    balanceWorkload: true,
    considerTraffic: false,
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<OptimizedRoute | null>(
    null,
  );

  // Optimize routes using a simplified algorithm
  const optimizeRoutes = useCallback(async () => {
    setIsOptimizing(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const routes: OptimizedRoute[] = [];
    const availableJobs = [...jobs.filter((job) => job.status === "pending")];

    for (const crew of crews) {
      const crewJobs: Job[] = [];
      const segments: RouteSegment[] = [];
      let currentLocation = crew.homeBase;
      let currentTime = new Date(selectedDate);
      const [startHour, startMinute] = crew.workingHours.start
        .split(":")
        .map(Number);
      currentTime.setHours(startHour, startMinute, 0, 0);

      // Simple greedy algorithm: pick closest job that fits time window
      while (availableJobs.length > 0 && crewJobs.length < 6) {
        let bestJob: Job | null = null;
        let bestJobIndex = -1;
        let bestDistance = Infinity;

        for (let i = 0; i < availableJobs.length; i++) {
          const job = availableJobs[i];

          // Check if crew has required skills
          const hasRequiredSkills = job.requirements.every((req) =>
            crew.skills.some(
              (skill) => skill.includes(req) || req.includes(skill),
            ),
          );

          if (!hasRequiredSkills) continue;

          const distance = calculateDistance(currentLocation, job.location);
          const travelTime = calculateTravelTime(distance);
          const arrivalTime = addMinutes(currentTime, travelTime);

          // Check if job fits in time window
          if (
            arrivalTime <= job.timeWindow.latest &&
            addMinutes(arrivalTime, job.estimatedDuration) <=
              job.timeWindow.latest
          ) {
            // Prioritize by urgency and distance
            const priority_weight =
              job.priority === "urgent"
                ? 0.5
                : job.priority === "high"
                ? 0.7
                : job.priority === "normal"
                ? 0.9
                : 1.0;
            const weighted_distance = distance * priority_weight;

            if (weighted_distance < bestDistance) {
              bestDistance = weighted_distance;
              bestJob = job;
              bestJobIndex = i;
            }
          }
        }

        if (bestJob) {
          // Add travel segment
          const distance = calculateDistance(currentLocation, bestJob.location);
          const duration = calculateTravelTime(distance);
          const fuelCost = calculateFuelCost(
            distance,
            crew.vehicle.fuelEfficiency,
          );

          segments.push({
            from: currentLocation,
            to: bestJob.location,
            distance,
            duration,
            fuelCost,
          });

          crewJobs.push(bestJob);
          currentLocation = bestJob.location;
          currentTime = addMinutes(
            currentTime,
            duration + bestJob.estimatedDuration,
          );
          availableJobs.splice(bestJobIndex, 1);
        } else {
          break; // No more suitable jobs
        }
      }

      // Return to home base
      if (crewJobs.length > 0) {
        const distance = calculateDistance(currentLocation, crew.homeBase);
        const duration = calculateTravelTime(distance);
        const fuelCost = calculateFuelCost(
          distance,
          crew.vehicle.fuelEfficiency,
        );

        segments.push({
          from: currentLocation,
          to: crew.homeBase,
          distance,
          duration,
          fuelCost,
        });
      }

      const totalDistance = segments.reduce(
        (sum, seg) => sum + seg.distance,
        0,
      );
      const totalDuration =
        segments.reduce((sum, seg) => sum + seg.duration, 0) +
        crewJobs.reduce((sum, job) => sum + job.estimatedDuration, 0);
      const totalFuelCost = segments.reduce(
        (sum, seg) => sum + seg.fuelCost,
        0,
      );
      const estimatedRevenue = crewJobs.length * 200; // $200 average per job
      const efficiency =
        estimatedRevenue > 0 ? estimatedRevenue / (totalFuelCost + 100) : 0; // Include labor cost estimate

      const route: OptimizedRoute = {
        crewId: crew.id,
        segments,
        jobs: crewJobs,
        totalDistance,
        totalDuration,
        totalFuelCost,
        estimatedRevenue,
        efficiency,
        startTime: new Date(selectedDate),
        endTime: addMinutes(new Date(selectedDate), totalDuration),
      };

      if (crewJobs.length > 0) {
        routes.push(route);
      }
    }

    setOptimizedRoutes(routes);
    setIsOptimizing(false);
  }, [jobs, crews, selectedDate]);

  const routeStats = useMemo(() => {
    const totalJobs = optimizedRoutes.reduce(
      (sum, route) => sum + route.jobs.length,
      0,
    );
    const totalDistance = optimizedRoutes.reduce(
      (sum, route) => sum + route.totalDistance,
      0,
    );
    const totalFuelCost = optimizedRoutes.reduce(
      (sum, route) => sum + route.totalFuelCost,
      0,
    );
    const totalRevenue = optimizedRoutes.reduce(
      (sum, route) => sum + route.estimatedRevenue,
      0,
    );
    const avgEfficiency =
      optimizedRoutes.length > 0
        ? optimizedRoutes.reduce((sum, route) => sum + route.efficiency, 0) /
          optimizedRoutes.length
        : 0;

    return {
      totalJobs,
      totalDistance,
      totalFuelCost,
      totalRevenue,
      avgEfficiency,
    };
  }, [optimizedRoutes]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "normal":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const RouteCard = ({ route }: { route: OptimizedRoute }) => {
    const crew = crews.find((c) => c.id === route.crewId);

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedRoute(route)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {crew?.name}
            </CardTitle>
            <Badge variant="outline" className="bg-green-50">
              {route.jobs.length} jobs
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span>{route.totalDistance.toFixed(1)} miles</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {Math.round(route.totalDuration / 60)}h{" "}
                {route.totalDuration % 60}m
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              <span>${route.totalFuelCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>${route.estimatedRevenue}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Efficiency Score</span>
              <span className="font-medium">{route.efficiency.toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min(route.efficiency * 10, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Jobs:</Label>
            <div className="flex flex-wrap gap-1">
              {route.jobs.map((job) => (
                <div key={job.id} className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getPriorityColor(
                      job.priority,
                    )}`}
                  />
                  <span className="text-xs">{job.customer.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Route Optimization
          </h1>
          <p className="text-muted-foreground">
            AI-powered route planning for maximum efficiency and cost savings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-1 h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Optimization Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Prioritize Time Windows</Label>
                  <input
                    type="checkbox"
                    checked={optimizationSettings.prioritizeTimeWindows}
                    onChange={(e) =>
                      setOptimizationSettings((prev) => ({
                        ...prev,
                        prioritizeTimeWindows: e.target.checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Minimize Fuel Cost</Label>
                  <input
                    type="checkbox"
                    checked={optimizationSettings.minimizeFuelCost}
                    onChange={(e) =>
                      setOptimizationSettings((prev) => ({
                        ...prev,
                        minimizeFuelCost: e.target.checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Balance Workload</Label>
                  <input
                    type="checkbox"
                    checked={optimizationSettings.balanceWorkload}
                    onChange={(e) =>
                      setOptimizationSettings((prev) => ({
                        ...prev,
                        balanceWorkload: e.target.checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Consider Traffic</Label>
                  <input
                    type="checkbox"
                    checked={optimizationSettings.considerTraffic}
                    onChange={(e) =>
                      setOptimizationSettings((prev) => ({
                        ...prev,
                        considerTraffic: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={optimizeRoutes}
            disabled={isOptimizing}
            className="gap-2"
          >
            {isOptimizing ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Optimize Routes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {optimizedRoutes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeStats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                of {jobs.filter((j) => j.status === "pending").length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Distance
              </CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routeStats.totalDistance.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">miles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fuel Cost</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${routeStats.totalFuelCost.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">estimated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${routeStats.totalRevenue.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">estimated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routeStats.avgEfficiency.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">average score</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-select">Date:</Label>
              <Input
                id="date-select"
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-40"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label>Unassigned Jobs:</Label>
              <Badge variant="outline">
                {jobs.filter((job) => job.status === "pending").length}
              </Badge>
            </div>

            <div className="flex-1" />

            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Export Routes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optimized Routes */}
      {optimizedRoutes.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Optimized Routes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {optimizedRoutes.map((route) => (
              <RouteCard key={route.crewId} route={route} />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Route className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Routes Optimized</h3>
              <p className="text-muted-foreground mb-4">
                Click &quot;Optimize Routes&quot; to generate efficient routes
                for your crews
              </p>
              <Button onClick={optimizeRoutes} disabled={isOptimizing}>
                <Play className="mr-1 h-4 w-4" />
                Start Optimization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Details Dialog */}
      <Dialog
        open={!!selectedRoute}
        onOpenChange={() => setSelectedRoute(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Route Details -{" "}
              {crews.find((c) => c.id === selectedRoute?.crewId)?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedRoute && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {selectedRoute.jobs.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Jobs</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {selectedRoute.totalDistance.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Miles</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {Math.round(selectedRoute.totalDuration / 60)}h
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Duration
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      ${selectedRoute.totalFuelCost.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Fuel Cost
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Jobs in Route</h4>
                  {selectedRoute.jobs.map((job, index) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{job.customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {job.customer.address}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`inline-block w-2 h-2 rounded-full ${getPriorityColor(
                            job.priority,
                          )} mr-2`}
                        />
                        <Badge variant="outline">{job.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-3">
                  {selectedRoute.segments.map((segment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {segment.from.address} → {segment.to.address}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {segment.distance.toFixed(1)} miles •{" "}
                          {segment.duration} minutes • $
                          {segment.fuelCost.toFixed(2)} fuel
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="map" className="space-y-4">
                <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      Interactive Map
                    </h3>
                    <p className="text-muted-foreground">
                      Google Maps integration would be displayed here
                    </p>
                    <Button variant="outline" className="mt-4">
                      <Eye className="mr-1 h-4 w-4" />
                      View in Google Maps
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
