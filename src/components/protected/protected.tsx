"use client";

import { useEffect } from "react";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading]);

  if (loading || !user) return null;

  return <>{children}</>;
}
