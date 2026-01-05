import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { InvoiceBoard } from "@/components/invoices/InvoiceBoard";

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <InvoiceForm mode="quotation" gstEnabled={false} />
      <InvoiceBoard mode="quotation" />
    </div>
  );
}
