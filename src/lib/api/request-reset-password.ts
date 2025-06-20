export async function requestResetPassword(email: string) {
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-password-reset`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
  );
}
