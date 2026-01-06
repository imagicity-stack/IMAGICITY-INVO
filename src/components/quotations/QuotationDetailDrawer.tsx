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

    const imagicityContact = {
      address: 'Hazaribagh, Jharkhand',
      email: 'connect@imagicity.in',
      phone: '9122289578',
      website: 'www.imagicity.in',
    };

    const resolveDiscount = () => {
      if (quotation.discountType === 'None') return 0;
      if (quotation.discountType === 'Percent') {
        return (quotation.subTotal * quotation.discountValue) / 100;
      }
      return quotation.discountValue;
    };

    const discountAmount = resolveDiscount();

    const itemRows = items
      .map(
        (item) => `
        <div class="row">
          <div class="cell name">
            <p class="title">${item.nameSnapshot}</p>
            <p class="description">${item.descriptionSnapshot || ''}</p>
          </div>
          <div class="cell center">${item.quantity} ${item.unitLabelSnapshot}</div>
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
          body, .quote-pdf { margin: 0; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #1f2937; }
          .quote-pdf { width: 210mm; min-height: 297mm; padding: 26mm 22mm; background: #f6f7fb; position: relative; }
          .page { background: #ffffff; border-radius: 16px; box-shadow: 0 12px 36px rgba(0,0,0,0.06); padding: 28px; min-height: 245mm; }
          .header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 4px solid #14b8a6; padding-bottom: 18px; }
          .brand { display: flex; flex-direction: column; gap: 4px; }
          .brand h1 { margin: 0; font-size: 26px; letter-spacing: 0.6px; color: #0f172a; }
          .brand p { margin: 0; color: #64748b; }
          .badge { align-self: flex-start; padding: 6px 12px; border-radius: 999px; background: linear-gradient(135deg,#14b8a6,#0ea5e9); color: #ffffff; font-weight: 700; font-size: 12px; letter-spacing: 0.5px; }
          .eyebrow { color: #14b8a6; letter-spacing: 1px; text-transform: uppercase; font-size: 11px; margin: 0; }
          .title { margin: 2px 0; font-weight: 700; color: #0f172a; }
          .muted { color: #475569; margin: 2px 0; font-size: 13px; }
          .section { margin-top: 18px; }
          .section h3 { margin: 0 0 6px; color: #0f172a; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 12px; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; background: #fff; }
          .label { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .table { margin-top: 12px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
          .row { display: grid; grid-template-columns: 2fr 0.8fr 0.9fr 0.8fr 1fr; border-bottom: 1px solid #e2e8f0; background: #ffffff; }
          .row:nth-child(even) { background: #f8fafc; }
          .row.header { background: linear-gradient(135deg,#14b8a6,#0ea5e9); color: #fff; font-weight: 700; }
          .cell { padding: 12px 14px; font-size: 13px; color: inherit; }
          .cell .description { margin: 4px 0 0; color: #64748b; font-weight: 400; font-size: 12px; }
          .center { text-align: center; }
          .right { text-align: right; }
          .summary { margin-top: 12px; display: flex; justify-content: flex-end; }
          .summary .totals { width: 340px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fff; }
          .summary .line { display: flex; justify-content: space-between; padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; }
          .summary .line:last-child { border-bottom: none; }
          .summary .highlight { background: linear-gradient(135deg,#14b8a6,#0ea5e9); color: #fff; font-weight: 800; font-size: 15px; }
          .notes-terms { display: grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap: 12px; margin-top: 14px; }
          .footer { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 12px; align-items: start; }
          .signature { border: 1px dashed #14b8a6; border-radius: 12px; padding: 12px; background: #ecfeff; color: #0f172a; }
          .signature button { margin-top: 10px; padding: 8px 12px; border-radius: 8px; border: none; background: #14b8a6; color: #fff; font-weight: 700; cursor: pointer; }
          .footer-meta { text-align: right; color: #475569; }
          .sticky-footer { position: absolute; bottom: 18px; left: 22mm; right: 22mm; display: flex; justify-content: space-between; color: #94a3b8; font-size: 12px; }
          .page-break { page-break-inside: avoid; }
        </style>

        <div class="page">
          <div class="header">
            <div class="brand">
              <p class="eyebrow">Quotation</p>
              <h1>Imagicity</h1>
              <p>${imagicityContact.address}</p>
              <p>${imagicityContact.email} • ${imagicityContact.phone}</p>
              <p>${imagicityContact.website}</p>
            </div>
            <div style="text-align:right;">
              <span class="badge">${quotation.status}</span>
              <p class="title" style="margin-top:10px;">${quotation.quoteNumber}</p>
              <p class="muted">Issue Date: ${issueDate}</p>
              <p class="muted">Valid Until: ${validUntil}</p>
            </div>
          </div>

          <div class="section grid">
            <div class="card">
              <p class="label">Client</p>
              <p class="title">${quotation.clientSnapshot?.legalName}</p>
              <p class="muted">${quotation.clientSnapshot?.email || ''}</p>
              <p class="muted">${quotation.clientSnapshot?.phone || ''}</p>
              <p class="muted">${quotation.clientSnapshot?.billingAddress?.line1 || ''}</p>
              <p class="muted">${quotation.clientSnapshot?.billingAddress?.city || ''}, ${quotation.clientSnapshot?.billingAddress?.state || ''} ${quotation.clientSnapshot?.billingAddress?.pincode || ''}</p>
            </div>
            <div class="card">
              <p class="label">Prepared By</p>
              <p class="title">${quotation.clientSnapshot?.brandName || 'Imagicity Team'}</p>
              <p class="muted">${imagicityContact.email}</p>
              <p class="muted">${imagicityContact.phone}</p>
            </div>
          </div>

          <div class="section">
            <h3>Quotation Items</h3>
            <div class="table">
              <div class="row header">
                <div class="cell">Item</div>
                <div class="cell center">Qty</div>
                <div class="cell right">Rate</div>
                <div class="cell right">GST</div>
                <div class="cell right">Amount</div>
              </div>
              ${itemRows || '<div class="row"><div class="cell" style="grid-column: 1 / -1;">No items added</div></div>'}
            </div>
          </div>

          <div class="section summary">
            <div class="totals">
              <div class="line"><span>Subtotal</span><span>${formatCurrency(quotation.subTotal)}</span></div>
              <div class="line"><span>GST</span><span>${formatCurrency(quotation.taxTotal)}</span></div>
              <div class="line"><span>Discount (${quotation.discountType}${quotation.discountType === 'Percent' ? ` ${quotation.discountValue}%` : ''})</span><span>- ${formatCurrency(discountAmount)}</span></div>
              <div class="line highlight"><span>Grand Total</span><span>${formatCurrency(quotation.grandTotal)}</span></div>
            </div>
          </div>

          <div class="section notes-terms">
            <div class="card page-break">
              <p class="label">Notes</p>
              <p class="muted">${quotation.notes || '—'}</p>
            </div>
            <div class="card page-break">
              <p class="label">Terms</p>
              <p class="muted">${quotation.terms || '—'}</p>
            </div>
          </div>

          <div class="footer">
            <div class="signature">
              <p class="title">Signature (Imagicity)</p>
              <p class="muted">Authorized signatory for Imagicity</p>
              <button type="button">Tap to Sign</button>
            </div>
            <div class="footer-meta">
              <p>Phone: ${imagicityContact.phone}</p>
              <p>Email: ${imagicityContact.email}</p>
              <p>Address: ${imagicityContact.address}</p>
            </div>
          </div>
        </div>

        <div class="sticky-footer">
          <span>${quotation.quoteNumber}</span>
          <span>Imagicity • ${imagicityContact.website}</span>
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
