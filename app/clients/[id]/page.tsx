'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientDetail from '../../../components/clients/ClientDetail';
import { archiveClient, fetchClientById, restoreClient } from '../../../lib/clients/clientService';
import { Client } from '../../../lib/clients/clientTypes';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default function ClientDetailPage({ params }: Props) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClient = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClientById(params.id);
      if (!data) {
        setError('Client not found');
      }
      setClient(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load client');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleArchive = async () => {
    if (!client) return;
    await archiveClient(client.id);
    router.push('/clients');
  };

  const handleRestore = async () => {
    if (!client) return;
    await restoreClient(client.id);
    router.push('/clients');
  };

  if (loading) {
    return <div className="card">Loading client…</div>;
  }

  if (error || !client) {
    return <div className="card text-red-700">{error || 'Client not found'}</div>;
  }

  return (
    <div className="space-y-6">
      <ClientDetail
        client={client}
        onEdit={() => router.push(`/clients/${client.id}/edit`)}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />
    </div>
  );
}
