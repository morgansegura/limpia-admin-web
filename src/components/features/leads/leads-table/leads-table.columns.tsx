import { ColumnDef } from "@tanstack/react-table";

import type { TLead } from "@/types/lead.types";

export const leadColumns: ColumnDef<TLead>[] = [
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
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "customerSince",
    header: "Last Activity at",
    cell: ({ row }) =>
      new Date(row.original.lastActivityAt).toLocaleDateString(),
  },
];
