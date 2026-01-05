'use client';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';
import { formatDate } from '@/utils';

export default function ActivitiesPage() {
  const { data } = useDataStore();
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Activities</h1>
      <div className="space-y-2">
        {data.activities.map((act) => (
          <Card key={act.id} title={`${act.type} on ${formatDate(act.createdAt)}`}>
            <div className="text-sm text-slate-700">{act.content}</div>
            <div className="text-xs text-slate-500">Linked to {act.linkedType}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
