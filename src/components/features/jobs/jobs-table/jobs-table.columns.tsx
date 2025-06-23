import { ColumnDef } from "@tanstack/react-table";
import type { Job } from "@/types/job.types";

export const jobColumns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-medium ${
            status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : status === "IN_PROGRESS"
              ? "bg-blue-100 text-blue-800"
              : status === "COMPLETED"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "scheduledAt",
    header: "Scheduled",
    cell: ({ row }) =>
      row.original.scheduledDate
        ? new Date(row.original.scheduledDate).toLocaleString()
        : "-",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.original?.price?.toFixed(2) ?? "0.00"}`,
  },
];
