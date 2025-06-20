import { apiFetch } from ".";

export async function logout() {
  await apiFetch<{ message: string }>(`/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  // Optional: manually force reload or reset app state
  window.location.href = "/login";
}
