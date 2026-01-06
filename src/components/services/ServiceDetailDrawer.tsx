'use client';

import { Timestamp } from 'firebase/firestore';
import { Service } from '../../lib/services/serviceTypes';

interface Props {
  service: Service | null;
  open: boolean;
  onClose: () => void;
  onEdit: (service: Service) => void;
  onArchive: (service: Service) => void;
  onRestore: (service: Service) => void;
}

function formatDate(value?: Timestamp) {
  if (!value) return '—';
  const date = value instanceof Timestamp ? value.toDate() : new Date(value as any);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ServiceDetailDrawer({ service, open, onClose, onEdit, onArchive, onRestore }: Props) {
  if (!open || !service) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/40 p-4 backdrop-blur">
      <div className="w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Service detail</p>
            <p className="text-xl font-bold text-brandCharcoal">{service.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {service.isArchived ? (
              <button
                type="button"
                onClick={() => onRestore(service)}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brandPrimary underline"
              >
                Restore
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onArchive(service)}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 underline"
              >
                Archive
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(service)}
              className="rounded-full bg-brandPrimary px-4 py-2 text-sm font-semibold text-white shadow"
            >
              Edit
            </button>
            <button
              type="button"
              aria-label="Close detail"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-700"
            >
              ×
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-4 md:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-brandMuted p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Identity</p>
            <div className="mt-3 space-y-2 text-sm text-brandCharcoal">
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span>{service.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span>{service.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span>{service.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Archived</span><span>{service.isArchived ? 'Yes' : 'No'}</span></div>
              <p className="pt-2 text-gray-700">{service.description || 'No description available.'}</p>
              {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="badge bg-brandSecondary/20 text-xs font-semibold text-brandCharcoal">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-brandMuted p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Pricing</p>
            <div className="mt-3 space-y-2 text-sm text-brandCharcoal">
              <div className="flex justify-between"><span className="text-gray-500">Model</span><span>{service.pricingModel}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rate</span><span>{service.currency} {service.rate.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">GST</span><span>{service.gstRate}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax Included</span><span>{service.taxIncluded ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Unit Label</span><span>{service.unitLabel}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Requires Brief</span><span>{service.requiresBrief ? 'Yes' : 'No'}</span></div>
              {service.turnaroundDays !== undefined && (
                <div className="flex justify-between"><span className="text-gray-500">Turnaround</span><span>{service.turnaroundDays} days</span></div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Deliverables</p>
            {service.deliverables && service.deliverables.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-brandCharcoal">
                {service.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No deliverables listed.</p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Internal</p>
            <div className="mt-3 space-y-2 text-sm text-brandCharcoal">
              <div className="flex justify-between"><span className="text-gray-500">Internal Cost</span><span>{service.internalCost ? `${service.currency} ${service.internalCost.toLocaleString()}` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Notes</span><span>{service.notesInternal || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Created</span><span>{formatDate(service.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Updated</span><span>{formatDate(service.updatedAt)}</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
