import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Imagicity Billing Platform",
  description: "Industrial-grade invoicing, quotations, and GST-ready billing for Imagicity.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="gradient-overlay fixed inset-0 -z-10 opacity-70" />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
