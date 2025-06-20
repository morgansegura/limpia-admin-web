import { apiFetch } from ".";

export async function requestResetPassword(email: string) {
  await apiFetch<{ email: string }>(`/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}
