'use client';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';
import { formatCurrency, formatDate } from '@/utils';

export default function DealsPage() {
  const { data } = useDataStore();
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Deals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.deals.map((deal) => (
          <Card key={deal.id} title={deal.dealName} actions={<span className="text-xs text-slate-500">{deal.stage}</span>}>
            <div className="text-sm">Value {formatCurrency(deal.valueExpected)} · Prob {deal.probabilityPercent}%</div>
            <div className="text-xs text-slate-500">Expected close {formatDate(deal.expectedCloseAt)}</div>
            <div className="text-xs text-slate-500">Client: {data.clients.find((c) => c.id === deal.clientId)?.companyName || 'TBD'}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
