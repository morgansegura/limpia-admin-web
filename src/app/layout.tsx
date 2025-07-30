import "@/styles/globals.css";

import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";

import "./layout.css";

const sans = Lexend_Deca({ subsets: ["latin"] });

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
      <body className={cn(sans.className)}>
        <AuthProvider>
          <div className="layout-body">{children}</div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
