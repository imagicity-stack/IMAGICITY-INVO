"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const { user, role } = useAuth();

  return (
    <main className="flex min-h-screen flex-col justify-center bg-[color:var(--background)] px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Imagicity marketing agency</p>
          <h1 className="text-4xl font-black leading-tight text-[color:var(--brand-red)] lg:text-5xl">
            Red, yellow, white. Built for audit-proof invoicing and quotations.
          </h1>
          <p className="text-lg text-neutral-700">
            Draft invoices, finalize without edits, collect GST-ready PDFs, and keep voided records to satisfy Indian Rule 46.
            Firebase auth + Firestore + Storage power the single admin workspace.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-[color:var(--brand-red)] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:translate-y-[-1px]"
            >
              {user && role === "admin" ? "Enter dashboard" : "Login as admin"}
            </Link>
            <Link
              href="#features"
              className="rounded-full border border-[color:var(--brand-red)] px-5 py-3 text-sm font-bold text-[color:var(--brand-red)] transition hover:bg-[color:var(--brand-yellow)]"
            >
              View capabilities
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm" id="features">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Compliance</p>
              <p className="text-neutral-800">GST optional toggle, Rule 46 fields, immutable finalized docs, voided trail.</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Automation</p>
              <p className="text-neutral-800">Server-side PDFs via Puppeteer, storage-backed logos, real-time Firestore pipeline.</p>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Status</p>
              <p className="text-2xl font-black text-[color:var(--brand-red)]">Role aware</p>
              <p className="text-sm text-neutral-700">Only Firestore role &quot;admin&quot; can access. No UID hardcoding.</p>
            </div>
            <div className="rounded-full bg-[color:var(--brand-yellow)] px-4 py-2 text-xs font-bold text-neutral-900">
              {user ? "Authenticated" : "Login required"}
            </div>
          </div>
          <div className="rounded-2xl bg-[color:var(--card)] p-4 text-sm text-neutral-800">
            <p className="font-semibold text-neutral-900">Workflow</p>
            <p>Draft → Finalized/Open → Paid. Finalized docs are immutable; void maintains the paper trail.</p>
            <p className="mt-2">Generate GST-inclusive PDFs on the server without exposing private tokens.</p>
          </div>
          <ul className="space-y-2 text-sm text-neutral-800">
            <li>• Next.js App Router + TypeScript + Tailwind CSS</li>
            <li>• Firebase Auth + Firestore + Storage (single admin user)</li>
            <li>• Puppeteer server route for PDF exports</li>
            <li>• Deployed on Vercel with red, yellow, and white palette</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
