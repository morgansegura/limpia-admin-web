"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@/context/auth-context";

import { Plus, Pencil, Eye } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

import "./customers.css";

import type { Customer } from "@/types/customer.types";
import { CustomerTable } from "@/components/features/customer/customer-table/customer-table";
import { CustomerForm } from "@/components/features/customer/customer-form/customer-form";
import { Protected } from "@/components/protected/protected";
import { ROLES } from "@/constants/roles";

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
    <Protected allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER]}>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Customers</h1>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
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
    </Protected>
  );
}
