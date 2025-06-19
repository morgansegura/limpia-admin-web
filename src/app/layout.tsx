import "@/app/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { headers } from "next/headers";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { Topbar } from "@/components/layout/topbar/topbar";

import "./layout.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Limpia Admin",
  description: "Admin panel for Limpia",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = (await headers()).get("x-next-url") || "";

  const isAuthPage = pathname.startsWith("/sign-in");

  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <div className="layout-body">
          <Sidebar />
          <div className="layout">
            <Topbar />
            <main className="layout-main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
