"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

import { CustomerTable } from "@/components/features/customers/customer-table/customer-table";
import { CustomerForm } from "@/components/features/customers/customer-form/customer-form";
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
        <div className="customers-page-title-bar">
          <h1 className="customers-page-title">Customers</h1>
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm
              customer={editingCustomer}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
