'use client';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';
import { formatCurrency, formatDate } from '@/utils';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const { data } = useDataStore();
  const invoice = data.invoices.find((i) => i.id === id);
  if (!invoice) return <div className="text-sm">Invoice not found.</div>;
  const client = data.clients.find((c) => c.id === invoice.clientId);

  const whatsappText = `Hi ${client?.name || 'Client'}, payment reminder for Invoice ${invoice.invoiceNumber} of Rs ${invoice.balanceDue}. Due date: ${formatDate(invoice.dueDate)}. UPI: ${data.settings.upiId}. Thank you. IMAGICITY`;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">{invoice.invoiceNumber}</h1>
      <Card title="Summary">
        <div className="flex justify-between text-sm">
          <div>
            <div className="font-semibold">{client?.companyName}</div>
            <div className="text-slate-500">Issue {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}</div>
          </div>
          <div className="text-right">
            <div>{formatCurrency(invoice.grandTotal)}</div>
            <div className="text-amber-600 text-xs">Balance {formatCurrency(invoice.balanceDue)}</div>
          </div>
        </div>
      </Card>
      <Card title="Items">
        <ul className="text-sm space-y-1">
          {invoice.items.map((item, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{item.title} × {item.qty}</span>
              <span>{formatCurrency(item.qty * item.unitRate)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Reminder">
        <div className="text-sm">WhatsApp template:</div>
        <textarea readOnly className="w-full border rounded px-3 py-2 text-sm mt-2" value={whatsappText} />
        <button className="mt-2 text-brand-700 text-sm" onClick={() => navigator.clipboard.writeText(whatsappText)}>Copy text</button>
      </Card>
    </div>
  );
}
