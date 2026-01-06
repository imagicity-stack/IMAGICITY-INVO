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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-brandCharcoal">{initialData ? 'Edit quotation' : 'New quotation'}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700"
          >
            Close
          </button>
        </div>

        <div className="mt-4">
          <QuotationForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} submitting={submitting} />
        </div>
      </div>
    </div>
  );
}
