import { apiFetch } from ".";

export async function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}
