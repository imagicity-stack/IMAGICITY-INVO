import { StatCard } from "@/components/ui/StatCard";
import { DocumentList } from "@/components/documents/DocumentList";
import { CustomerForm } from "@/components/clients/CustomerForm";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { UploadCard } from "@/components/ui/UploadCard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">Imagicity Finance HQ</p>
          <h1 className="text-3xl font-bold text-text-primary">Industrial-grade Invoicing</h1>
          <p className="text-sm text-text-secondary">Role-gated via Firestore user profiles with GST-ready documents.</p>
        </div>
        <div className="flex gap-3">
          <span className="px-4 py-2 rounded-full bg-brand-yellow/40 text-brand-red font-semibold">GST compliant</span>
          <span className="px-4 py-2 rounded-full bg-brand-red text-white font-semibold">Admin only</span>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <StatCard title="Invoice drafts" value="Live" hint="Generate and track GST-ready invoices" />
        <StatCard title="Quotations" value="Dynamic" hint="Win deals with well-structured quotes" color="yellow" />
        <StatCard title="Attachments" value="Storage-ready" hint="Upload proofs, POs and creatives" />
      </section>

      <section className="grid xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <CustomerForm />
          <UploadCard />
        </div>
        <div className="xl:col-span-3 space-y-6">
          <DocumentForm />
        </div>
      </section>

      <DocumentList />
    </div>
  );
}
