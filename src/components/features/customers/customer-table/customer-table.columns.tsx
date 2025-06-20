import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import type { Customer } from "@/types/customer.types";

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <Link
          href={`/customers/${customer.id}`}
          className="text-blue-600 hover:underline"
        >
          {customer.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "customerSince",
    header: "Member Since",
    cell: ({ row }) =>
      new Date(row.original.customerSince).toLocaleDateString(),
  },
];
