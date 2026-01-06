'use client';

import ServiceForm from './ServiceForm';
import { Service } from '../../lib/services/serviceTypes';
import { ServiceInput } from '../../lib/services/serviceSchema';
import { ServiceCategory } from '../../lib/services/serviceTypes';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: Service;
  onClose: () => void;
  onSubmit: (data: ServiceInput) => Promise<void>;
  submitting?: boolean;
  categories?: ServiceCategory[];
  onAddCategory?: (name: string) => Promise<void>;
}

export default function ServiceFormModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  submitting,
  categories,
  onAddCategory,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          aria-label="Close service form"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-brandCharcoal shadow"
        >
          Close
        </button>
        <div className="card bg-white shadow-2xl">
          <ServiceForm
            mode={mode}
            initialData={initialData}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitting={submitting}
            categories={categories}
            onAddCategory={onAddCategory}
          />
        </div>
      </div>
    </div>
  );
}
