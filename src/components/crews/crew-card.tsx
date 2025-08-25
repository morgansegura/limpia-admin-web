"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  MapPin,
  Clock,
  Star,
  MoreHorizontal,
  Phone,
  MessageSquare,
  Settings,
} from "lucide-react";

interface CrewCardProps {
  crew: {
    id: string;
    name: string;
    members: Array<{
      name: string;
      role: string;
      status: string;
    }>;
    currentJob?: {
      id: string;
      customer: string;
      address: string;
      type: string;
      startTime: string;
      estimatedEnd: string;
      status: string;
    } | null;
    specializations: string[];
    performance: {
      completionRate: number;
      efficiency: number;
      customerRating: number;
    };
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "on_job":
      return "bg-green-500";
    case "available":
      return "bg-blue-500";
    case "break":
      return "bg-yellow-500";
    case "off_duty":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "on_job":
      return "On Job";
    case "available":
      return "Available";
    case "break":
      return "On Break";
    case "off_duty":
      return "Off Duty";
    default:
      return "Unknown";
  }
};

export function CrewCard({ crew }: CrewCardProps) {
  const isOnJob = !!crew.currentJob;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{crew.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-1 h-4 w-4" />
                Edit Crew
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="mr-1 h-4 w-4" />
                Call Team Leader
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-1 h-4 w-4" />
                Send Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isOnJob ? "default" : "secondary"}>
            {isOnJob ? "On Job" : "Available"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {crew.specializations.join(", ")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Members */}
        <div>
          <div className="flex items-center mb-2">
            <Users className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-medium">
              Team Members ({crew.members.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {crew.members.map((member, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium">{member.name}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      member.status,
                    )}`}
                    title={getStatusLabel(member.status)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Job */}
        {crew.currentJob ? (
          <div className="border-t pt-4">
            <div className="flex items-center mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm font-medium">Current Job</span>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-sm">
                {crew.currentJob.customer}
              </div>
              <div className="text-xs text-muted-foreground">
                {crew.currentJob.type} • {crew.currentJob.address}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {crew.currentJob.startTime} - {crew.currentJob.estimatedEnd}
              </div>
            </div>
            <div className="mt-2 flex space-x-2">
              <Button size="sm" variant="outline" className="text-xs">
                Track Progress
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Contact Crew
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t pt-4">
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground mb-2">
                No active job
              </div>
              <Button size="sm">Assign Job</Button>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {crew.performance.completionRate}%
              </div>
              <div className="text-xs text-muted-foreground">Completion</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {crew.performance.efficiency}%
              </div>
              <div className="text-xs text-muted-foreground">Efficiency</div>
            </div>
            <div>
              <div className="flex items-center justify-center">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                <span className="text-lg font-bold">
                  {crew.performance.customerRating}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
