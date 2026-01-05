import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IMAGICITY OS',
  description: 'CRM + ERP for IMAGICITY agency',
  icons: {
    icon: '/svg/logo.svg'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
