import React from "react";

import { Metadata } from "next";

import { Protected } from "@/components/protected/protected";
import { LeadDetailPage } from "@/components/features/leads/lead-detail/lead-detail-page";

import { ROLES } from "@/constants/roles";

export const metadata: Metadata = {
  title: "Leads Detail | Limpia Admin",
};

type LeadDetailDashboardPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailDashboardPage({
  params,
}: LeadDetailDashboardPageProps) {
  const { id } = await params;

  return (
    <Protected allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER]}>
      <LeadDetailPage id={id} />
    </Protected>
  );
}
