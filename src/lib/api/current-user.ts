import { User } from "@/context/auth-context";
import { apiFetch } from ".";

export async function currentUser() {
  return await apiFetch<User>(
    "/users/me",
    { credentials: "include" },
    { throwOnError: false },
  );
}
