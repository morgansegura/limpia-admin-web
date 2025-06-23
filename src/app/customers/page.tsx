"use client";

import { CustomersPage } from "@/components/features/customers/customers-page/customers-page";
import { Protected } from "@/components/protected/protected";

import { ROLES } from "@/constants/roles";

export default function CustomersDashboardPage() {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER];

  return (
    <Protected allowedRoles={allowedRoles}>
      <CustomersPage />
    </Protected>
  );
}
