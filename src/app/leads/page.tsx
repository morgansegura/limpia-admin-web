"use client";

import { LeadsPage } from "@/components/features/leads/leads-page/leads-page";
import { Protected } from "@/components/protected/protected";

import { ROLES } from "@/constants/roles";

export default function CustomersDashboardPage() {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER];

  return (
    <Protected allowedRoles={allowedRoles}>
      <LeadsPage />
    </Protected>
  );
}
