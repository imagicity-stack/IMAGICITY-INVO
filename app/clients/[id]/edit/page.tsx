'use client';

import { useEffect, useState } from 'react';
import ClientForm from '../../../../components/clients/ClientForm';
import { fetchClientById } from '../../../../lib/clients/clientService';
import { Client } from '../../../../lib/clients/clientTypes';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default function EditClientPage({ params }: Props) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchClientById(params.id);
        if (!data) setError('Client not found');
        setClient(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load client');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  if (loading)
    return (
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-10">
        <div className="card">Loading client…</div>
      </main>
    );
  if (error || !client)
    return (
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-10">
        <div className="card text-red-700">{error || 'Client not found'}</div>
      </main>
    );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-10">
      <ClientForm mode="edit" initialClient={client} />
    </main>
  );
}
