'use client';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';
import { formatCurrency } from '@/utils';

export default function ReportsPage() {
  const { data } = useDataStore();
  const salesByMonth = data.invoices.map((inv) => ({ label: inv.invoiceNumber, billed: inv.grandTotal, collected: data.payments.filter((p) => p.invoiceId === inv.id).reduce((s, p) => s + p.amount, 0) }));
  const outstanding = data.invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const clientWise = data.clients.map((c) => ({ client: c.companyName, billed: data.invoices.filter((i) => i.clientId === c.id).reduce((s, i) => s + i.grandTotal, 0) }));

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Reports</h1>
      <Card title="Sales by Invoice">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {salesByMonth.map((row) => (
            <div key={row.label} className="p-3 border rounded-lg">
              <div className="font-semibold">{row.label}</div>
              <div>Billed: {formatCurrency(row.billed)}</div>
              <div>Collected: {formatCurrency(row.collected)}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Outstanding">Total outstanding: {formatCurrency(outstanding)}</Card>
      <Card title="Client wise revenue">
        <div className="space-y-2 text-sm">
          {clientWise.map((row) => (
            <div key={row.client} className="flex justify-between border-b pb-1">
              <div>{row.client}</div>
              <div>{formatCurrency(row.billed)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
