import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'IMVO | Imagicity invoicing & quotations',
  description: 'Modern invoicing, quotations, analytics, and service management for Imagicity.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-brandCharcoal`}>{children}</body>
    </html>
  );
}
