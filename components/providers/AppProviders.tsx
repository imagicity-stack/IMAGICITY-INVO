"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";

const requiredPublicEnvKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

export function AppProviders({ children }: { children: ReactNode }) {
  const missing = requiredPublicEnvKeys.filter((key) => !process.env[key]);

  if (missing.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-50 px-6 py-10 text-sm text-red-800">
        <div className="max-w-xl space-y-3 rounded-2xl border border-red-200 bg-white p-6 shadow-lg shadow-red-100">
          <p className="text-xs uppercase tracking-widest text-red-500">Environment required</p>
          <p className="text-base font-semibold text-[var(--primary)]">
            Firebase configuration missing in deployment environment.
          </p>
          <p className="text-gray-700">
            Add the following variables in Vercel (or your runtime) and redeploy to enable authentication, Firestore, and
            Storage initialization:
          </p>
          <ul className="grid grid-cols-1 gap-1 rounded-lg bg-red-50 p-3 font-mono text-xs text-red-700">
            {missing.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
          <p className="text-gray-700">
            Server-side features (PDF export, admin SDK calls) also need <code>FIREBASE_PROJECT_ID</code>,
            <code>FIREBASE_CLIENT_EMAIL</code>, and <code>FIREBASE_PRIVATE_KEY</code> set in the environment, even though
            they are not validated in this client-side banner.
          </p>
          <p className="text-gray-700">After saving the variables, redeploy to remove this safeguard and render the billing experience.</p>
        </div>
      </div>
    );
  }

  return <AuthProvider>{children}</AuthProvider>;
}
