"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  Package,
  Users,
  MapPin,
  Route,
  Gift,
  Brain,
  Zap,
  Send,
  Wallet,
  UserCheck,
  Timer,
  Target,
  Clock,
  Briefcase,
  Book,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePermissions } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogoText } from "../logo/logo";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    requiredFeature: null,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    requiredFeature: "analytics",
  },
  {
    name: "Predictive Analytics",
    href: "/predictive-analytics",
    icon: Brain,
    requiredFeature: "analytics",
  },
  {
    name: "Crews",
    href: "/crews",
    icon: Users,
    requiredFeature: "crews",
  },
  {
    name: "Earnings",
    href: "/earnings",
    icon: Wallet,
    requiredFeature: "crews",
  },
  {
    name: "Profiles",
    href: "/profiles",
    icon: UserCheck,
    requiredFeature: "crews",
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Timer,
    requiredFeature: "crews",
  },
  {
    name: "Job Timer",
    href: "/job-timer",
    icon: Clock,
    requiredFeature: "crews",
  },
  {
    name: "Worker Classification",
    href: "/worker-classification",
    icon: Briefcase,
    requiredFeature: "crews",
  },
  {
    name: "Employee Handbook",
    href: "/employee-handbook",
    icon: Book,
    requiredFeature: "crews",
  },
  {
    name: "Safety Protocols",
    href: "/safety-protocols",
    icon: Shield,
    requiredFeature: "crews",
  },
  {
    name: "Equipment Inventory",
    href: "/equipment-inventory",
    icon: Package,
    requiredFeature: "inventory",
  },
  {
    name: "Jobs",
    href: "/jobs",
    icon: MapPin,
    requiredFeature: "jobs",
  },
  {
    name: "Schedule",
    href: "/schedule",
    icon: Calendar,
    requiredFeature: "jobs",
  },
  {
    name: "Dispatch",
    href: "/dispatch",
    icon: Send,
    requiredFeature: "jobs",
  },
  {
    name: "Routes",
    href: "/routes",
    icon: Route,
    requiredFeature: "jobs",
  },
  {
    name: "Sales",
    href: "/sales",
    icon: DollarSign,
    requiredFeature: "sales",
  },
  {
    name: "Commissions",
    href: "/commissions",
    icon: Target,
    requiredFeature: "sales",
  },
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCard,
    requiredFeature: "sales",
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
    requiredFeature: "sales",
  },
  {
    name: "Quality",
    href: "/quality",
    icon: CheckCircle,
    requiredFeature: "jobs",
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
    requiredFeature: "sales",
  },
  {
    name: "Referrals",
    href: "/referrals",
    icon: Gift,
    requiredFeature: "sales",
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Building2,
    requiredFeature: "customers",
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    requiredFeature: "inventory",
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Zap,
    requiredFeature: "analytics",
  },
];

// Group navigation items by category
const navigationGroups = [
  {
    name: "Overview",
    items: navigation.filter((item) =>
      ["Dashboard", "Analytics", "Predictive Analytics"].includes(item.name),
    ),
  },
  {
    name: "Team Management",
    items: navigation.filter((item) =>
      [
        "Crews",
        "Earnings",
        "Profiles",
        "Attendance",
        "Job Timer",
        "Worker Classification",
        "Employee Handbook",
        "Safety Protocols",
      ].includes(item.name),
    ),
  },
  {
    name: "Operations",
    items: navigation.filter((item) =>
      [
        "Jobs",
        "Schedule",
        "Dispatch",
        "Routes",
        "Quality",
        "Equipment Inventory",
      ].includes(item.name),
    ),
  },
  {
    name: "Sales & Revenue",
    items: navigation.filter((item) =>
      ["Sales", "Commissions", "Payments", "Invoices", "Referrals"].includes(
        item.name,
      ),
    ),
  },
  {
    name: "Customer Relations",
    items: navigation.filter((item) =>
      ["Customers", "Notifications"].includes(item.name),
    ),
  },
  {
    name: "System",
    items: navigation.filter((item) =>
      ["Inventory", "Integrations"].includes(item.name),
    ),
  },
];

export function EnhancedSidebar() {
  const pathname = usePathname();
  const { canAccessFeature } = usePermissions();
  const { collapsed, toggle } = useSidebar();

  // Filter navigation based on user permissions
  const getFilteredItems = (items: typeof navigation) =>
    items.filter((item) => {
      if (item.requiredFeature === null) return true;
      return canAccessFeature(item.requiredFeature);
    });

  const SidebarLink = ({
    item,
    collapsed,
  }: {
    item: (typeof navigation)[0];
    collapsed: boolean;
  }) => {
    const isActive = pathname === item.href;

    const content = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground tracking-wide",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            : "text-sidebar-foreground",
          collapsed && "justify-center px-1",
        )}
      >
        <item.icon
          className={cn(
            "h-4 w-4 flex-shrink-0",
            isActive
              ? "text-sidebar-primary-foreground"
              : "text-sidebar-foreground",
          )}
        />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <Card
      className={cn(
        "fixed left-0 top-0 h-screen transition-all duration-300 shadow-none border-r",
        "bg-sidebar border-sidebar-border rounded-none py-1",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-2 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-sidebar-foreground">
                <LogoText className="h-5 fill-(--primary)" />
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="h-8 w-8 p-0 rounded-full text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-y p-2">
          <nav className="space-y-2">
            {navigationGroups.map((group, groupIndex) => {
              const filteredItems = getFilteredItems(group.items);

              if (filteredItems.length === 0) return null;

              return (
                <div key={group.name}>
                  {!collapsed && (
                    <div className="px-1 py-1">
                      <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                        {group.name}
                      </h3>
                    </div>
                  )}
                  <div className="space-y-1">
                    {filteredItems.map((item) => (
                      <SidebarLink
                        key={item.href}
                        item={item}
                        collapsed={collapsed}
                      />
                    ))}
                  </div>
                  {!collapsed && groupIndex < navigationGroups.length - 1 && (
                    <Separator className="my-3 bg-sidebar-border" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div
            className={cn("text-center", collapsed && "flex justify-center")}
          >
            {collapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">L</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <div>
                      <p className="font-medium">Limpia Management</p>
                      <p className="text-xs text-muted-foreground">v1.0.0</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div>
                <p className="text-xs font-medium text-sidebar-foreground">
                  Limpia Management Platform
                </p>
                <p className="text-xs text-sidebar-foreground/60">v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
