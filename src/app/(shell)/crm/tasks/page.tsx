'use client';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';
import { formatDate } from '@/utils';

export default function TasksPage() {
  const { data } = useDataStore();
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Tasks & Follow ups</h1>
      <div className="space-y-2">
        {data.tasks.map((task) => (
          <Card key={task.id} title={task.title} actions={<span className="text-xs text-slate-500">{task.status}</span>}>
            <div className="text-sm text-slate-700">Due {formatDate(task.dueAt)} · Priority {task.priority}</div>
            <div className="text-xs text-slate-500">Linked to {task.linkedType}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
