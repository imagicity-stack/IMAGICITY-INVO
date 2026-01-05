import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/solid";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-70 pointer-events-none gradient-panel" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="badge bg-brand-yellow text-gray-900">Imagicity • Marketing Ops</span>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Industrial-grade invoicing for bold campaigns.
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl">
              Craft GST-ready invoices and quotations with auditable state changes, digital approvals, and brand-consistent
              exports. Built for Imagicity&apos;s precision marketing workflows.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary">
                Launch control panel
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link href="#features" className="btn-secondary">
                View capabilities
              </Link>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ShieldCheckIcon className="h-6 w-6 text-brand-red" />
              Hardened with immutable finals, void logging, and Firestore role gating.
            </div>
          </div>
          <div className="card p-8 shadow-2xl shadow-brand-red/20 border border-brand-red/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Imagicity</p>
                <p className="text-2xl font-semibold text-gray-900">Control Tower</p>
              </div>
              <SparklesIcon className="h-10 w-10 text-brand-yellow" />
            </div>
            <div className="mt-8 space-y-4 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Invoice state machine</span>
                <span className="badge bg-brand-red/10 text-brand-red">Draft → Final → Paid → Void</span>
              </div>
              <div className="grid gap-3 rounded-2xl border border-dashed border-brand-red/30 bg-brand-red/5 p-4">
                <p className="text-sm text-gray-800">
                  Lock finalized documents and keep a ledger of void reasons to preserve audit trails.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-white text-gray-800 border border-brand-red/30">GST-ready layouts</span>
                  <span className="badge bg-white text-gray-800 border border-brand-yellow/60">Digital signatures</span>
                  <span className="badge bg-white text-gray-800 border border-brand-red/30">Firestore backups</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/70 p-4 shadow-inner">
                <div>
                  <p className="text-xs uppercase text-gray-500">Role-gated</p>
                  <p className="font-semibold text-gray-900">Admin-only entry point</p>
                </div>
                <Link href="/login" className="btn-primary">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section id="features" className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {["Immutable finals", "GST compliance", "Quotations + conversions", "Storage-backed proofs", "Audit log", "Client CRM"].map(
              (feature) => (
                <div key={feature} className="card p-5 hover:-translate-y-1 transition-transform">
                  <h3 className="text-base font-semibold text-gray-900">{feature}</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {feature === "GST compliance"
                      ? "Rule 46 fields ready: GSTIN, place of supply, HSN/SAC, tax breakdowns."
                      : feature === "Audit log"
                        ? "Void reasons, state changes, and signer details remain discoverable."
                        : "Speed-focused UI with Imagicity brand colors and actionable dashboards."}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
