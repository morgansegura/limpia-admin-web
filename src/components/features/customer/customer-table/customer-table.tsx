"use client";

import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

import type { Customer } from "@/types/customer.types";

type Props = {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onView: (id: string) => void;
};

export function CustomerTable({ customers, onEdit, onView }: Props) {
  if (!customers || customers.length === 0) {
    return <p className="text-muted-foreground">No customers found.</p>;
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left font-semibold">Name</th>
            <th className="p-3 text-left font-semibold">Email</th>
            <th className="p-3 text-left font-semibold">Phone</th>
            <th className="p-3 text-left font-semibold">Status</th>
            <th className="p-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.email}</td>
              <td className="p-3">{c.phone || "-"}</td>
              <td className="p-3">{c.isActive ? "Active" : "Inactive"}</td>
              <td className="p-3 text-right space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onView(c.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onEdit(c)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
