'use client';

import { Client } from '../../lib/clients/clientTypes';

interface Props {
  clients: Client[];
  loading?: boolean;
  onSelect: (client: Client) => void;
  onEdit: (client: Client) => void;
  onArchive: (client: Client) => void;
  onRestore: (client: Client) => void;
}

const statusColor: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  'On Hold': 'bg-amber-100 text-amber-800',
  Inactive: 'bg-slate-100 text-slate-700',
  Blacklisted: 'bg-rose-100 text-rose-700',
};

const badge = (text: string, color?: string) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${color || 'bg-slate-100 text-slate-700'}`}>
    <span className="h-2 w-2 rounded-full bg-current opacity-80" />
    {text}
  </span>
);

export default function ClientTable({ clients, loading, onSelect, onArchive, onRestore, onEdit }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50/70 backdrop-blur">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Billing</th>
              <th className="px-6 py-3">Preferences</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading && (
              <tr>
                <td className="px-6 py-6 text-center text-gray-600" colSpan={6}>
                  Loading clients…
                </td>
              </tr>
            )}
            {!loading && clients.length === 0 && (
              <tr>
                <td className="px-6 py-10 text-center text-gray-600" colSpan={6}>
                  No clients found. Try adjusting filters or add a new client.
                </td>
              </tr>
            )}
            {!loading &&
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="group cursor-pointer transition hover:bg-slate-50"
                  onClick={() => onSelect(client)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold uppercase text-white shadow-sm">
                        {client.brandName?.[0] || client.legalName?.[0] || '?'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          {client.legalName}
                          {client.isArchived && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">Archived</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{client.brandName || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="font-medium text-slate-900">{client.contactPerson}</div>
                    <div className="text-xs text-gray-500">{client.email}</div>
                    <div className="text-xs text-gray-500">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {badge(client.status, statusColor[client.status])}
                    <div className="mt-2 text-xs text-gray-500">{client.clientType}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="font-medium text-slate-900">{client.billingAddress?.city || '—'}, {client.billingAddress?.state || ''}</div>
                    <div className="text-xs text-gray-500">{client.currency || 'INR'} · {client.taxPreference}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      {client.preferredPaymentMode && badge(client.preferredPaymentMode)}
                      {client.paymentTerms && badge(client.paymentTerms)}
                      {client.autoReminderEnabled && badge('Auto reminders')}
                    </div>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(client)}
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      {!client.isArchived ? (
                        <button
                          type="button"
                          onClick={() => onArchive(client)}
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-50"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRestore(client)}
                          className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-50"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
