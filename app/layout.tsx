import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imvo | Imagicity Revenue Office",
  description:
    "GST-ready invoicing and quotation workspace by Imagicity, powered by Firebase and crafted with Next.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="bg-[radial-gradient(circle_at_20%_20%,rgba(216,30,30,0.12),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(245,196,0,0.15),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(15,15,15,0.12),transparent_30%)]">
          {children}
        </div>
      </body>
    </html>
  );
}
