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
  refetchUser: () => Promise<void>;
}>({ user: null, loading: true, refetchUser: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await currentUser();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
