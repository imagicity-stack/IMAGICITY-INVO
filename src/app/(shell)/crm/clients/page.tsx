'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, ClientInput } from '@/domain/schemas';
import { useDataStore } from '@/data/repos/local/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils';

export default function ClientsPage() {
  const { data, upsertClient } = useDataStore();
  const form = useForm<ClientInput>({ resolver: zodResolver(clientSchema), defaultValues: { billingAddress: {}, defaultPaymentTermsDays: 15 } });

  const onSubmit = (values: ClientInput) => {
    upsertClient(values);
    form.reset({ billingAddress: {}, defaultPaymentTermsDays: 15 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="New Client">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <input {...form.register('name')} placeholder="Contact Name" className="w-full border rounded px-3 py-2 text-sm" />
          <input {...form.register('companyName')} placeholder="Company" className="w-full border rounded px-3 py-2 text-sm" />
          <input {...form.register('email')} placeholder="Email" className="w-full border rounded px-3 py-2 text-sm" />
          <input {...form.register('phone')} placeholder="Phone" className="w-full border rounded px-3 py-2 text-sm" />
          <input {...form.register('billingAddress.line1')} placeholder="Billing line 1" className="w-full border rounded px-3 py-2 text-sm" />
          <input type="number" {...form.register('defaultPaymentTermsDays', { valueAsNumber: true })} placeholder="Payment terms days" className="w-full border rounded px-3 py-2 text-sm" />
          <textarea {...form.register('notes')} placeholder="Notes" className="w-full border rounded px-3 py-2 text-sm" />
          <Button type="submit" className="w-full">Save Client</Button>
        </form>
      </Card>
      <div className="lg:col-span-2 space-y-3">
        {data.clients.map((client) => (
          <Card key={client.id} title={client.companyName}>
            <div className="flex justify-between text-sm">
              <div>
                <div className="font-semibold text-slate-800">{client.name}</div>
                <div className="text-slate-500">{client.email} · {client.phone}</div>
                <div className="text-xs text-slate-500">Payment terms: {client.defaultPaymentTermsDays} days</div>
              </div>
              <div className="text-right text-xs">
                <div>Lifetime billed: {formatCurrency(client.lifetimeBilled || 0)}</div>
                <div>Paid: {formatCurrency(client.lifetimePaid || 0)}</div>
                <div className="text-amber-600">Outstanding: {formatCurrency(client.outstanding || 0)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
