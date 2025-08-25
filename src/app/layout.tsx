import type { Metadata } from "next";
import { Figtree } from "next/font/google";

import "./globals.css";

import { Providers } from "@/components/providers";
import { AppLayout } from "@/components/layout/app-layout";

const sans = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Limpia Dashboard - Business Management Platform",
  description: "Comprehensive cleaning service management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.className} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
