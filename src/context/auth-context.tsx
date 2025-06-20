// lib/auth/use-auth.ts
"use client";

import { currentUser } from "@/lib/api/current-user";
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
    async function fetchUser() {
      const user = await currentUser();

      setUser(user);
      setLoading(false);
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
