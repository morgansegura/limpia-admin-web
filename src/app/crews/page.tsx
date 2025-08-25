"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import { CrewCard } from "@/components/crews/crew-card";
import { CrewForm } from "@/components/crews/crew-form";
import { LiveTimeTracking } from "@/components/crews/live-time-tracking";
import { crewsApi } from "@/lib/api";

interface CrewMember {
  id?: string;
  name: string;
  role: string;
  status: string;
}

interface CurrentJob {
  id: string;
  customer: string;
  address: string;
  type: string;
  startTime: string;
  estimatedEnd: string;
  status: string;
}

interface CrewPerformance {
  completionRate: number;
  efficiency: number;
  customerRating: number;
}

interface Crew {
  id: string;
  name: string;
  members: CrewMember[];
  currentJob: CurrentJob | null;
  specializations: string[];
  performance: CrewPerformance;
  status?: string;
}

export default function CrewsPage() {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewCrewDialogOpen, setIsNewCrewDialogOpen] = useState(false);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load crews data from API
  useEffect(() => {
    loadCrews();
  }, []);

  const loadCrews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await crewsApi.getAll();
      setCrews(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.message?.includes('jwt expired')) {
        console.warn("🔐 Authentication expired, using fallback crew data");
      } else {
        console.error("Failed to load crews:", error);
      }
      
      // Use fallback mock data for development
      const mockCrews: Crew[] = [
        {
          id: "crew-001",
          name: "Alpha Team",
          members: [
            { id: "m1", name: "Maria Rodriguez", role: "Team Lead", status: "active" },
            { id: "m2", name: "James Wilson", role: "Cleaner", status: "active" },
          ],
          currentJob: {
            id: "job-123",
            customer: "Downtown Office Complex",
            address: "123 Business St",
            type: "commercial",
            startTime: "2025-08-20T09:00:00Z",
            estimatedEnd: "2025-08-20T12:00:00Z",
            status: "in_progress"
          },
          specializations: ["Commercial", "Deep Clean"],
          performance: {
            completionRate: 98,
            efficiency: 95,
            customerRating: 4.8
          },
          status: "on_job"
        },
        {
          id: "crew-002", 
          name: "Beta Squad",
          members: [
            { id: "m3", name: "David Chen", role: "Team Lead", status: "active" },
            { id: "m4", name: "Sarah Johnson", role: "Cleaner", status: "active" },
            { id: "m5", name: "Mike Torres", role: "Cleaner", status: "active" },
          ],
          currentJob: null,
          specializations: ["Residential", "Move-in/Move-out"],
          performance: {
            completionRate: 92,
            efficiency: 88,
            customerRating: 4.6
          },
          status: "available"
        }
      ];
      setCrews(mockCrews);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCrews = crews.filter((crew: Crew) => {
    const matchesSearch = crew.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && !crew.currentJob) ||
      (statusFilter === "on_job" && crew.currentJob);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crew Management</h1>
          <p className="text-muted-foreground">
            Manage your cleaning crews and track their performance
          </p>
        </div>
        <Dialog
          open={isNewCrewDialogOpen}
          onOpenChange={setIsNewCrewDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              New Crew
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Crew</DialogTitle>
            </DialogHeader>
            <CrewForm onClose={() => setIsNewCrewDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Live Time Tracking */}
      <LiveTimeTracking />

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search crews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crews</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on_job">On Job</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={view === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("cards")}
              >
                Cards
              </Button>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("table")}
              >
                Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crew Display */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-red-600">{error}</p>
              <Button onClick={loadCrews} className="mt-2">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredCrews.length === 0 && crews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No crews available</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first cleaning crew
              </p>
              <Button onClick={() => setIsNewCrewDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Crew
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredCrews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No crews found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : view === "cards" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCrews.map((crew: Crew) => (
            <CrewCard key={crew.id} crew={crew} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Crews</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crew Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Job</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCrews.map((crew: Crew) => (
                  <TableRow key={crew.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{crew.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {crew.specializations.join(", ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{crew.members.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={crew.currentJob ? "default" : "secondary"}
                      >
                        {crew.currentJob ? "On Job" : "Available"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {crew.currentJob ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {crew.currentJob.customer}
                          </div>
                          <div className="text-muted-foreground">
                            {crew.currentJob.type}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{crew.performance.completionRate}% completion</div>
                        <div className="text-muted-foreground">
                          ⭐ {crew.performance.customerRating}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
