import { ColumnDef } from "@tanstack/react-table";

import type { TCustomer } from "@/types/customer.types";

export const customerColumns: ColumnDef<TCustomer>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
