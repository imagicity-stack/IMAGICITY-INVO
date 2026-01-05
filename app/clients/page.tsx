'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ClientTable from '../../components/clients/ClientTable';
import { archiveClient, fetchClients, restoreClient } from '../../lib/clients/clientService';
import { Client, clientStatusOptions } from '../../lib/clients/clientTypes';

export const dynamic = 'force-dynamic';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('All');
  const [includeArchived, setIncludeArchived] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClients({ status, includeArchived, search });
      setClients(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, includeArchived, search]);

  const statusOptions = useMemo(() => ['All', ...clientStatusOptions], []);

  const handleArchive = async (client: Client) => {
    await archiveClient(client.id);
    loadClients();
  };

  const handleRestore = async (client: Client) => {
    await restoreClient(client.id);
    loadClients();
  };

  const handleSelect = (client: Client) => {
    router.push(`/clients/${client.id}`);
  };

  const handleEdit = (client: Client) => {
    router.push(`/clients/${client.id}/edit`);
  };

  const activeCount = clients.filter((c) => !c.isArchived && c.status === 'Active').length;
  const archivedCount = clients.filter((c) => c.isArchived).length;
  const totalCount = clients.length;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-lg">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_25%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
              CRM · Firestore
            </div>
            <h1 className="text-4xl font-semibold">Clients</h1>
            <p className="max-w-2xl text-sm text-slate-200">
              Keep every client organized with fast search, status filters, and inline actions. Add new records or update existing ones without leaving this workspace.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-200/90">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">Active · {activeCount}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">Archived · {archivedCount}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">Total · {totalCount}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadClients}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Refresh
            </button>
            <Link
              href="/clients/new"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white"
            >
              <span className="text-lg">＋</span>
              Add Client
            </Link>
          </div>
        </div>
      </div>

      <div className="card space-y-4 bg-white/80 backdrop-blur">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search legal name, brand, email, phone"
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-gray-400">⌕</span>
            </div>
          </div>
          <div className="min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
            <input
              id="archived-toggle"
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="archived-toggle" className="text-sm font-medium text-gray-700">
              Show archived
            </label>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <ClientTable
          clients={clients}
          loading={loading}
          onSelect={handleSelect}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onRestore={handleRestore}
        />
      </div>
    </div>
  );
}
