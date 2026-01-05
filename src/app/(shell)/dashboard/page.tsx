'use client';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';
import { formatCurrency, formatDate } from '@/utils';
import { SimpleTable } from '@/components/tables/simple-table';
import { ColumnDef } from '@tanstack/react-table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
  const { data } = useDataStore();

  const pipelineValue = data.deals.filter((d) => d.stage !== 'Lost').reduce((sum, d) => sum + d.valueExpected, 0);
  const billedThisMonth = data.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const collectedThisMonth = data.payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = data.invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const overdue = data.invoices.filter((i) => i.status === 'Overdue').reduce((sum, i) => sum + i.balanceDue, 0);

  const invoiceColumns: ColumnDef<typeof data.invoices[number]>[] = [
    { header: 'Invoice', accessorKey: 'invoiceNumber' },
    { header: 'Client', cell: ({ row }) => data.clients.find((c) => c.id === row.original.clientId)?.companyName || '—' },
    { header: 'Issue', cell: ({ row }) => formatDate(row.original.issueDate) },
    { header: 'Total', cell: ({ row }) => formatCurrency(row.original.grandTotal) },
    { header: 'Status', accessorKey: 'status' },
  ];

  const paymentColumns: ColumnDef<typeof data.payments[number]>[] = [
    { header: 'Payment', accessorKey: 'paymentNumber' },
    { header: 'Invoice', cell: ({ row }) => data.invoices.find((i) => i.id === row.original.invoiceId)?.invoiceNumber || '—' },
    { header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    { header: 'Date', cell: ({ row }) => formatDate(row.original.paidAt) },
  ];

  const chartData = [
    { month: 'This Month', billed: billedThisMonth, collected: collectedThisMonth },
  ];

  const outstandingData = [
    { label: '0-15', value: outstanding * 0.4 },
    { label: '16-30', value: outstanding * 0.3 },
    { label: '31-60', value: outstanding * 0.2 },
    { label: '60+', value: outstanding * 0.1 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[{ label: 'Pipeline Value', value: pipelineValue }, { label: 'This Month Billed', value: billedThisMonth }, { label: 'This Month Collected', value: collectedThisMonth }, { label: 'Outstanding', value: outstanding }, { label: 'Overdue', value: overdue }].map((kpi) => (
          <Card key={kpi.label}>
            <div className="text-xs uppercase text-slate-500">{kpi.label}</div>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(kpi.value)}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Billed vs Collected">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="billed" fill="#6366f1" name="Billed" />
                <Bar dataKey="collected" fill="#22c55e" name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Outstanding Aging">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outstandingData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#f97316" name="Outstanding" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Recent Invoices">
          <SimpleTable data={data.invoices.slice(0, 5)} columns={invoiceColumns} />
        </Card>
        <Card title="Recent Payments">
          <SimpleTable data={data.payments.slice(0, 5)} columns={paymentColumns} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card title="Follow ups today">{data.tasks.slice(0, 3).map((t) => <div key={t.id} className="text-sm">{t.title}</div>)}</Card>
        <Card title="Overdue invoices">{data.invoices.filter((i) => i.status === 'Overdue').map((i) => <div key={i.id} className="text-sm">{i.invoiceNumber}</div>)}</Card>
        <Card title="Projects delayed">{data.projects.filter((p) => p.milestones.some((m) => m.status === 'Open')).map((p) => <div key={p.id} className="text-sm">{p.name}</div>)}</Card>
        <Card title="Deals in negotiation">{data.deals.filter((d) => d.stage === 'Negotiation').map((d) => <div key={d.id} className="text-sm">{d.dealName}</div>)}</Card>
      </div>
    </div>
  );
}
