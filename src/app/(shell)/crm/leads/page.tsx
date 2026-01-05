'use client';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';
import { formatDate } from '@/utils';

export default function LeadsPage() {
  const { data } = useDataStore();
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Leads</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.leads.map((lead) => (
          <Card key={lead.id} title={lead.name} actions={<span className="text-xs text-slate-500">{lead.status}</span>}>
            <div className="text-sm text-slate-700">{lead.contactEmail}</div>
            <div className="text-xs text-slate-500">Source: {lead.source} · Owner: {lead.ownerName}</div>
            <div className="text-xs text-slate-500">Created {formatDate(lead.createdAt)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
