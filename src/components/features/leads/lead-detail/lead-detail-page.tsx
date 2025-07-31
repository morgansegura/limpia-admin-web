"use client";

import { useEffect, useState } from "react";

import { getLeadById } from "@/lib/api/leads";

import { LeadDetail } from "./lead-detail";
import { DashboardLayout } from "@/components/dashboard/dashboard";

import type { TLead } from "@/types/lead.types";

type LeadDetailPageProps = {
  id: string;
};

export function LeadDetailPage({ id }: LeadDetailPageProps) {
  const [lead, setLead] = useState<TLead | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getLeadById(id);
      setLead(data);
    }
    load();
  }, [id]);

  if (!lead) return;

  return (
    <DashboardLayout>
      <LeadDetail customer={lead} />
    </DashboardLayout>
  );
}
