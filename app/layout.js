import '../styles/globals.css';
import React from 'react';
import ServiceWorkerRegister from '../components/ServiceWorkerRegister';

export const metadata = {
  title: 'IMAGICITY Invo',
  description: 'Progressive web experience for managing invoices and clients.',
  applicationName: 'IMAGICITY Invo',
  manifest: '/manifest.webmanifest',
  themeColor: '#0f172a',
  icons: {
    icon: '/imvo.png',
    shortcut: '/imvo.png',
    apple: '/imvo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
