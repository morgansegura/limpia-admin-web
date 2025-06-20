export async function logout() {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  // Optional: manually force reload or reset app state
  window.location.href = "/login";
}
