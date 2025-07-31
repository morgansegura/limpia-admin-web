import { ColumnDef } from "@tanstack/react-table";
import type { TLead } from "@/types/lead.types";

export const leadColumns: ColumnDef<TLead>[] = [
  {
    header: "Name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: "fullName",
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
    accessorKey: "lastActivityAt",
    header: "Last Activity",
    cell: ({ row }) =>
      row.original.lastActivityAt
        ? new Date(row.original.lastActivityAt).toLocaleDateString()
        : "—",
  },
];
