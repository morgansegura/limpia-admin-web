"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  FileText,
  Users,
  Package,
  DollarSign,
} from "lucide-react";

const actions = [
  {
    title: "New Booking",
    description: "Schedule a new cleaning service",
    icon: Calendar,
    href: "/schedule",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Create Estimate",
    description: "Generate quote for customer",
    icon: FileText,
    href: "/sales",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "Add Customer",
    description: "Register new customer",
    icon: Plus,
    href: "/customers",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    title: "Manage Crews",
    description: "Assign jobs and track teams",
    icon: Users,
    href: "/crews",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    title: "Inventory Check",
    description: "Review stock levels",
    icon: Package,
    href: "/inventory",
    color: "bg-red-500 hover:bg-red-600",
  },
  {
    title: "Sales Report",
    description: "View performance metrics",
    icon: DollarSign,
    href: "/analytics",
    color: "bg-indigo-500 hover:bg-indigo-600",
  },
];

export function QuickActions() {
  const router = useRouter();

  const handleActionClick = (href: string) => {
    router.push(href);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-gray-50"
              onClick={() => handleActionClick(action.href)}
            >
              <div className={`p-2 rounded-md ${action.color}`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
