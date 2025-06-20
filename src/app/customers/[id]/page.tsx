import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getCustomerById } from "@/lib/api/customers";

import { CustomerDetailPage } from "@/components/features/customers/customer-detail-page/customer-detail-page";

export const metadata: Metadata = {
  title: "Customer Detail | Limpia Admin",
};

type Props = {
  params: { id: string };
};

export default async function CustomerDetailDashboardPage({ params }: Props) {
  const { id } = params;

  const customer = await getCustomerById(id);

  if (!customer) return notFound();

  return <CustomerDetailPage customer={customer} />;
}
