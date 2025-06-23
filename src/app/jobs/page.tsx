"use client";

import { JobsPage } from "@/components/features/jobs/jobs-page/jobs-page";
import { Protected } from "@/components/protected/protected";
import { ROLES } from "@/constants/roles";

export default function JobsDashboardPage() {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER];

  return (
    <Protected allowedRoles={allowedRoles}>
      <JobsPage />
    </Protected>
  );
}
