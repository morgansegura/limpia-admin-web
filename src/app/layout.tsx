import "@/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/auth-context";

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
  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <AuthProvider>
          <div className="layout-body">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
