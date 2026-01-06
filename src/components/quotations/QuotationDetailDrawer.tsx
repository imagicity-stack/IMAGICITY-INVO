'use client';

import { useState } from 'react';
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

  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null) return '—';
    return `${quotation.currency || ''} ${Number(value).toFixed(2)}`.trim();
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

  const buildPrintableMarkup = () => {
    const issueDate = renderDate(quotation.issueDate);
    const validUntil = renderDate(quotation.validUntil);

    const itemRows = items
      .map(
        (item) => `
        <div class="row">
          <div class="cell name">${item.nameSnapshot}</div>
          <div class="cell center">${item.quantity} × ${item.unitLabelSnapshot}</div>
          <div class="cell right">${formatCurrency(item.rateSnapshot)}</div>
          <div class="cell right">${item.gstRateSnapshot}%</div>
          <div class="cell right">${formatCurrency(item.lineTotal)}</div>
        </div>`
      )
      .join('');

    return `
      <div class="quote-pdf">
        <style>
          * { box-sizing: border-box; }
          body, .quote-pdf { margin: 0; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #e8ecff; }
          .quote-pdf { width: 210mm; min-height: 297mm; padding: 32px; background: linear-gradient(180deg,#0f172a 0%,#0b1224 100%); position: relative; }
          .badge { position: absolute; top: 24px; right: 24px; padding: 6px 12px; border-radius: 999px; background: linear-gradient(90deg,#38bdf8,#6366f1); font-weight: 700; font-size: 12px; }
          .brand { display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #e2e8f0; }
          .brand h1 { margin: 0; font-size: 26px; letter-spacing: 1px; text-transform: uppercase; }
          .label { color: #94a3b8; font-size: 12px; letter-spacing: 0.4px; text-transform: uppercase; }
          .muted { color: #cbd5e1; font-size: 14px; margin: 2px 0; }
          .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(148,163,184,0.25); border-radius: 16px; padding: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.35); }
          .two-col { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); }
          .quote-header { display: flex; justify-content: space-between; align-items: center; margin: 18px 0; }
          .quote-title { font-size: 20px; font-weight: 700; margin: 0; color: #f8fafc; }
          .table { margin-top: 12px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(148,163,184,0.35); }
          .row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; background: rgba(148,163,184,0.06); }
          .row:nth-child(even) { background: rgba(148,163,184,0.12); }
          .header { background: linear-gradient(90deg,#38bdf8,#6366f1); color: #0f172a; font-weight: 700; }
          .cell { padding: 12px 14px; font-size: 13px; color: inherit; }
          .name { font-weight: 600; color: #f8fafc; }
          .center { text-align: center; }
          .right { text-align: right; }
          .totals { margin-top: 18px; display: flex; justify-content: flex-end; }
          .totals .summary { width: 320px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(148,163,184,0.35); }
          .totals .line { display: flex; justify-content: space-between; padding: 12px 14px; background: rgba(148,163,184,0.06); color: #e2e8f0; }
          .totals .line:nth-child(2n) { background: rgba(148,163,184,0.12); }
          .totals .line.total { background: linear-gradient(90deg,#38bdf8,#6366f1); color: #0f172a; font-weight: 800; font-size: 16px; }
          .section-title { font-size: 14px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 6px; }
          .footer { margin-top: 28px; display: grid; gap: 16px; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); }
          .footer-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(148,163,184,0.25); border-radius: 16px; padding: 14px; color: #e2e8f0; min-height: 120px; }
        </style>

        <span class="badge">Quotation</span>

        <div class="brand">
          <h1>Imagicity</h1>
          <div style="text-align:right;">
            <p class="section-title" style="margin-bottom:4px;">Prepared By</p>
            <p class="quote-title" style="font-size:16px;">${quotation.clientSnapshot?.brandName || 'Sales Team'}</p>
            <p class="muted">${quotation.clientSnapshot?.email || ''}</p>
          </div>
        </div>

        <div class="quote-header">
          <div>
            <p class="section-title">Quotation</p>
            <p class="quote-title">${quotation.quoteNumber}</p>
            <p class="muted">Issue: ${issueDate}</p>
          </div>
          <div class="card" style="min-width:220px;">
            <p class="section-title">Client</p>
            <p class="quote-title" style="font-size:16px;">${quotation.clientSnapshot?.legalName}</p>
            <p class="muted">${quotation.clientSnapshot?.email || ''}</p>
            <p class="muted">${quotation.clientSnapshot?.phone || ''}</p>
          </div>
        </div>

        <div class="two-col">
          <div class="card">
            <p class="section-title">Bill To</p>
            <p class="muted">${quotation.clientSnapshot?.billingAddress?.line1 || ''}</p>
            <p class="muted">${quotation.clientSnapshot?.billingAddress?.city || ''}</p>
            <p class="muted">${quotation.clientSnapshot?.billingAddress?.state || ''} ${quotation.clientSnapshot?.billingAddress?.pincode || ''}</p>
            <p class="muted">${quotation.clientSnapshot?.billingAddress?.country || ''}</p>
          </div>
          <div class="card">
            <p class="section-title">Validity</p>
            <p class="muted">Valid until: ${validUntil}</p>
            <p class="muted">Status: ${quotation.status}</p>
          </div>
        </div>

        <div class="table">
          <div class="row header">
            <div class="cell">Item</div>
            <div class="cell center">Qty</div>
            <div class="cell right">Rate</div>
            <div class="cell right">Tax</div>
            <div class="cell right">Total</div>
          </div>
          ${itemRows || '<div class="row"><div class="cell" style="grid-column: 1 / -1;">No items added</div></div>'}
        </div>

        <div class="totals">
          <div class="summary">
            <div class="line"><span>Subtotal</span><span>${formatCurrency(quotation.subTotal)}</span></div>
            <div class="line"><span>Tax</span><span>${formatCurrency(quotation.taxTotal)}</span></div>
            <div class="line total"><span>Grand Total</span><span>${formatCurrency(quotation.grandTotal)}</span></div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-card">
            <p class="section-title">Notes</p>
            <p class="muted">${quotation.notes || '—'}</p>
          </div>
          <div class="footer-card">
            <p class="section-title">Terms</p>
            <p class="muted">${quotation.terms || '—'}</p>
          </div>
        </div>
      </div>
    `;
  };

  const handleDownload = async () => {
    if (!quotation) return;
    setDownloading(true);
    try {
      const html2pdf = await loadHtml2Pdf();
      if (!html2pdf) throw new Error('Unable to load PDF generator');

      const wrapper = document.createElement('div');
      wrapper.innerHTML = buildPrintableMarkup();
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
