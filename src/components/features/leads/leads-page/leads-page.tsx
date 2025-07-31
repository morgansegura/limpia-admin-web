"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { apiFetch } from "@/lib/api";

import { CustomerTable } from "@/components/features/customers/customer-table/customer-table";
import { DashboardLayout } from "@/components/dashboard/dashboard";

import "./leads-page.css";

import type { TCustomer } from "@/types/customer.types";
import { HeaderToolbar } from "@/components/dashboard/dashboard-header/header-toolbar/header-toolbar";
import { Separator } from "@/components/ui/separator";

export function LeadsPage() {
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const router = useRouter();

  const fetchLeads = async () => {
    const data = await apiFetch<TCustomer[]>(
      "/leads",
      {},
      { throwOnError: false },
    );
    if (data) setCustomers(data);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAdd = () => {
    router.push("/leads/new");
  };

  return (
    <DashboardLayout>
      <div className="customers-page">
        <HeaderToolbar>
          <h2 className="title">Leads</h2>
          <Button
            size="sm"
            variant="outline"
            className="bg-card"
            onClick={handleAdd}
          >
            <Plus />
            Add Lead
          </Button>
        </HeaderToolbar>
        <Separator />

        <div className="py-6 px-4 lg:px-6">
          <CustomerTable
            customers={customers}
            onView={(id) => router.push(`/leads/${id}`)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
