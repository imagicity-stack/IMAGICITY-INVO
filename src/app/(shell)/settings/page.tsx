'use client';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/data/repos/local/store';

export default function SettingsPage() {
  const { data } = useDataStore();
  const s = data.settings;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Settings</h1>
      <Card title="Organization">
        <div className="text-sm text-slate-700">{s.companyName}</div>
        <div className="text-sm text-slate-500">Invoice prefix: {s.invoicePrefix}</div>
        <div className="text-sm text-slate-500">Quote prefix: {s.quotePrefix}</div>
        <div className="text-sm text-slate-500">UPI: {s.upiId}</div>
      </Card>
      <Card title="Future Auth Plan">
        <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
          <li>Roles: Admin, Sales, Accounts, PM, Viewer</li>
          <li>Later: multi-workspace model with organization + members</li>
          <li>Plan: add Firebase Auth and guard routes with role-based access</li>
        </ul>
      </Card>
    </div>
  );
}
