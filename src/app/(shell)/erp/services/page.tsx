'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, ServiceInput } from '@/domain/schemas';
import { useDataStore } from '@/data/repos/local/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils';

export default function ServicesPage() {
  const { data, upsertService } = useDataStore();
  const form = useForm<ServiceInput>({ resolver: zodResolver(serviceSchema), defaultValues: { gstRatePercent: 18, unitType: 'Project', defaultRate: 0 } });

  const onSubmit = (values: ServiceInput) => {
    upsertService(values);
    form.reset({ gstRatePercent: 18, unitType: 'Project', defaultRate: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="New Service">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <input {...form.register('name')} placeholder="Service Name" className="w-full border rounded px-3 py-2 text-sm" />
          <select {...form.register('unitType')} className="w-full border rounded px-3 py-2 text-sm">
            <option value="Project">Project</option>
            <option value="Month">Month</option>
            <option value="Hour">Hour</option>
            <option value="Quantity">Quantity</option>
          </select>
          <input type="number" {...form.register('defaultRate', { valueAsNumber: true })} placeholder="Default Rate" className="w-full border rounded px-3 py-2 text-sm" />
          <input type="number" {...form.register('gstRatePercent', { valueAsNumber: true })} placeholder="GST %" className="w-full border rounded px-3 py-2 text-sm" />
          <textarea {...form.register('description')} placeholder="Description" className="w-full border rounded px-3 py-2 text-sm" />
          <Button type="submit" className="w-full">Save Service</Button>
        </form>
      </Card>
      <div className="lg:col-span-2 space-y-3">
        {data.services.map((service) => (
          <Card key={service.id} title={service.name}>
            <div className="flex justify-between text-sm">
              <div className="text-slate-600">{service.description || '—'}</div>
              <div className="text-right">
                <div>{formatCurrency(service.defaultRate)}</div>
                <div className="text-xs text-slate-500">{service.unitType} · GST {service.gstRatePercent}%</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
