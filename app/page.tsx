"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { BillingForm } from "@/components/invoices/BillingForm";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/providers/AuthProvider";
import { getClientServices } from "@/lib/firebase/client";
import { BillingDocument } from "@/lib/types";
import { LogoUploader } from "@/components/LogoUploader";

export default function Home() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const { db } = getClientServices();
  const [docs, setDocs] = useState<BillingDocument[]>([]);

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push("/login");
    }
  }, [loading, router, role, user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "documents"), (snap) => {
      setDocs(
        snap.docs.map((d) => {
          const data = d.data() as BillingDocument;
          return { ...data, id: d.id };
        })
      );
    });
    return unsub;
  }, [db, user]);

  const stats = useMemo(() => {
    const invoices = docs.filter((d) => d.kind === "invoice");
    const openValue = invoices.filter((i) => i.status === "open").reduce((sum, i) => sum + (i.total ?? 0), 0);
    const paidValue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + (i.total ?? 0), 0);
    return {
      invoices: invoices.length,
      quotes: docs.filter((d) => d.kind === "quotation").length,
      openValue,
      paidValue,
    };
  }, [docs]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8">
        <section className="rounded-3xl border border-red-100 bg-white/90 p-8 shadow-xl shadow-red-100">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs uppercase tracking-widest text-red-500">Imagicity marketing agency</p>
              <h1 className="text-3xl font-bold text-[var(--primary)]">Industrial-grade billing cockpit</h1>
              <p className="text-gray-700">
                Create GST-ready quotations and invoices with immutable finalize states, paid tracking, void audits,
                and Storage-backed branding. Server-side PDFs keep the paper trail clean for every campaign.
              </p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-red-700">
                <span className="rounded-full bg-red-50 px-3 py-1">Draft → Open → Paid flow</span>
                <span className="rounded-full bg-yellow-100 px-3 py-1">GST Rule 46 fields</span>
                <span className="rounded-full bg-red-100 px-3 py-1">Admin gated via Firestore role</span>
              </div>
            </div>
            <div className="w-full max-w-sm space-y-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-yellow-900">Live health</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase text-yellow-600">Invoices</p>
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.invoices}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-yellow-600">Quotations</p>
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.quotes}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-yellow-600">Open value</p>
                  <p className="text-xl font-bold text-[var(--primary)]">₹{stats.openValue.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-yellow-600">Paid value</p>
                  <p className="text-xl font-bold text-[var(--primary)]">₹{stats.paidValue.toFixed(0)}</p>
                </div>
              </div>
              <LogoUploader />
            </div>
          </div>
        </section>

        <section id="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700">Invoices</p>
              <p className="text-xs text-gray-600">Draft safely, finalize immutably, mark paid, or void with a paper trail.</p>
            </div>
          </div>
          <BillingForm kind="invoice" />
        </section>

        <section id="quotes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700">Quotations</p>
              <p className="text-xs text-gray-600">Create offers that can be promoted to invoices once approved.</p>
            </div>
          </div>
          <BillingForm kind="quotation" />
        </section>

        <Card title="Operational guardrails">
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-3 text-sm text-gray-700">
            <li>✅ Firebase Email/Password login with Firestore role document (no hardcoded UID).</li>
              <li>✅ Immutable finalize: finalized documents switch to open status and are actioned via status buttons only.</li>
            <li>✅ GST optionality toggled per document with explicit place-of-supply capture.</li>
            <li>✅ Storage-backed branding and attachment channel via Firebase Storage uploads.</li>
            <li>✅ Server-side PDF endpoint `/api/documents/[id]/pdf` for regulatory-grade exports.</li>
            <li>✅ Red/yellow/white UI with micro-animations for actions.</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
