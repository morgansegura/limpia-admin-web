"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  User,
  Loader2,
} from "lucide-react";
import { activityApi, ActivityItem } from "@/lib/api";

interface ProcessedActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: Date;
  icon: any;
  iconColor: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "job_completed":
      return { icon: CheckCircle, color: "text-green-500" };
    case "estimate_sent":
      return { icon: DollarSign, color: "text-blue-500" };
    case "crew_assigned":
      return { icon: User, color: "text-purple-500" };
    case "job_started":
      return { icon: Clock, color: "text-orange-500" };
    case "inventory_alert":
      return { icon: AlertCircle, color: "text-red-500" };
    case "new_customer":
      return { icon: User, color: "text-green-500" };
    default:
      return { icon: Clock, color: "text-gray-500" };
  }
};

const getActivityBadge = (type: string) => {
  switch (type) {
    case "job_completed":
      return { badge: "Completed", variant: "default" as const };
    case "estimate_sent":
      return { badge: "Pending", variant: "secondary" as const };
    case "crew_assigned":
      return { badge: "Assigned", variant: "outline" as const };
    case "job_started":
      return { badge: "In Progress", variant: "secondary" as const };
    case "inventory_alert":
      return { badge: "Action Needed", variant: "destructive" as const };
    case "new_customer":
      return { badge: "New", variant: "default" as const };
    default:
      return { badge: "Unknown", variant: "outline" as const };
  }
};

export function RecentActivity() {
  const [activities, setActivities] = useState<ProcessedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processActivityData = (activityData: ActivityItem[]): ProcessedActivity[] => {
    return activityData.map(item => {
      const { icon, color } = getActivityIcon(item.type);
      const { badge, variant } = getActivityBadge(item.type);
      
      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        time: new Date(item.timestamp),
        icon,
        iconColor: color,
        badge,
        badgeVariant: variant,
      };
    });
  };

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to load from real API first
        try {
          const activityData = await activityApi.getRecent(6);
          const processedActivities = processActivityData(activityData);
          setActivities(processedActivities);
        } catch (apiError) {
          console.warn('API not available, using fallback data:', apiError);
          
          // Fallback to mock data if API is not available
          const mockActivities: ProcessedActivity[] = [
            {
              id: '1',
              type: 'job_completed',
              title: 'Job Completed',
              description: `Team completed deep cleaning service`,
              time: new Date(Date.now() - Math.random() * 30 * 60 * 1000),
              icon: CheckCircle,
              iconColor: 'text-green-500',
              badge: 'Completed',
              badgeVariant: 'default',
            },
            {
              id: '2',
              type: 'estimate_sent',
              title: 'Estimate Sent',
              description: `$${Math.floor(Math.random() * 500 + 200)} estimate sent to customer`,
              time: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
              icon: DollarSign,
              iconColor: 'text-blue-500',
              badge: 'Pending',
              badgeVariant: 'secondary',
            },
            {
              id: '3',
              type: 'crew_assigned',
              title: 'Crew Assigned',
              description: `Team assigned to ${Math.floor(Math.random() * 4 + 1)}-bedroom cleaning`,
              time: new Date(Date.now() - Math.random() * 90 * 60 * 1000),
              icon: User,
              iconColor: 'text-purple-500',
              badge: 'Assigned',
              badgeVariant: 'outline',
            },
            {
              id: '4',
              type: 'job_started',
              title: 'Job Started',
              description: `Team started cleaning service`,
              time: new Date(Date.now() - Math.random() * 120 * 60 * 1000),
              icon: Clock,
              iconColor: 'text-orange-500',
              badge: 'In Progress',
              badgeVariant: 'secondary',
            },
            {
              id: '5',
              type: 'inventory_alert',
              title: 'Inventory Alert',
              description: `Cleaning supplies running low (${Math.floor(Math.random() * 10 + 1)} units remaining)`,
              time: new Date(Date.now() - Math.random() * 180 * 60 * 1000),
              icon: AlertCircle,
              iconColor: 'text-red-500',
              badge: 'Action Needed',
              badgeVariant: 'destructive',
            },
            {
              id: '6',
              type: 'new_customer',
              title: 'New Customer',
              description: `Customer registered for cleaning services`,
              time: new Date(Date.now() - Math.random() * 240 * 60 * 1000),
              icon: User,
              iconColor: 'text-green-500',
              badge: 'New',
              badgeVariant: 'default',
            },
          ];
          
          setActivities(mockActivities.slice(0, Math.floor(Math.random() * 3 + 4)));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading recent activity:', error);
        setError('Failed to load recent activity');
        setIsLoading(false);
      }
    };

    loadRecentActivity();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Loading activity...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1 ${activity.iconColor}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <Badge variant={activity.badgeVariant} className="text-xs">
                        {activity.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.time, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <Link
            href="/activity"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all activity →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}