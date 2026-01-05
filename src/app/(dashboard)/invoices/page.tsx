import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { InvoiceBoard } from "@/components/invoices/InvoiceBoard";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <InvoiceForm mode="invoice" gstEnabled />
      <InvoiceBoard mode="invoice" />
    </div>
  );
}
