'use client';

import ClientForm from '../../../components/clients/ClientForm';

export const dynamic = 'force-dynamic';

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <ClientForm mode="create" />
    </div>
  );
}
