"use client";

import { DashboardOverview } from "@/components/dashboard/overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { FranchiseSwitcher } from "@/components/franchise-switcher";
import { SalesDashboard } from "@/components/sales/sales-dashboard";
import { LeadsManagement } from "@/components/sales/leads-management";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/lib/api";

export default function Home() {
  const { user } = useAuth();

  // Debug logging to identify role issue
  console.log("🔍 [page.tsx] Current user:", user);
  console.log("🔍 [page.tsx] User role value:", user?.role);
  console.log("🔍 [page.tsx] User role type:", typeof user?.role);
  console.log("🔍 [page.tsx] UserRole.SALES_REP:", UserRole.SALES_REP);
  console.log("🔍 [page.tsx] Role comparison:", user?.role === UserRole.SALES_REP);

  const isSalesRole =
    user?.role === UserRole.SALES_REP || user?.role === UserRole.SALES_MANAGER;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {isSalesRole ? (
          <SalesDashboard
            userRole={user.role as UserRole.SALES_REP | UserRole.SALES_MANAGER}
          />
        ) : (
          <>
            <div className="border-b pb-4">
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back <strong>{user?.firstName}</strong>! Here&apos;s
                what&apos;s happening with <strong>Limpia</strong> today.
              </p>
            </div>

            <FranchiseSwitcher />

            <DashboardOverview />

            <div className="grid gap-6 lg:grid-cols-2">
              <QuickActions />
              <RecentActivity />
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
