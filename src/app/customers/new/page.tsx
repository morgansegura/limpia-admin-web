"use client";

import { CustomerNewPage } from "@/components/features/customers/customer-new/customer-new";
import { DashboardLayout } from "@/components/layout/dashboard-layout/dashboard-layout";
import { Protected } from "@/components/protected/protected";

import { ROLES } from "@/constants/roles";

export default function CustomerNewDashboardPage() {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER];

  return (
    <Protected allowedRoles={allowedRoles}>
      <DashboardLayout>
        <CustomerNewPage />
      </DashboardLayout>
    </Protected>
  );
}
