import "@/app/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { Topbar } from "@/components/layout/topbar/topbar";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

import { ClerkProvider } from "@clerk/nextjs";

import "./layout.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Limpia Admin",
  description: "Admin panel for Limpia",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "layout-body")}>
        <ClerkProvider>
          <Sidebar />
          <div className="layout">
            <Topbar />
            <main className="layout-main">{children}</main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
