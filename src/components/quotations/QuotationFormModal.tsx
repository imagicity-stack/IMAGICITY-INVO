'use client';

import QuotationForm from './QuotationForm';
import { QuotationFormData } from '../../lib/quotations/quotationSchema';
import { QuotationItemPayload, QuotationPayload } from '../../lib/quotations/quotationTypes';

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<QuotationFormData>;
  onSubmit: (payload: QuotationPayload, items: QuotationItemPayload[]) => Promise<void>;
  submitting: boolean;
}

export default function QuotationFormModal({ open, onClose, initialData, onSubmit, submitting }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:py-8">
      <div className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <p className="text-2xl font-bold text-brandCharcoal">{initialData ? 'Edit quotation' : 'New quotation'}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700"
          >
            Close
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto px-6 py-4">
          <QuotationForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} submitting={submitting} />
        </div>
      </div>
    </div>
  );
}
