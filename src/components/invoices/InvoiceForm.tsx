'use client';

import { useEffect, useMemo, useState } from 'react';
import InvoiceItemsEditor from './InvoiceItemsEditor';
import { Client } from '../../../lib/clients/clientTypes';
import { Service } from '../../lib/services/serviceTypes';
import { Quotation } from '../../lib/quotations/quotationTypes';
import { InvoiceItemPayload, InvoicePayload } from '../../lib/invoices/invoiceTypes';
import { computeTotals } from '../../lib/invoices/math';

interface Props {
  initialData?: Partial<InvoicePayload> & { items?: InvoiceItemPayload[] };
  quotations: Quotation[];
  clients: Client[];
  services: Service[];
  onSubmit: (payload: InvoicePayload, items: InvoiceItemPayload[]) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export default function InvoiceForm({ initialData, quotations, clients, services, onSubmit, onCancel, submitting }: Props) {
  const [source, setSource] = useState<'manual' | 'quotation'>(initialData?.source || 'manual');
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(initialData?.quotationId || null);
  const [clientId, setClientId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || '');
  const [issueDate, setIssueDate] = useState<string>(() => (initialData?.issueDate as any)?.toDate?.()?.toISOString().slice(0, 10) || '');
  const [dueDate, setDueDate] = useState<string>(() => (initialData?.dueDate as any)?.toDate?.()?.toISOString().slice(0, 10) || '');
  const [placeOfSupplyStateCode, setPlaceOfSupplyStateCode] = useState(initialData?.placeOfSupplyStateCode || '');
  const [discountType, setDiscountType] = useState(initialData?.discountType || 'None');
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue || 0);
  const [roundOff, setRoundOff] = useState(initialData?.roundOff || 0);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [terms, setTerms] = useState(initialData?.terms || '');
  const [items, setItems] = useState<InvoiceItemPayload[]>(initialData?.items || []);
  const [clientSnapshot, setClientSnapshot] = useState(initialData?.clientSnapshot || null);

  useEffect(() => {
    if (source === 'quotation' && selectedQuotation) {
      const quote = quotations.find((q) => q.quoteId === selectedQuotation);
      if (quote) {
        setClientSnapshot(quote.clientSnapshot as any);
        const mappedItems = (quote as any).items || [];
        setItems(mappedItems.length ? mappedItems : []);
      }
    }
  }, [quotations, selectedQuotation, source]);

  useEffect(() => {
    if (source === 'manual' && clientId) {
      const match = clients.find((client) => client.id === clientId);
      if (match) {
        setClientSnapshot({
          legalName: match.legalName,
          brandName: match.brandName,
          email: match.email,
          phone: match.phone,
          billingAddress: match.billingAddress,
          gstRegistered: !!match.gstRegistered,
          gstin: match.gstin,
        } as any);
      }
    }
  }, [clientId, clients, source]);

  const totals = useMemo(() => computeTotals(items, discountType as any, Number(discountValue || 0), Number(roundOff || 0)), [items, discountType, discountValue, roundOff]);

  const handleSubmit = () => {
    if (!clientSnapshot) return;
    const payload: InvoicePayload = {
      ...initialData,
      invoiceId: initialData?.invoiceId,
      invoiceNumber: invoiceNumber || initialData?.invoiceNumber || '',
      source,
      quotationId: source === 'quotation' ? selectedQuotation : null,
      clientSnapshot,
      placeOfSupplyStateCode,
      currency: 'INR',
      issueDate: issueDate ? new Date(issueDate) as any : null,
      dueDate: dueDate ? new Date(dueDate) as any : null,
      paymentTerms: initialData?.paymentTerms,
      subTotal: totals.subTotal,
      discountType: discountType as any,
      discountValue: Number(discountValue || 0),
      taxTotal: totals.taxTotal,
      roundOff: Number(roundOff || 0),
      grandTotal: totals.grandTotal,
      amountPaid: initialData?.amountPaid || 0,
      balanceDue: totals.balanceDue,
      notes,
      terms,
      isArchived: initialData?.isArchived || false,
      status: initialData?.status || 'Draft',
    };

    onSubmit(payload, totals.items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brandCharcoal">{initialData?.invoiceId ? 'Edit Invoice' : 'New Invoice'}</h3>
          <p className="text-sm text-gray-600">Snapshots ensure your invoices remain immutable after issuing.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-600">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !clientSnapshot}
            className="rounded-xl bg-brandPrimary px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs font-semibold text-gray-700">
          Source
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as any)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="quotation">Convert from quotation</option>
            <option value="manual">Manual invoice</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Invoice number
          <input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Auto-generate"
          />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Place of supply state code
          <input
            value={placeOfSupplyStateCode}
            onChange={(e) => setPlaceOfSupplyStateCode(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {source === 'quotation' ? (
        <label className="text-xs font-semibold text-gray-700">
          Select quotation
          <select
            value={selectedQuotation || ''}
            onChange={(e) => setSelectedQuotation(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Choose quotation</option>
            {quotations.map((quote) => (
              <option key={quote.quoteId} value={quote.quoteId}>
                {quote.quoteNumber} — {quote.clientSnapshot?.legalName}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="text-xs font-semibold text-gray-700">
          Client
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Select existing client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.legalName}
              </option>
            ))}
          </select>
        </label>
      )}

      {clientSnapshot && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <p className="font-semibold text-brandCharcoal">Client snapshot</p>
          <p>{clientSnapshot.legalName}</p>
          {clientSnapshot.billingAddress && (
            <p className="text-xs text-gray-600">
              {clientSnapshot.billingAddress.line1}, {clientSnapshot.billingAddress.city}, {clientSnapshot.billingAddress.stateCode}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-semibold text-gray-700">
          Issue date
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Due date
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <InvoiceItemsEditor items={items} services={services} onChange={setItems} />

      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs font-semibold text-gray-700">
          Discount type
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as any)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="None">None</option>
            <option value="Flat">Flat</option>
            <option value="Percent">Percent</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Discount value
          <input
            type="number"
            min={0}
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Round off
          <input
            type="number"
            value={roundOff}
            onChange={(e) => setRoundOff(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-semibold text-gray-700">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Terms
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-brandCharcoal">Totals</p>
        <dl className="mt-2 space-y-1 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <dt>Subtotal</dt>
            <dd>₹{totals.subTotal.toFixed(2)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Tax</dt>
            <dd>₹{totals.taxTotal.toFixed(2)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Grand total</dt>
            <dd className="text-lg font-semibold text-brandCharcoal">₹{totals.grandTotal.toFixed(2)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
