"use client";

import { useEffect, useState } from "react";
import { getCustomerById } from "@/lib/api/customers";
import { CustomerDetail } from "@/components/features/customers/customer-detail/customer-detail";
import { DashboardLayout } from "@/components/layout/dashboard-layout/dashboard-layout";

import { Customer } from "@/types/customer.types";

type CustomerDetailPageProps = {
  id: string;
};

export function CustomerDetailPage({ id }: CustomerDetailPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);

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
