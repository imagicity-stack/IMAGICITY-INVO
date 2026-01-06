'use client';

import { Timestamp } from 'firebase/firestore';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Client } from '../../../lib/clients/clientTypes';
import { fetchClients } from '../../../lib/clients/clientService';
import { listServices } from '../../lib/services/serviceService';
import { Service } from '../../lib/services/serviceTypes';
import QuoteClientSelector from './QuoteClientSelector';
import QuotationItemsEditor from './QuotationItemsEditor';
import { QuotationFormData, quotationSchema } from '../../lib/quotations/quotationSchema';
import {
  ClientMode,
  ClientSnapshot,
  QuotationItem,
  QuotationItemPayload,
  QuotationPayload,
} from '../../lib/quotations/quotationTypes';
import { fetchNextQuoteNumber } from '../../lib/quotations/quotationService';

interface Props {
  initialData?: Partial<QuotationFormData>;
  onSubmit: (payload: QuotationPayload, items: QuotationItemPayload[]) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const defaultAddress = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  stateCode: '',
};

const buildDefaultClient = (): ClientSnapshot => ({
  legalName: '',
  brandName: '',
  email: '',
  phone: '',
  billingAddress: { ...defaultAddress },
  gstRegistered: false,
  gstin: '',
});

const emptyItem: QuotationItem = {
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

const toDateInput = (value?: unknown) => {
  if (!value) return '';
  const date = typeof (value as any)?.toDate === 'function' ? (value as any).toDate() : new Date(value as any);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

function computeTotals(items: QuotationItem[], discountType: 'None' | 'Flat' | 'Percent', discountValue: number) {
  const subTotal = items.reduce((acc, item) => acc + (item.lineSubTotal || 0), 0);
  const taxTotal = items.reduce((acc, item) => acc + (item.lineTax || 0), 0);
  let discount = 0;
  if (discountType === 'Flat') discount = discountValue;
  if (discountType === 'Percent') discount = (subTotal * discountValue) / 100;
  const discountedSubTotal = Math.max(subTotal - discount, 0);
  const grandTotal = discountedSubTotal + taxTotal;
  return {
    subTotal: Number(subTotal.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}

export default function QuotationForm({ initialData, onSubmit, onCancel, submitting }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clientMode, setClientMode] = useState<ClientMode>(initialData?.clientMode || 'existing');
  const [clientId, setClientId] = useState<string | null>((initialData?.clientId as string) || null);
  const [clientSnapshot, setClientSnapshot] = useState<ClientSnapshot>(initialData?.clientSnapshot || buildDefaultClient());
  const [quoteNumber, setQuoteNumber] = useState(initialData?.quoteNumber || '');
  const [status, setStatus] = useState<QuotationPayload['status']>(initialData?.status || 'Draft');
  const [issueDate, setIssueDate] = useState<string>(toDateInput(initialData?.issueDate));
  const [validUntil, setValidUntil] = useState<string>(toDateInput(initialData?.validUntil));
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');
  const [discountType, setDiscountType] = useState<QuotationPayload['discountType']>(initialData?.discountType || 'None');
  const [discountValue, setDiscountValue] = useState<number>(initialData?.discountValue ?? 0);
  const [items, setItems] = useState<QuotationItem[]>(
    initialData?.items?.map((item) => ({ ...item, itemId: item.itemId || crypto.randomUUID() })) || [
      { ...emptyItem, itemId: crypto.randomUUID() },
    ],
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [terms, setTerms] = useState(initialData?.terms || '');
  const [formError, setFormError] = useState('');
  const [loadingPickers, setLoadingPickers] = useState(false);

  useEffect(() => {
    setLoadingPickers(true);
    Promise.all([
      fetchClients({ includeArchived: false, status: 'Active', search: '' }),
      listServices({ includeArchived: false }),
    ])
      .then(([clientData, serviceData]) => {
        setClients(clientData);
        setServices(serviceData);
      })
      .catch(() => setFormError('Failed to load clients or services.'))
      .finally(() => setLoadingPickers(false));
  }, []);

  useEffect(() => {
    if (initialData?.quoteNumber) return;
    fetchNextQuoteNumber()
      .then((next) => setQuoteNumber(next))
      .catch(() => setQuoteNumber(''));
  }, [initialData?.quoteNumber]);

  const totals = useMemo(() => computeTotals(items, discountType, discountValue), [items, discountType, discountValue]);

  const handleNewClientChange = (partial: Partial<ClientSnapshot>) => {
    setClientSnapshot((prev) => ({ ...prev, ...partial, billingAddress: { ...prev.billingAddress, ...partial.billingAddress } }));
  };

  const handleSubmit = async (evt: FormEvent, nextStatus?: QuotationPayload['status']) => {
    evt.preventDefault();
    setFormError('');

    const payload: Partial<QuotationFormData> = {
      quoteId: initialData?.quoteId,
      quoteNumber: quoteNumber.trim(),
      clientMode,
      clientId: clientMode === 'existing' ? clientId : null,
      clientSnapshot: clientMode === 'existing'
        ? (clients.find((c) => c.id === clientId) as unknown as ClientSnapshot) || clientSnapshot
        : clientSnapshot,
      status: nextStatus || status,
      issueDate: issueDate ? new Date(issueDate) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      currency,
      discountType,
      discountValue,
      subTotal: totals.subTotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      notes,
      terms,
      isArchived: false,
      items,
    };

    const parsed = quotationSchema.safeParse(payload);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Please fix validation errors');
      return;
    }

    const formattedItems: QuotationItemPayload[] = parsed.data.items.map((item) => ({
      ...item,
      serviceId: item.source === 'service' ? item.serviceId : null,
      itemId: item.itemId,
    }));

    const prepared: QuotationPayload = {
      ...parsed.data,
      issueDate: parsed.data.issueDate ? Timestamp.fromDate(parsed.data.issueDate) : null,
      validUntil: parsed.data.validUntil ? Timestamp.fromDate(parsed.data.validUntil) : null,
    } as unknown as QuotationPayload;

    try {
      await onSubmit(prepared, formattedItems);
    } catch (err) {
      console.error(err);
      setFormError('Unable to save quotation. Please try again.');
    }
  };

  const selectedClient = clients.find((c) => c.id === clientId) || null;

  useEffect(() => {
    if (clientMode === 'existing' && selectedClient) {
      setClientSnapshot({
        legalName: selectedClient.legalName,
        brandName: selectedClient.brandName,
        email: selectedClient.email,
        phone: selectedClient.phone,
        billingAddress: selectedClient.billingAddress,
        gstRegistered: selectedClient.gstRegistered,
        gstin: selectedClient.gstin,
      });
    }
  }, [clientMode, selectedClient]);

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
      {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{formError}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <QuoteClientSelector
            mode={clientMode}
            setMode={setClientMode}
            existingClients={clients}
            selectedClientId={clientId}
            onSelectClient={(client) => setClientId(client?.id || null)}
            newClient={clientSnapshot}
            onChangeNewClient={handleNewClientChange}
          />
          <QuotationItemsEditor services={services} items={items} onChangeItems={setItems} />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-semibold text-brandCharcoal">Quote details</p>
              {loadingPickers && <span className="text-xs text-gray-500">Loading pickers…</span>}
            </div>
              <label className="text-sm font-semibold text-gray-600">
                Quote number
                <input
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-100 px-3 py-2"
                  value={quoteNumber}
                  readOnly
                />
              </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-gray-600">
                Issue date
                <input
                  type="date"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </label>
              <label className="text-sm font-semibold text-gray-600">
                Valid until
                <input
                  type="date"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </label>
            </div>
            <label className="text-sm font-semibold text-gray-600">
              Currency
              <input
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-gray-600">
              Status
              <select
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationPayload['status'])}
              >
                {['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted'].map((entry) => (
                  <option key={entry}>{entry}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-gray-600">
                Discount type
                <select
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as QuotationPayload['discountType'])}
                >
                  <option>None</option>
                  <option>Flat</option>
                  <option>Percent</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-gray-600">
                Discount value
                <input
                  type="number"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  disabled={discountType === 'None'}
                />
              </label>
            </div>

            <div className="rounded-xl bg-brandMuted p-3 text-sm font-semibold text-brandCharcoal">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{totals.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>{totals.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span>Grand total</span>
                <span>{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <label className="text-sm font-semibold text-gray-600">
              Notes
              <textarea
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-gray-600">
              Terms
              <textarea
                className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="space-y-1 text-sm text-gray-600">
              <p>Add at least one item and choose a client before saving.</p>
              <p>New clients entered here stay within the quotation snapshot only.</p>
            </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, 'Draft')}
                  className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow"
                  disabled={submitting}
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  onClick={(e) => handleSubmit(e as any, status)}
                  className="rounded-full bg-brandPrimary px-4 py-2 text-sm font-semibold text-white shadow"
                  disabled={submitting}
                >
                  Save
                </button>
              </div>
            </div>
        </div>
      </div>
    </form>
  );
}
