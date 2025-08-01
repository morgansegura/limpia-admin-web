"use client";

import { useEffect, useState } from "react";
import { TUser } from "@/types/user.types";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserForm } from "./user-form";

export function UserDetailPage({ userId }: { userId: string }) {
  const [user, setUser] = useState<TUser | null>(null);
  const router = useRouter();
  const isNew = userId === "new";

  useEffect(() => {
    if (!isNew) {
      apiFetch<TUser>(`/users/${userId}`).then(setUser);
    }
  }, [userId, isNew]);

  async function handleSubmit(data: Partial<TUser>) {
    try {
      if (isNew) {
        await apiFetch("/users", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("User created");
      } else {
        await apiFetch(`/users/${userId}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        toast.success("User updated");
      }
      router.push("/users");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Something went wrong");
        console.error(err);
      }
    }
  }

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this user?")) {
      await apiFetch(`/users/${userId}`, { method: "DELETE" });
      toast.success("User deleted");
      router.push("/users");
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {isNew ? "New User" : "Edit User"}
        </h2>
        {!isNew && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
      <UserForm initialValues={user} onSubmit={handleSubmit} />
    </div>
  );
}
