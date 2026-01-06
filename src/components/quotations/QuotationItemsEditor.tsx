'use client';

import { useMemo } from 'react';
import { Service } from '../../lib/services/serviceTypes';
import { QuotationItem } from '../../lib/quotations/quotationTypes';

interface Props {
  services: Service[];
  items: QuotationItem[];
  onChangeItems: (items: QuotationItem[]) => void;
}

function calculateLineTotals(quantity: number, rate: number, gstRate: number, taxIncluded: boolean) {
  const gross = quantity * rate;
  if (taxIncluded) {
    const base = gross / (1 + gstRate / 100);
    const tax = gross - base;
    return { lineSubTotal: Number(base.toFixed(2)), lineTax: Number(tax.toFixed(2)), lineTotal: Number(gross.toFixed(2)) };
  }
  const tax = gross * (gstRate / 100);
  return {
    lineSubTotal: Number(gross.toFixed(2)),
    lineTax: Number(tax.toFixed(2)),
    lineTotal: Number((gross + tax).toFixed(2)),
  };
}

export default function QuotationItemsEditor({ services, items, onChangeItems }: Props) {
  const serviceOptions = useMemo(() => services.filter((svc) => !svc.isArchived), [services]);

  const handleAddService = (serviceId: string) => {
    const service = serviceOptions.find((svc) => svc.serviceId === serviceId);
    if (!service) return;
    const quantity = 1;
    const totals = calculateLineTotals(quantity, Number(service.rate || 0), Number(service.gstRate || 0), !!service.taxIncluded);
    const nextItem: QuotationItem = {
      itemId: crypto.randomUUID(),
      source: 'service',
      serviceId: service.serviceId,
      nameSnapshot: service.name,
      descriptionSnapshot: service.description,
      unitLabelSnapshot: service.unitLabel || 'Unit',
      rateSnapshot: Number(service.rate || 0),
      gstRateSnapshot: Number(service.gstRate || 0),
      taxIncludedSnapshot: !!service.taxIncluded,
      quantity,
      ...totals,
    };
    onChangeItems([nextItem, ...items]);
  };

  const handleAddCustom = () => {
    const nextItem: QuotationItem = {
      itemId: crypto.randomUUID(),
      source: 'custom',
      serviceId: null,
      nameSnapshot: '',
      unitLabelSnapshot: 'Unit',
      rateSnapshot: 0,
      gstRateSnapshot: 0,
      taxIncludedSnapshot: false,
      quantity: 1,
      lineSubTotal: 0,
      lineTax: 0,
      lineTotal: 0,
    };
    onChangeItems([nextItem, ...items]);
  };

  const updateItem = (id: string, update: Partial<QuotationItem>) => {
    const updated = items.map((item) => {
      if (item.itemId !== id) return item;
      const draft = { ...item, ...update } as QuotationItem;
      const totals = calculateLineTotals(draft.quantity, draft.rateSnapshot, draft.gstRateSnapshot, draft.taxIncludedSnapshot);
      return { ...draft, ...totals };
    });
    onChangeItems(updated);
  };

  const removeItem = (id: string) => {
    onChangeItems(items.filter((item) => item.itemId !== id));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-brandCharcoal">Items</p>
          <p className="text-sm text-gray-500">Add services or custom lines with live totals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm"
            onChange={(e) => {
              if (e.target.value) {
                handleAddService(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="">Add from services</option>
            {serviceOptions.map((svc) => (
              <option key={svc.serviceId} value={svc.serviceId}>
                {svc.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddCustom}
            className="rounded-full bg-brandSecondary px-4 py-2 text-sm font-semibold text-brandCharcoal shadow"
          >
            Add custom
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-gray-500">No items yet. Add at least one line.</p>}
        {items.map((item) => (
          <div key={item.itemId} className="rounded-2xl border border-gray-100 bg-brandMuted p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wide text-gray-500">
              <span className="badge bg-white/80 text-brandCharcoal">{item.source === 'service' ? 'Service' : 'Custom'}</span>
              <button type="button" onClick={() => removeItem(item.itemId)} className="text-rose-600 hover:underline">
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-600">
                Name
                <input
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={item.nameSnapshot}
                  onChange={(e) => updateItem(item.itemId, { nameSnapshot: e.target.value })}
                  disabled={item.source === 'service'}
                />
              </label>
              <label className="text-sm font-semibold text-gray-600">
                Unit label
                <input
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={item.unitLabelSnapshot}
                  onChange={(e) => updateItem(item.itemId, { unitLabelSnapshot: e.target.value })}
                  disabled={item.source === 'service'}
                />
              </label>
              <label className="text-sm font-semibold text-gray-600">
                Quantity
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.itemId, { quantity: Number(e.target.value) || 1 })}
                />
              </label>
              <label className="text-sm font-semibold text-gray-600">
                Rate
                <input
                  type="number"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={item.rateSnapshot}
                  onChange={(e) => updateItem(item.itemId, { rateSnapshot: Number(e.target.value) || 0 })}
                  disabled={item.source === 'service'}
                />
              </label>
              <label className="text-sm font-semibold text-gray-600">
                GST %
                <input
                  type="number"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={item.gstRateSnapshot}
                  onChange={(e) => updateItem(item.itemId, { gstRateSnapshot: Number(e.target.value) || 0 })}
                  disabled={item.source === 'service'}
                />
              </label>
              <label className="text-sm font-semibold text-gray-600">
                Tax included
                <input
                  type="checkbox"
                  className="ml-2 h-4 w-4 rounded border-gray-300 text-brandPrimary focus:ring-brandPrimary"
                  checked={item.taxIncludedSnapshot}
                  onChange={(e) => updateItem(item.itemId, { taxIncludedSnapshot: e.target.checked })}
                  disabled={item.source === 'service'}
                />
              </label>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-600">
                  Description
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                    value={item.descriptionSnapshot || ''}
                    onChange={(e) => updateItem(item.itemId, { descriptionSnapshot: e.target.value })}
                    rows={2}
                    disabled={item.source === 'service'}
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 text-sm font-semibold text-brandCharcoal">
              <span>Subtotal: {item.lineSubTotal.toFixed(2)}</span>
              <span>Tax: {item.lineTax.toFixed(2)}</span>
              <span>Total: {item.lineTotal.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
