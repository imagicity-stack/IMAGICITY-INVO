'use client';

import { Timestamp } from 'firebase/firestore';
import { Client } from '../../lib/clients/clientTypes';

interface Props {
  client: Client;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

const infoLabel = 'text-xs uppercase tracking-wide text-gray-500';
const infoValue = 'text-sm font-medium text-gray-900';

const formatDate = (value?: Timestamp) => {
  if (!value) return '—';
  const date = value.toDate ? value.toDate() : new Date(value as unknown as string);
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function ClientDetail({ client, onArchive, onDelete, onEdit, onRestore }: Props) {
  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Client</p>
          <h2 className="text-xl font-semibold text-gray-900">{client.legalName}</h2>
          <p className="text-sm text-gray-600">{client.brandName || 'No brand name'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Edit
          </button>
          {!client.isArchived ? (
            <button
              type="button"
              onClick={onArchive}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Archive
            </button>
          ) : (
            <button
              type="button"
              onClick={onRestore}
              className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              Restore
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className={infoLabel}>Contact</p>
          <p className={infoValue}>{client.contactPerson}</p>
          <p className="text-sm text-gray-600">{client.email}</p>
          <p className="text-sm text-gray-600">{client.phone}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className={infoLabel}>Status</p>
          <p className={`${infoValue} flex items-center gap-2`}>
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">{client.status}</span>
            <span className="text-xs text-gray-500">{client.clientType}</span>
          </p>
          <p className="text-xs text-gray-500">Client ID: {client.clientId}</p>
          <p className="text-xs text-gray-500">Source: {client.clientSource}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-800">Billing</p>
          <div className="text-sm text-gray-700">
            <p>{client.billingAddress.line1}</p>
            {client.billingAddress.line2 && <p>{client.billingAddress.line2}</p>}
            <p>
              {client.billingAddress.city}, {client.billingAddress.state} ({client.billingAddress.stateCode})
            </p>
            <p>
              {client.billingAddress.country} • {client.billingAddress.pincode}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-800">Tax</p>
          <dl className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <dt className={infoLabel}>GST Registered</dt>
            <dd className={infoValue}>{client.gstRegistered ? 'Yes' : 'No'}</dd>
            <dt className={infoLabel}>GSTIN</dt>
            <dd className={infoValue}>{client.gstin || '—'}</dd>
            <dt className={infoLabel}>PAN</dt>
            <dd className={infoValue}>{client.pan || '—'}</dd>
            <dt className={infoLabel}>Tax Preference</dt>
            <dd className={infoValue}>{client.taxPreference}</dd>
          </dl>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-800">Preferences</p>
          <dl className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <dt className={infoLabel}>Currency</dt>
            <dd className={infoValue}>{client.currency}</dd>
            <dt className={infoLabel}>Payment Terms</dt>
            <dd className={infoValue}>{client.paymentTerms}</dd>
            <dt className={infoLabel}>Payment Mode</dt>
            <dd className={infoValue}>{client.preferredPaymentMode}</dd>
            <dt className={infoLabel}>Credit Limit</dt>
            <dd className={infoValue}>{client.creditLimit ?? '—'}</dd>
            <dt className={infoLabel}>Auto Send</dt>
            <dd className={infoValue}>{client.autoSendInvoice ? 'Enabled' : 'Disabled'}</dd>
            <dt className={infoLabel}>Reminders</dt>
            <dd className={infoValue}>
              {client.autoReminderEnabled
                ? `${client.reminderFrequencyDays || 'Custom'} days`
                : 'Disabled'}
            </dd>
            <dt className={infoLabel}>Late Fee</dt>
            <dd className={infoValue}>{client.lateFeeApplicable ? 'Applicable' : 'Not applicable'}</dd>
          </dl>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-800">Internal</p>
          <dl className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <dt className={infoLabel}>Account Owner</dt>
            <dd className={infoValue}>{client.accountOwner || '—'}</dd>
            <dt className={infoLabel}>Industry</dt>
            <dd className={infoValue}>{client.industryType || '—'}</dd>
            <dt className={infoLabel}>Tags</dt>
            <dd className={infoValue}>{client.tags?.join(', ') || '—'}</dd>
            <dt className={infoLabel}>Notes</dt>
            <dd className="text-sm text-gray-800">{client.notes || '—'}</dd>
          </dl>
          <div className="mt-3 text-xs text-gray-500">
            <p>Created: {formatDate(client.createdAt)}</p>
            <p>Updated: {formatDate(client.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
