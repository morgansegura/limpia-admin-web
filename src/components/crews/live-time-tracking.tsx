"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MapPin, Phone, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock data for active time entries
const activeTimeEntries = [
  {
    id: "1",
    user: {
      name: "John Smith",
      initials: "JS",
    },
    job: {
      id: "job-1",
      customer: "Sofia Martinez",
      address: "1200 Brickell Ave, Miami",
      service: "Deep Clean Blue",
    },
    crew: {
      name: "Alpha Team",
    },
    clockInTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    clockInLocation: {
      lat: 25.7617,
      lng: -80.1918,
      accuracy: 5,
    },
    status: "on_site",
  },
  {
    id: "2",
    user: {
      name: "Maria Garcia",
      initials: "MG",
    },
    job: {
      id: "job-1",
      customer: "Sofia Martinez",
      address: "1200 Brickell Ave, Miami",
      service: "Deep Clean Blue",
    },
    crew: {
      name: "Alpha Team",
    },
    clockInTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    clockInLocation: {
      lat: 25.7617,
      lng: -80.1918,
      accuracy: 3,
    },
    status: "on_site",
  },
  {
    id: "3",
    user: {
      name: "Lisa Chen",
      initials: "LC",
    },
    job: {
      id: "job-2",
      customer: "Robert Kim",
      address: "500 Biscayne Blvd, Miami",
      service: "Regular House Cleaning",
    },
    crew: {
      name: "Gamma Team",
    },
    clockInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    clockInLocation: {
      lat: 25.7743,
      lng: -80.1937,
      accuracy: 8,
    },
    status: "in_progress",
  },
  {
    id: "4",
    user: {
      name: "Carlos Rodriguez",
      initials: "CR",
    },
    job: {
      id: "job-2",
      customer: "Robert Kim",
      address: "500 Biscayne Blvd, Miami",
      service: "Regular House Cleaning",
    },
    crew: {
      name: "Gamma Team",
    },
    clockInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    clockInLocation: {
      lat: 25.7743,
      lng: -80.1937,
      accuracy: 12,
    },
    status: "break",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "on_site":
      return "bg-green-500";
    case "in_progress":
      return "bg-blue-500";
    case "break":
      return "bg-yellow-500";
    case "en_route":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "on_site":
      return "On Site";
    case "in_progress":
      return "Working";
    case "break":
      return "On Break";
    case "en_route":
      return "En Route";
    default:
      return "Unknown";
  }
};

export function LiveTimeTracking() {
  if (activeTimeEntries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Live Time Tracking
          <Badge className="ml-2">{activeTimeEntries.length} Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeTimeEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>{entry.user.initials}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                      entry.status,
                    )}`}
                    title={getStatusLabel(entry.status)}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{entry.user.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {entry.crew.name}
                    </Badge>
                    <Badge
                      variant={
                        entry.status === "break" ? "secondary" : "default"
                      }
                      className="text-xs"
                    >
                      {getStatusLabel(entry.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {entry.job.customer} • {entry.job.service}
                    </div>
                    <div className="text-xs">
                      Started {formatDistanceToNow(entry.clockInTime)} ago
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <Button variant="link" className="text-sm">
            View All Time Entries →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
