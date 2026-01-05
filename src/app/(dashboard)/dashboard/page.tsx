"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { TopNav } from "@/components/layout/TopNav";
import { useAuth } from "@/components/providers/AuthProvider";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { BrandSettings } from "@/components/settings/BrandSettings";
import { DocumentRecord } from "@/types/documents";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, role } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapped = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as DocumentRecord) }));
      setDocuments(mapped);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const resolveBrand = async () => {
      const snapshot = await getDoc(doc(db, "branding", "global"));
      const data = snapshot.data();
      if (data?.logoUrl) setBrandLogoUrl(data.logoUrl as string);
    };
    resolveBrand();
  }, []);

  const summary = useMemo(() => {
    const totalValue = documents.reduce((sum, doc) => (doc.status !== "void" ? sum + doc.total : sum), 0);
    const drafts = documents.filter((doc) => doc.status === "draft").length;
    const open = documents.filter((doc) => doc.status === "open").length;
    const paid = documents.filter((doc) => doc.status === "paid").length;
    return { totalValue, drafts, open, paid };
  }, [documents]);

  if (!user || loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--background)]">
        <div className="animate-pulse rounded-2xl bg-[color:var(--card)] px-6 py-4 text-sm font-semibold text-neutral-700">
          Preparing Imagicity cockpit...
        </div>
      </main>
    );
  }

  if (role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--background)] p-6">
        <div className="card-surface max-w-xl rounded-3xl p-8 text-center text-sm text-neutral-800">
          <p className="text-lg font-bold text-[color:var(--brand-red)]">Insufficient permissions</p>
          <p className="mt-2">Your Firestore user role must be &quot;admin&quot; to access the invoicing workspace.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[color:var(--background)] pb-12">
      <TopNav />
      <section className="mx-auto max-w-6xl space-y-6 px-4 pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card-surface rounded-2xl p-4 shadow-lg">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Gross billed</p>
            <p className="text-3xl font-black text-[color:var(--brand-red)]">₹{summary.totalValue.toLocaleString("en-IN")}</p>
            <p className="text-sm text-neutral-700">Excludes voided documents. Paid + open combined.</p>
          </div>
          <div className="card-surface rounded-2xl p-4 shadow-lg">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Open</p>
            <p className="text-3xl font-black text-[color:var(--brand-red)]">{summary.open}</p>
            <p className="text-sm text-neutral-700">Finalized and awaiting payment.</p>
          </div>
          <div className="card-surface rounded-2xl p-4 shadow-lg">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Paid</p>
            <p className="text-3xl font-black text-[color:var(--brand-red)]">{summary.paid}</p>
            <p className="text-sm text-neutral-700">Closed with immutable audit trail.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <DocumentForm userId={user.uid} onSaved={() => {}} brandLogoUrl={brandLogoUrl} />
          <div className="space-y-4">
            <BrandSettings onLogoChange={setBrandLogoUrl} />
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Workflow</p>
              <h3 className="text-lg font-bold text-[color:var(--brand-red)]">Draft → Finalized → Paid</h3>
              <p className="text-sm text-neutral-700">
                Drafts are editable. Finalized documents are immutable for compliance. Use the Void action to stop work while
                preserving the paper trail.
              </p>
              <p className="mt-3 text-xs font-semibold text-neutral-700">
                GST ready: include Rule 46 details (invoice number, date, GSTIN, HSN/SAC, place of supply, tax breakdown) before
                finalization.
              </p>
            </div>
          </div>
        </div>

        <DocumentTable documents={documents} />
      </section>
    </main>
  );
}
