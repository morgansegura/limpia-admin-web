"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import TypographyH1 from "@/components/typography-h1";

import { apiFetch } from "@/lib/api";

import { CustomerTable } from "@/components/features/customers/customer-table/customer-table";
import { DashboardLayout } from "@/components/layout/dashboard-layout/dashboard-layout";

import "./customers-page.css";

import type { Customer } from "@/types/customer.types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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
    setEditingCustomer(null);
    setOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setOpen(true);
  };

  const handleSuccess = async () => {
    setOpen(false);
    await fetchCustomers();
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

        <CustomerTable
          customers={customers}
          onEdit={handleEdit}
          onView={(id) => router.push(`/customers/${id}`)}
        />
      </div>
    </DashboardLayout>
  );
}
