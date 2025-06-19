import "@/app/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { Topbar } from "@/components/layout/topbar/topbar";

import { ClerkProvider } from "@clerk/nextjs";

import "./layout.css";
import { headers } from "next/headers";

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
  const { userId } = await auth();

  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <ClerkProvider>
          {userId ? (
            <div className="layout-body">
              <Sidebar />
              <div className="layout">
                <Topbar />
                <main className="layout-main">{children}</main>
              </div>
            </div>
          ) : (
            children
          )}
        </ClerkProvider>
      </body>
    </html>
  );
}
