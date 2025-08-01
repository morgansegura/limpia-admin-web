import { TUser } from "@/types/user.types";
import { apiFetch } from ".";

// POST /auth/login
export async function loginUser(email: string, password: string) {
  await apiFetch<{ message: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
}

// POST /auth/logout
export async function logoutUser(): Promise<void> {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

// GET /auth/me
export async function currentUser(): Promise<TUser | null> {
  return apiFetch<TUser>(
    "/users/me",
    { credentials: "include" },
    { throwOnError: false },
  );
}

// POST /auth/request-password-reset
export async function requestResetPassword(email: string) {
  await apiFetch<{ email: string }>("/auth/request-password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

// POST /auth/reset-password
export async function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
}
