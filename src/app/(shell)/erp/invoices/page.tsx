'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';
import { formatCurrency, formatDate } from '@/utils';
import { Button } from '@/components/ui/button';

export default function InvoicesPage() {
  const { data } = useDataStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invoices</h1>
        <Button>New Invoice</Button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {data.invoices.map((inv) => (
          <Card key={inv.id} title={inv.invoiceNumber} actions={<span className="text-xs text-slate-500">{inv.status}</span>}>
            <div className="flex justify-between text-sm">
              <div>
                <div className="font-semibold">{data.clients.find((c) => c.id === inv.clientId)?.companyName}</div>
                <div className="text-slate-500">Issue {formatDate(inv.issueDate)} · Due {formatDate(inv.dueDate)}</div>
              </div>
              <div className="text-right">
                <div>{formatCurrency(inv.grandTotal)}</div>
                <div className="text-amber-600 text-xs">Balance {formatCurrency(inv.balanceDue)}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-2">Items: {inv.items.map((i) => i.title).join(', ')}</div>
            <Link href={`/erp/invoices/${inv.id}`} className="text-brand-700 text-sm">Open</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
