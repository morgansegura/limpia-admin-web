// lib/auth/use-auth.ts
"use client";

import { hasToken } from "@/lib/auth";
import { createContext, useContext, useEffect, useState } from "react";

export type Role =
  | "SUPER_ADMIN"
  | "BRANCH_MANAGER"
  | "SUPPORT_AGENT"
  | "SALES_AGENT"
  | "MARKETER"
  | "TRAINER"
  | "TEAM_MANAGER"
  | "FIELD_WORKER";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId?: string;
  avatarUrl?: string;
}

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = () =>
      document.cookie
        .split(";")
        .some((cookie) => cookie.trim().startsWith("access_token="));

    if (process.env.NODE_ENV === "development") {
      // console.log("[auth] token:", token);
    }

    if (!token) {
      // No token at all — skip fetch
      setUser(null);
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );

        if (res.ok) {
          const data: User = await res.json();
          setUser(data);
        } else {
          setUser(null); // unauthenticated
        }
      } catch {
        setUser(null); // silent fail
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
