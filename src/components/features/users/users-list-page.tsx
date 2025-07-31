"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

import { Button } from "@/components/ui/button";

import { UserTable } from "./user-table";

import type { TUser } from "@/types/user.types";

export function UserListPage() {
  const [users, setUsers] = useState<TUser[]>([]);
  const router = useRouter();

  useEffect(() => {
    apiFetch<TUser[]>("/users").then(setUsers);
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Users</h2>
        <Button onClick={() => router.push("/users/new")}>New User</Button>
      </div>
      <UserTable users={users} />
    </div>
  );
}
