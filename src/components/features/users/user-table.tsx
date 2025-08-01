"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";

import { TUser } from "@/types/user.types";
import { ColumnDef } from "@tanstack/react-table";

export function UserTable({ users }: { users: TUser[] }) {
  const router = useRouter();

  const columns: ColumnDef<TUser>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      rowOnClick={(user: TUser) => router.push(`/users/${user.id}`)}
    />
  );
}
