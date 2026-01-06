'use client';

import { useState } from 'react';
import { buildQuotationPdfMarkup } from '../../lib/quotations/quotationPdf';
import { Quotation, QuotationItem } from '../../lib/quotations/quotationTypes';

interface Props {
  quotation: Quotation | null;
  items: QuotationItem[];
  open: boolean;
  onClose: () => void;
  onEdit: (quote: Quotation) => void;
  onDuplicate: (quote: Quotation) => void;
  onArchiveToggle: (quote: Quotation) => void;
  onStatusChange: (quote: Quotation, status: Quotation['status']) => void;
  onDelete: (quote: Quotation) => void;
}

export default function QuotationDetailDrawer({
  quotation,
  items,
  open,
  onClose,
  onEdit,
  onDuplicate,
  onArchiveToggle,
  onStatusChange,
  onDelete,
}: Props) {
  const [downloading, setDownloading] = useState(false);

  if (!open || !quotation) return null;

  const renderDate = (value: any) => {
    if (!value) return '—';
    const parsed = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
    return parsed.toLocaleDateString();
  };

  const loadHtml2Pdf = async () => {
    if (typeof window === 'undefined') return null;
    if ((window as any).html2pdf) return (window as any).html2pdf;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PDF library'));
      document.body.appendChild(script);
    });

    return (window as any).html2pdf;
  };

  const handleDownload = async () => {
    if (!quotation) return;
    setDownloading(true);
    try {
      const html2pdf = await loadHtml2Pdf();
      if (!html2pdf) throw new Error('Unable to load PDF generator');

      const wrapper = document.createElement('div');
      wrapper.innerHTML = buildQuotationPdfMarkup(quotation, items);
      const target = wrapper.firstElementChild as HTMLElement | null;

      if (!target) throw new Error('Unable to build quotation layout');

      document.body.appendChild(target);

      await html2pdf()
        .set({
          margin: 0,
          filename: `${quotation.quoteNumber || 'quotation'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        })
        .from(target)
        .save();

      target.remove();
    } catch (err) {
      console.error(err);
      window.alert('Unable to download quotation PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold text-brandCharcoal">{quotation.quoteNumber}</p>
            <p className="text-sm text-gray-500">{quotation.clientSnapshot?.legalName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-brandMuted p-4">
            <p className="text-sm font-semibold text-gray-600">Status</p>
            <p className="text-lg font-semibold text-brandCharcoal">{quotation.status}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`rounded-full border px-3 py-1 ${
                    status === quotation.status ? 'border-brandPrimary text-brandPrimary' : 'border-gray-200 text-gray-600'
                  }`}
                  onClick={() => onStatusChange(quotation, status as Quotation['status'])}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-brandMuted p-4">
            <p className="text-sm font-semibold text-gray-600">Dates</p>
            <div className="mt-2 space-y-1 text-sm text-brandCharcoal">
              <p>Issue: {renderDate(quotation.issueDate)}</p>
              <p>Valid until: {renderDate(quotation.validUntil)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-lg font-semibold text-brandCharcoal">Client snapshot ({quotation.clientMode})</p>
          <div className="mt-2 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
            <p>Legal name: {quotation.clientSnapshot?.legalName}</p>
            {quotation.clientSnapshot?.brandName && <p>Brand: {quotation.clientSnapshot.brandName}</p>}
            {quotation.clientSnapshot?.email && <p>Email: {quotation.clientSnapshot.email}</p>}
            {quotation.clientSnapshot?.phone && <p>Phone: {quotation.clientSnapshot.phone}</p>}
            <p>
              Address: {quotation.clientSnapshot?.billingAddress?.line1},{' '}
              {quotation.clientSnapshot?.billingAddress?.city}
            </p>
            <p>GST: {quotation.clientSnapshot?.gstRegistered ? quotation.clientSnapshot.gstin || 'Registered' : 'Not registered'}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-brandCharcoal">Items</p>
            <p className="text-sm text-gray-500">Stored snapshots</p>
          </div>
          <div className="mt-3 divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.itemId} className="grid gap-3 py-3 md:grid-cols-[2fr_1fr_1fr]">
                <div>
                  <p className="font-semibold text-brandCharcoal">{item.nameSnapshot}</p>
                  {item.descriptionSnapshot && <p className="text-sm text-gray-500">{item.descriptionSnapshot}</p>}
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    {item.quantity} × {item.unitLabelSnapshot}
                  </p>
                  <p>Rate: {item.rateSnapshot}</p>
                  <p>GST: {item.gstRateSnapshot}%</p>
                </div>
                <div className="text-right text-sm font-semibold text-brandCharcoal">
                  <p>Subtotal: {item.lineSubTotal.toFixed(2)}</p>
                  <p>Tax: {item.lineTax.toFixed(2)}</p>
                  <p>Total: {item.lineTotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-brandMuted p-3 text-sm font-semibold text-brandCharcoal">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{quotation.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>{quotation.taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Grand total</span>
              <span>{quotation.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-600">Notes</p>
            <p className="text-sm text-gray-700">{quotation.notes || '—'}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-600">Terms</p>
            <p className="text-sm text-gray-700">{quotation.terms || '—'}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quotation.status === 'Draft' && (
            <button
              type="button"
              onClick={() => onEdit(quotation)}
              className="rounded-full bg-brandPrimary px-4 py-2 text-sm font-semibold text-white"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => onDuplicate(quotation)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brandCharcoal"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => onArchiveToggle(quotation)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brandCharcoal"
          >
            {quotation.isArchived ? 'Restore' : 'Archive'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(quotation)}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brandCharcoal disabled:cursor-not-allowed disabled:opacity-70"
          >
            {downloading ? 'Downloading…' : 'Download'}
          </button>
          <button
            type="button"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brandCharcoal"
            disabled
          >
            Convert to Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
