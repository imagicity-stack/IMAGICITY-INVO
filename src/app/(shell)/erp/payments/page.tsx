'use client';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';
import { formatCurrency, formatDate } from '@/utils';

export default function PaymentsPage() {
  const { data } = useDataStore();
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Payments</h1>
      <div className="grid grid-cols-1 gap-3">
        {data.payments.map((pay) => (
          <Card key={pay.id} title={pay.paymentNumber}>
            <div className="flex justify-between text-sm">
              <div>
                <div className="font-semibold">{data.clients.find((c) => c.id === pay.clientId)?.companyName}</div>
                <div className="text-slate-500">Invoice {data.invoices.find((i) => i.id === pay.invoiceId)?.invoiceNumber}</div>
              </div>
              <div className="text-right">
                <div>{formatCurrency(pay.amount)}</div>
                <div className="text-xs text-slate-500">{formatDate(pay.paidAt)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
