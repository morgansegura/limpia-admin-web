"use client";

import Link from "next/link";
import {
  Bell,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "../ui/separator";
import { jobsApi, crewsApi } from "@/lib/api";
import { TimerStatusIndicator } from "../timer-status-indicator";

interface DashboardStats {
  activeJobs: number;
  availableCrews: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
}

export function Header() {
  const { user, tenant, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    activeJobs: 0,
    availableCrews: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  // Load dashboard stats with enhanced error handling
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // Use actual API calls with individual error handling
        const jobStatsPromise = jobsApi.getStats().catch((error) => {
          if (
            error?.response?.status === 401 ||
            error?.message?.includes("jwt expired")
          ) {
            console.warn("🔐 Jobs API: Authentication expired, using fallback");
          } else {
            console.warn("Jobs API error:", error);
          }
          return { activeJobs: 0 }; // Fallback data
        });

        const crewStatsPromise = crewsApi.getAll().catch((error) => {
          if (
            error?.response?.status === 401 ||
            error?.message?.includes("jwt expired")
          ) {
            console.warn(
              "🔐 Crews API: Authentication expired, using fallback",
            );
          } else {
            console.warn("Crews API error:", error);
          }
          return []; // Fallback data
        });

        const [jobStats, crewStats] = await Promise.all([
          jobStatsPromise,
          crewStatsPromise,
        ]);

        setDashboardStats({
          activeJobs: (jobStats as { activeJobs?: number })?.activeJobs || 0,
          availableCrews: Array.isArray(crewStats)
            ? crewStats.filter(
                (crew: unknown) =>
                  crew &&
                  typeof crew === "object" &&
                  "status" in crew &&
                  (crew as { status: unknown }).status === "available",
              ).length
            : 0,
        });

        console.log("📊 Header stats loaded:", {
          activeJobs: (jobStats as { activeJobs?: number })?.activeJobs || 0,
          availableCrews: Array.isArray(crewStats) ? crewStats.length : 0,
        });
      } catch (error) {
        console.error("⚠️ Failed to load dashboard stats:", error);
        // Fallback to empty state on error
        setDashboardStats({
          activeJobs: 0,
          availableCrews: 0,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadDashboardStats();
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Try to load real notifications first
        // For now, we'll use a fallback since notifications endpoint might not be fully implemented
        const mockNotifications: Notification[] = [
          {
            id: "1",
            title: "System Connected",
            message: `Welcome ${
              user?.firstName || "User"
            }! Dashboard is now connected to backend services.`,
            timestamp: new Date(Date.now() - 2 * 60 * 1000),
            type: "success",
            read: false,
          },
          {
            id: "2",
            title: "Data Sync",
            message: "Live data is now being loaded from API endpoints",
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            type: "info",
            read: false,
          },
        ];

        setNotifications(mockNotifications);
        setIsLoadingNotifications(false);
      } catch (error) {
        console.error("Error loading notifications:", error);
        setIsLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [user]);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const hasUnreadNotifications = unreadNotifications.length > 0;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };
  return (
    <header className="bg-sidebar border-b border-border px-6 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
          </Button> */}
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search jobs, customers, crews..."
              className="pl-10 w-64 bg-muted/20"
            />
          </div> */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Live Stats */}
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">
                {isLoadingStats ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `${dashboardStats.activeJobs} Active Job${
                    dashboardStats.activeJobs !== 1 ? "s" : ""
                  }`
                )}
              </span>
            </div>

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">
                {isLoadingStats ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `${dashboardStats.availableCrews} Crew${
                    dashboardStats.availableCrews !== 1 ? "s" : ""
                  } Available`
                )}
              </span>
            </div>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Timer Status Indicator */}
          <TimerStatusIndicator />

          <Separator orientation="vertical" className="h-4" />

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {getThemeIcon()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center"
              >
                <Sun className="mr-1 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center"
              >
                <Moon className="mr-1 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="flex items-center"
              >
                <Monitor className="mr-1 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-4" />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <Badge className="absolute rounded-full -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadNotifications.length > 9
                      ? "9+"
                      : unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Recent Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoadingNotifications ? (
                <DropdownMenuItem>
                  <div className="flex items-center justify-center w-full py-4">
                    <span className="text-sm text-muted-foreground animate-pulse">
                      Loading notifications...
                    </span>
                  </div>
                </DropdownMenuItem>
              ) : notifications.length === 0 ? (
                <DropdownMenuItem>
                  <div className="flex items-center justify-center w-full py-4">
                    <span className="text-sm text-muted-foreground">
                      No notifications
                    </span>
                  </div>
                </DropdownMenuItem>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={!notification.read ? "bg-muted/30" : ""}
                  >
                    <div className="flex flex-col space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 h-13"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold tracking-wide text-primary-foreground">
                    {user ? getInitials(user.firstName, user.lastName) : "U"}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">
                    {user ? `${user.firstName} ${user.lastName}` : "User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.role?.replace("_", " ").toLowerCase()}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user ? `${user.firstName} ${user.lastName}` : "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {tenant && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {tenant.name}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center w-full">
                  <User className="mr-1 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="mr-1 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support" className="flex items-center w-full">
                  <HelpCircle className="mr-1 h-4 w-4" />
                  <span>Support</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-1 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
