import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getCustomerById } from "@/lib/api/customers";

import { Protected } from "@/components/protected/protected";
import { ROLES } from "@/constants/roles";
import { CustomerDetail } from "@/components/features/customers/customer-detail/customer-detail";
import { CustomerDetailPage } from "@/components/features/customers/customer-detail-page/customer-detail-page";

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
