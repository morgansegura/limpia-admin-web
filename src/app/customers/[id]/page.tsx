import React from "react";

import { Metadata } from "next";

import { Protected } from "@/components/protected/protected";
import { CustomerDetailPage } from "@/components/features/customers/customer-detail-page/customer-detail-page";

import { ROLES } from "@/constants/roles";

export const metadata: Metadata = {
  title: "Customer Detail | Limpia Admin",
};

type CustomerDetailDashboardPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailDashboardPage({
  params,
}: CustomerDetailDashboardPageProps) {
  const { id } = await params;

  return (
    <Protected allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER]}>
      <CustomerDetailPage id={id} />
    </Protected>
  );
}
