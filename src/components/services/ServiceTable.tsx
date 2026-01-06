'use client';

import { useMemo } from 'react';
import { Service } from '../../lib/services/serviceTypes';

interface Props {
  services: Service[];
  loading?: boolean;
  onSelect: (service: Service) => void;
  onEdit: (service: Service) => void;
  onArchive: (service: Service) => void;
  onRestore: (service: Service) => void;
}

export default function ServiceTable({ services, loading, onSelect, onEdit, onArchive, onRestore }: Props) {
  const sorted = useMemo(
    () => [...services].sort((a, b) => a.name.localeCompare(b.name)),
    [services],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        Loading services...
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No services found. Try adjusting filters or add a new service.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
        <div>Name</div>
        <div>Category</div>
        <div>Pricing Model</div>
        <div className="text-right">Rate</div>
        <div className="text-right">GST</div>
        <div className="text-right">Status</div>
      </div>
      <div className="divide-y divide-gray-100">
        {sorted.map((service) => (
          <div
            key={service.serviceId}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(service)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelect(service);
            }}
            className="grid cursor-pointer grid-cols-1 gap-2 px-4 py-4 transition hover:bg-brandMuted md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] md:items-center"
          >
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-brandCharcoal">{service.name}</p>
              <p className="text-xs text-gray-500">{service.description || 'No description provided yet.'}</p>
              {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {service.tags.map((tag) => (
                    <span key={tag} className="badge bg-brandSecondary/20 text-xs font-semibold text-brandCharcoal">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-sm font-semibold text-gray-700">{service.category}</div>
            <div className="text-sm text-gray-700">{service.pricingModel}</div>
            <div className="text-right text-sm font-semibold text-brandCharcoal">
              {service.currency || 'INR'} {service.rate.toLocaleString()}
            </div>
            <div className="text-right text-sm text-gray-700">{service.gstRate}%</div>
            <div className="flex items-center justify-end gap-2 text-sm">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  service.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {service.status}
              </span>
              {service.isArchived ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(service);
                  }}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brandPrimary underline"
                >
                  Restore
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(service);
                  }}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 underline"
                >
                  Archive
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(service);
                }}
                className="rounded-full bg-brandPrimary px-3 py-1 text-xs font-semibold text-white shadow"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
