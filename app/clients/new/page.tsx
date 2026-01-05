'use client';

import ClientForm from '../../../components/clients/ClientForm';

export const dynamic = 'force-dynamic';

export default function NewClientPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-10">
      <ClientForm mode="create" />
    </main>
  );
}
