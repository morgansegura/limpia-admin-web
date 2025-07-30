"use client";

import { useEffect, useState } from "react";
import { getLeadById } from "@/lib/api/leads";
import { LeadDetail } from "./lead-detail";
import { DashboardLayout } from "@/components/dashboard/dashboard";

import { Customer } from "@/types/customer.types";

type CustomerDetailPageProps = {
  id: string;
};

export function CustomerDetailPage({ id }: CustomerDetailPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getLeadById(id);
      setCustomer(data);
    }
    load();
  }, [id]);

  if (!customer) return;

  return (
    <DashboardLayout>
      <LeadDetail customer={customer} />
    </DashboardLayout>
  );
}
