"use client";

import SalesEstimatePage from "@/components/features/tools/sales-estimate/sales-estimate";
import { Protected } from "@/components/protected/protected";

import { ROLES } from "@/constants/roles";

export default function CustomersDashboardPage() {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER];

  return (
    <Protected allowedRoles={allowedRoles}>
      <SalesEstimatePage />
    </Protected>
  );
}
