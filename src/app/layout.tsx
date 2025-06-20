import "@/app/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProtectedLayout } from "@/components/layout/protected-layout/protected-layout";

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
        <ProtectedLayout>{children}</ProtectedLayout>
      </body>
    </html>
  );
}
