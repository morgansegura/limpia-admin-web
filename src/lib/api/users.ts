import { apiFetch } from "@/lib/api";
import type { TUser } from "@/types/user.types";

export function fetchUsers(): Promise<TUser[]> {
  return apiFetch("/users");
}

export function getUserById(id: string): Promise<TUser> {
  return apiFetch(`/users/${id}`);
}

export function createUser(data: Partial<TUser>) {
  return apiFetch<TUser>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUser(id: string, data: Partial<TUser>) {
  return apiFetch<TUser>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: string) {
  return apiFetch(`/users/${id}`, {
    method: "DELETE",
  });
}
