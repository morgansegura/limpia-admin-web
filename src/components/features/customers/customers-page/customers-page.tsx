"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { apiFetch } from "@/lib/api";

import { CustomerTable } from "@/components/features/customers/customer-table/customer-table";
import { DashboardLayout } from "@/components/layout/dashboard-layout/dashboard-layout";

import "./customers-page.css";

import type { Customer } from "@/types/customer.types";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const router = useRouter();

  const fetchCustomers = async () => {
    const data = await apiFetch<Customer[]>(
      "/customers",
      {},
      { throwOnError: false },
    );
    if (data) setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAdd = () => {
    router.push("/customers/new");
  };

  return (
    <DashboardLayout>
      <div className="customers-page">
        <div className="dashboard-header-toolbar">
          <h2 className="dashboard-layout-title">Customers</h2>
          <Button onClick={handleAdd}>
            <Plus className="customers-page-icon" />
            Add Customer
          </Button>
        </div>

        <div className="py-6 px-4 lg:px-6">
          <CustomerTable
            customers={customers}
            onView={(id) => router.push(`/customers/${id}`)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
