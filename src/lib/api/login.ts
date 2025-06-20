import { apiFetch } from ".";

export async function loginUser(email: string, password: string) {
  return apiFetch<{ access_token: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
}
