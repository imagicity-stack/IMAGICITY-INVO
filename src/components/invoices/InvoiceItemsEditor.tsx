'use client';

import { useMemo } from 'react';
import { Service } from '../../lib/services/serviceTypes';
import { InvoiceItemPayload } from '../../lib/invoices/invoiceTypes';
import { computeLineTotals } from '../../lib/invoices/math';

interface Props {
  items: InvoiceItemPayload[];
  services: Service[];
  onChange: (items: InvoiceItemPayload[]) => void;
}

export default function InvoiceItemsEditor({ items, services, onChange }: Props) {
  const options = useMemo(() => services.map((service) => ({
    value: service.serviceId,
    label: service.name,
    rate: service.rate || 0,
    gstRate: service.gstRate || 0,
    description: service.description,
    unitLabel: service.unitLabel || 'Unit',
  })), [services]);

  const updateItem = (index: number, patch: Partial<InvoiceItemPayload>) => {
    const next = items.map((item, idx) =>
      idx === index
        ? {
            ...item,
            ...patch,
            ...computeLineTotals({ ...item, ...patch }),
          }
        : item,
    );
    onChange(next);
  };

  const addCustomLine = () => {
    onChange([
      ...items,
      {
        source: 'custom',
        serviceId: null,
        nameSnapshot: 'New line',
        descriptionSnapshot: '',
        unitLabelSnapshot: 'Unit',
        quantity: 1,
        rateSnapshot: 0,
        gstRateSnapshot: 0,
        taxIncludedSnapshot: false,
        lineSubTotal: 0,
        lineTax: 0,
        lineTotal: 0,
      },
    ]);
  };

  const addFromService = (serviceId: string) => {
    const meta = options.find((opt) => opt.value === serviceId);
    if (!meta) return;
    onChange([
      ...items,
      {
        source: 'service',
        serviceId,
        nameSnapshot: meta.label,
        descriptionSnapshot: meta.description || '',
        unitLabelSnapshot: meta.unitLabel,
        quantity: 1,
        rateSnapshot: Number(meta.rate),
        gstRateSnapshot: Number(meta.gstRate),
        taxIncludedSnapshot: false,
        ...computeLineTotals({
          source: 'service',
          serviceId,
          nameSnapshot: meta.label,
          descriptionSnapshot: meta.description || '',
          unitLabelSnapshot: meta.unitLabel,
          quantity: 1,
          rateSnapshot: Number(meta.rate),
          gstRateSnapshot: Number(meta.gstRate),
          taxIncludedSnapshot: false,
          lineSubTotal: 0,
          lineTax: 0,
          lineTotal: 0,
        }),
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          onChange={(e) => {
            if (!e.target.value) return;
            addFromService(e.target.value);
            e.target.value = '';
          }}
        >
          <option value="">Add from service</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addCustomLine}
          className="rounded-xl border border-dashed border-brandPrimary px-3 py-2 text-sm font-semibold text-brandPrimary"
        >
          + Custom line
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  value={item.nameSnapshot}
                  onChange={(e) => updateItem(idx, { nameSnapshot: e.target.value })}
                  placeholder="Item name"
                />
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  value={item.descriptionSnapshot || ''}
                  onChange={(e) => updateItem(idx, { descriptionSnapshot: e.target.value })}
                  placeholder="Description"
                />
                <div className="grid gap-3 md:grid-cols-4">
                  <label className="text-xs font-semibold text-gray-600">
                    Quantity
                    <input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">
                    Unit label
                    <input
                      value={item.unitLabelSnapshot}
                      onChange={(e) => updateItem(idx, { unitLabelSnapshot: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">
                    Rate
                    <input
                      type="number"
                      min={0}
                      value={item.rateSnapshot}
                      onChange={(e) => updateItem(idx, { rateSnapshot: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">
                    GST %
                    <input
                      type="number"
                      min={0}
                      value={item.gstRateSnapshot}
                      onChange={(e) => updateItem(idx, { gstRateSnapshot: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-1 text-sm"
                    />
                  </label>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={item.taxIncludedSnapshot}
                    onChange={(e) => updateItem(idx, { taxIncludedSnapshot: e.target.checked })}
                  />
                  Tax included in rate
                </label>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-gray-500">Line total</p>
                <p className="text-lg font-semibold text-brandCharcoal">₹{item.lineTotal.toFixed(2)}</p>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-xs font-semibold text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
