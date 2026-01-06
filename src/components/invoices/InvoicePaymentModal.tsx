'use client';

import { useState } from 'react';
import { InvoicePaymentPayload } from '../../lib/invoices/invoiceTypes';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payment: InvoicePaymentPayload) => void;
}

export default function InvoicePaymentModal({ open, onClose, onSubmit }: Props) {
  const [amount, setAmount] = useState<number>(0);
  const [mode, setMode] = useState<InvoicePaymentPayload['mode']>('UPI');
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit({
      amount,
      mode,
      paymentDate: new Date(paymentDate),
      reference,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brandCharcoal">Record payment</h3>
          <button onClick={onClose} className="text-sm font-semibold text-gray-500">
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <label className="block text-xs font-semibold text-gray-700">
            Amount
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="block text-xs font-semibold text-gray-700">
            Mode
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            >
              {['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Online Gateway', 'Other'].map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-gray-700">
            Payment date
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="block text-xs font-semibold text-gray-700">
            Reference
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="block text-xs font-semibold text-gray-700">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-600">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-xl bg-brandPrimary px-4 py-2 text-sm font-semibold text-white"
          >
            Save payment
          </button>
        </div>
      </div>
    </div>
  );
}
