"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { Topbar } from "@/components/layout/topbar/topbar";

const AUTH_ROUTES = ["/login"];

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const isAuthPage = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    const token = getToken();
    const isLoggedIn = !!token;

    if (!isLoggedIn && !isAuthPage) {
      router.replace("/login");
    }

    setLoading(false);
  }, [pathname]);

  if (loading) return null;

  const isLoggedIn = !!getToken();

  return isLoggedIn && !isAuthPage ? (
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
