import { Metadata } from "next";

import { Protected } from "@/components/protected/protected";

import { ROLES } from "@/constants/roles";
import { DashboardLayout } from "@/components/dashboard/dashboard";
import { JobCreateForm } from "@/components/features/jobs/job-create-form/job-create-form";

export const metadata: Metadata = {
  title: "Create New Job | Limpia Admin",
};

export default function JobNewDashboardPage() {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER];

  return (
    <Protected allowedRoles={allowedRoles}>
      <DashboardLayout>
        <JobCreateForm />
      </DashboardLayout>
    </Protected>
  );
}
