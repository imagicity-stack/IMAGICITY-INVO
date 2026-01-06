'use client';

import { Invoice, InvoiceItem, InvoicePayment } from '../../lib/invoices/invoiceTypes';

interface Props {
  invoice: Invoice | null;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onPayment: () => void;
  onDownload: () => void;
}

export default function InvoiceDetailDrawer({ invoice, items, payments, open, onClose, onEdit, onArchiveToggle, onPayment, onDownload }: Props) {
  if (!invoice || !open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/20 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Invoice</p>
            <h3 className="text-2xl font-bold text-brandCharcoal">{invoice.invoiceNumber}</h3>
            <p className="text-sm text-gray-600">{invoice.clientSnapshot?.legalName}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onDownload} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-brandCharcoal">
              Download PDF
            </button>
            <button onClick={onEdit} className="rounded-xl bg-brandPrimary px-4 py-2 text-sm font-semibold text-white">
              Edit
            </button>
            <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-600">
              Close
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-brandMuted p-4">
            <p className="text-xs font-semibold text-gray-600">Billing snapshot</p>
            <p className="font-semibold text-brandCharcoal">{invoice.clientSnapshot.legalName}</p>
            {invoice.clientSnapshot.billingAddress && (
              <p className="text-sm text-gray-600">
                {invoice.clientSnapshot.billingAddress.line1}, {invoice.clientSnapshot.billingAddress.city}
              </p>
            )}
            <p className="mt-2 text-xs font-semibold text-gray-500">Status: {invoice.status}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-600">Totals</p>
            <p className="text-lg font-semibold text-brandCharcoal">Grand total: ₹{invoice.grandTotal.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Balance due: ₹{invoice.balanceDue.toFixed(2)}</p>
            <div className="mt-2 flex gap-2">
              <button onClick={onPayment} className="rounded-xl bg-brandSecondary/20 px-3 py-2 text-sm font-semibold text-brandCharcoal">
                Record payment
              </button>
              <button onClick={onArchiveToggle} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                {invoice.isArchived ? 'Restore' : 'Archive'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Rate</th>
                <th className="px-4 py-2">Tax</th>
                <th className="px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.itemId} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-semibold text-brandCharcoal">{item.nameSnapshot}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">₹{item.rateSnapshot.toFixed(2)}</td>
                  <td className="px-4 py-2">₹{item.lineTax.toFixed(2)}</td>
                  <td className="px-4 py-2 font-semibold">₹{item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length > 0 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-brandMuted p-4">
            <p className="text-sm font-semibold text-brandCharcoal">Payments</p>
            <ul className="mt-2 space-y-2 text-sm text-gray-700">
              {payments.map((payment) => (
                <li key={payment.paymentId} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                  <span>{payment.mode}</span>
                  <span className="font-semibold">₹{payment.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
