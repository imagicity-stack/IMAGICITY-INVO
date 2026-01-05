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
  Active: 'bg-green-100 text-green-700',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  Inactive: 'bg-gray-100 text-gray-700',
  Blacklisted: 'bg-red-100 text-red-700',
};

export default function ClientTable({ clients, loading, onSelect, onArchive, onRestore, onEdit }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Legal Name</th>
              <th className="px-4 py-3">Contact Person</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Outstanding</th>
              <th className="px-4 py-3">Last Invoice</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-600" colSpan={8}>
                  Loading clients…
                </td>
              </tr>
            )}
            {!loading && clients.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-gray-600" colSpan={8}>
                  No clients found. Try adjusting filters or add a new client.
                </td>
              </tr>
            )}
            {!loading &&
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelect(client)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{client.legalName}</td>
                  <td className="px-4 py-3 text-gray-700">{client.contactPerson}</td>
                  <td className="px-4 py-3 text-gray-700">{client.phone}</td>
                  <td className="px-4 py-3 text-gray-700">{client.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColor[client.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">—</td>
                  <td className="px-4 py-3 text-gray-500">—</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(client)}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      {!client.isArchived ? (
                        <button
                          type="button"
                          onClick={() => onArchive(client)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRestore(client)}
                          className="rounded-lg border border-green-200 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
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
