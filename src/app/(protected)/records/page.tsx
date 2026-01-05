import { DocumentForm } from "@/components/documents/DocumentForm";
import { DocumentList } from "@/components/documents/DocumentList";

export default function RecordsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">Documents</p>
        <h1 className="text-3xl font-bold text-text-primary">Invoices & Quotations</h1>
        <p className="text-sm text-text-secondary">
          Includes GST Rule 46 fields, HSN/SAC, discounts, additional charges, and round-off controls. Switch between GST and non-GST easily.
        </p>
      </div>
      <DocumentForm />
      <DocumentList />
    </div>
  );
}
