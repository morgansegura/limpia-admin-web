import { apiFetch } from ".";

export async function loginUser(email: string, password: string) {
  return apiFetch<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
