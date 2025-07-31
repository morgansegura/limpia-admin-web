"use client";

import { useEffect, useState } from "react";
import { getCustomerById } from "@/lib/api/customers";
import { CustomerDetail } from "@/components/features/customers/customer-detail/customer-detail";
import { DashboardLayout } from "@/components/dashboard/dashboard";

import { TCustomer } from "@/types/customer.types";

type CustomerDetailPageProps = {
  id: string;
};

export function CustomerDetailPage({ id }: CustomerDetailPageProps) {
  const [customer, setCustomer] = useState<TCustomer | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getCustomerById(id);
      setCustomer(data);
    }
    load();
  }, [id]);

  if (!customer) return;

  return (
    <DashboardLayout>
      <CustomerDetail customer={customer} />
    </DashboardLayout>
  );
}
