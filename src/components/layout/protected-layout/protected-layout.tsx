"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { Topbar } from "@/components/layout/topbar/topbar";
import { useAuth } from "@/context/auth-context";

const PUBLIC_PATHS = ["/login", "/reset-password"];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/reset-password")) return true;
  return PUBLIC_PATHS.includes(pathname);
}

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isPublic = isPublicPath(pathname);
  const hasResetToken = searchParams.has("token");

  useEffect(() => {
    if (loading) return;

    // ✅ If user is not logged in and on a protected route, redirect to login
    if (!user && !isPublic) {
      router.replace("/login");
    }

    // ✅ If user is logged in and on login/reset, redirect to dashboard
    if (user && pathname === "/login") {
      router.replace("/dashboard");
    }

    if (user && pathname.startsWith("/reset-password")) {
      router.replace("/dashboard");
    }

    // ✅ If NOT logged in and /reset-password has no token, redirect to login
    if (!user && pathname.startsWith("/reset-password") && !hasResetToken) {
      router.replace("/login");
    }
  }, [user, loading, pathname, hasResetToken]);

  if (loading) return null;

  const showLayout = user && !isPublic;

  return showLayout ? (
    <div className="layout-body">
      <Sidebar />
      <div className="layout">
        <Topbar />
        <main className="layout-main">{children}</main>
      </div>
    </div>
  ) : (
    <>{children}</>
  );
}
