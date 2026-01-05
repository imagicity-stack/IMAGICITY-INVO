'use client';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';

export default function Page() {
  const { data } = useDataStore();
  const label = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';
  const map: Record<string, keyof typeof data> = {
    proposals: 'proposals',
    projects: 'projects',
    expenses: 'expenses',
    tickets: 'tickets',
    retainers: 'retainers',
  };
  const key = map[label || ''] || 'proposals';
  // @ts-ignore
  const rows = data[key] as any[];
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold capitalize">{label}</h1>
      {rows.length === 0 && <Card>Empty state — start by adding your first record.</Card>}
      {rows.map((row, idx) => (
        <Card key={idx}>
          <pre className="text-xs text-slate-600">{JSON.stringify(row, null, 2)}</pre>
        </Card>
      ))}
    </div>
  );
}
