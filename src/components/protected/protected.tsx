"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { Role } from "@/constants/roles";

export type ProtectedProps = {
  children: React.ReactNode;
  allowedRoles?: Role[];
};

export function Protected({ children, allowedRoles }: ProtectedProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isUnauthorized =
    !loading && (!user || (allowedRoles && !allowedRoles.includes(user.role)));

  useEffect(() => {
    if (isUnauthorized) {
      router.replace("/login");
    }
  }, [isUnauthorized, router]);

  if (loading || isUnauthorized) return null;

  return <>{children}</>;
}
