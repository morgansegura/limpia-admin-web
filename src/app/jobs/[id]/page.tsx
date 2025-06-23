import { Metadata } from "next";

import { JobPage } from "@/components/features/jobs/job-page/job-page";
import { Protected } from "@/components/protected/protected";

import { ROLES } from "@/constants/roles";

export const metadata: Metadata = {
  title: "Customer Detail | Limpia Admin",
};
type JobDashboardPageProps = {
  params: Promise<{ id: string }>;
};
export default async function JobDashboardPage({
  params,
}: JobDashboardPageProps) {
  const { id } = await params;
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER];

  return (
    <Protected allowedRoles={allowedRoles}>
      <JobPage jobId={id} />
    </Protected>
  );
}
