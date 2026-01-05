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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-600">Manage all client records with Firestore-backed storage.</p>
        </div>
        <Link
          href="/clients/new"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
        >
          Add Client
        </Link>
      </div>

      <div className="card flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search legal name, brand, email, phone"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="archived-toggle"
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="archived-toggle" className="text-sm font-medium text-gray-700">
            Show archived
          </label>
        </div>
        <button
          type="button"
          onClick={loadClients}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <ClientTable
        clients={clients}
        loading={loading}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />
    </div>
  );
}
