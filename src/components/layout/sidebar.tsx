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
} from "lucide-react";
import { usePermissions } from "@/contexts/auth-context";

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

export function Sidebar() {
  const pathname = usePathname();
  const { canAccessFeature } = usePermissions();

  // Filter navigation based on user permissions
  const filteredNavigation = navigation.filter(item => {
    if (item.requiredFeature === null) return true;
    return canAccessFeature(item.requiredFeature);
  });

  return (
    <div className="flex h-full w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white">
      <div className="flex flex-shrink-0 items-center px-6 py-4">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-lg font-bold text-white">L</span>
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900">Limpia</span>
        </div>
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        <nav className="flex-1 space-y-1 px-3 pb-4">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-blue-50 border-r-2 border-blue-600 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-5 w-5"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Bottom Section - User Info */}
      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <div className="group block w-full flex-shrink-0">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-xs text-gray-500">
                Limpia Management Platform
              </p>
              <p className="text-xs text-gray-400">
                v1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}