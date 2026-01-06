'use client';

import { useMemo } from 'react';
import { Client } from '../../../lib/clients/clientTypes';
import { ClientSnapshot, ClientSnapshotAddress, ClientMode } from '../../lib/quotations/quotationTypes';

interface Props {
  mode: ClientMode;
  setMode: (mode: ClientMode) => void;
  existingClients: Client[];
  selectedClientId: string | null;
  onSelectClient: (client: Client | null) => void;
  newClient: ClientSnapshot;
  onChangeNewClient: (data: Partial<ClientSnapshot>) => void;
}

const addressFields: { key: keyof ClientSnapshotAddress; label: string; required?: boolean }[] = [
  { key: 'line1', label: 'Address line 1', required: true },
  { key: 'line2', label: 'Address line 2' },
  { key: 'city', label: 'City', required: true },
  { key: 'state', label: 'State', required: true },
  { key: 'country', label: 'Country', required: true },
  { key: 'pincode', label: 'Pincode', required: true },
  { key: 'stateCode', label: 'State code', required: true },
];

export default function QuoteClientSelector({
  mode,
  setMode,
  existingClients,
  selectedClientId,
  onSelectClient,
  newClient,
  onChangeNewClient,
}: Props) {
  const selectedClient = useMemo(
    () => existingClients.find((client) => client.id === selectedClientId) || null,
    [existingClients, selectedClientId],
  );

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-brandCharcoal">Client</p>
          <p className="text-sm text-gray-500">Choose an existing client or enter a one-off contact.</p>
        </div>
        <div className="flex gap-2 rounded-full bg-gray-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`rounded-full px-3 py-1 ${mode === 'existing' ? 'bg-white shadow text-brandCharcoal' : 'text-gray-500'}`}
          >
            Existing Client
          </button>
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`rounded-full px-3 py-1 ${mode === 'new' ? 'bg-white shadow text-brandCharcoal' : 'text-gray-500'}`}
          >
            New Client
          </button>
        </div>
      </div>

      {mode === 'existing' && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-600">
            Select client
            <select
              className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
              value={selectedClientId || ''}
              onChange={(e) => {
                const id = e.target.value;
                const client = existingClients.find((entry) => entry.id === id) || null;
                onSelectClient(client);
              }}
            >
              <option value="">Select a client</option>
              {existingClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.legalName}
                </option>
              ))}
            </select>
          </label>

          {selectedClient && (
            <div className="rounded-xl border border-gray-100 bg-brandMuted p-3 text-sm">
              <p className="font-semibold text-brandCharcoal">{selectedClient.legalName}</p>
              {selectedClient.brandName && <p className="text-gray-600">{selectedClient.brandName}</p>}
              <p className="text-gray-600">{selectedClient.email}</p>
              <p className="text-gray-600">{selectedClient.phone}</p>
              <p className="text-gray-600">{selectedClient.billingAddress?.line1}</p>
              <p className="text-gray-600">{selectedClient.billingAddress?.city}, {selectedClient.billingAddress?.state}</p>
            </div>
          )}
        </div>
      )}

      {mode === 'new' && (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-gray-600">
              Legal name<span className="text-rose-500">*</span>
              <input
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                value={newClient.legalName}
                onChange={(e) => onChangeNewClient({ legalName: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold text-gray-600">
              Brand name
              <input
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                value={newClient.brandName || ''}
                onChange={(e) => onChangeNewClient({ brandName: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold text-gray-600">
              Email
              <input
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                value={newClient.email || ''}
                onChange={(e) => onChangeNewClient({ email: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold text-gray-600">
              Phone
              <input
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                value={newClient.phone || ''}
                onChange={(e) => onChangeNewClient({ phone: e.target.value })}
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {addressFields.map((field) => (
              <label key={field.key} className="text-sm font-semibold text-gray-600">
                {field.label}
                {field.required && <span className="text-rose-500">*</span>}
                <input
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={(newClient.billingAddress?.[field.key] as string) || ''}
                  onChange={(e) =>
                    onChangeNewClient({
                      billingAddress: {
                        ...newClient.billingAddress,
                        [field.key]: e.target.value,
                      } as ClientSnapshotAddress,
                    })
                  }
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brandPrimary focus:ring-brandPrimary"
                checked={newClient.gstRegistered}
                onChange={(e) => onChangeNewClient({ gstRegistered: e.target.checked })}
              />
              GST Registered
            </label>
            {newClient.gstRegistered && (
              <label className="text-sm font-semibold text-gray-600">
                GSTIN
                <input
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={newClient.gstin || ''}
                  onChange={(e) => onChangeNewClient({ gstin: e.target.value })}
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
