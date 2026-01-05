import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Imagicity Invoicing Suite",
  description: "Industrial-grade invoicing and quotations for Imagicity Marketing Agency",
  icons: {
    icon: [],
    apple: [],
    shortcut: []
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface-muted">
        <AuthProvider>
          <div className="min-h-screen bg-surface-muted text-text-primary">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
