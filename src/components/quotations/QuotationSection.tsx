'use client';

import { useCallback, useEffect, useState } from 'react';
import QuotationDetailDrawer from './QuotationDetailDrawer';
import QuotationFormModal from './QuotationFormModal';
import QuotationTable from './QuotationTable';
import {
  addOrReplaceQuotationItems,
  createQuotation,
  duplicateQuotation,
  getQuotationById,
  getQuotationWithMeta,
  listQuotations,
  updateQuotation,
} from '../../lib/quotations/quotationService';
import { QuotationFormData } from '../../lib/quotations/quotationSchema';
import { Quotation, QuotationItem, QuotationItemPayload, QuotationPayload } from '../../lib/quotations/quotationTypes';

export default function QuotationSection() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Quotation['status'] | 'All'>('All');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [detailQuote, setDetailQuote] = useState<Quotation | null>(null);
  const [detailItems, setDetailItems] = useState<QuotationItem[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<Partial<QuotationFormData> | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listQuotations({ search, status: statusFilter, includeArchived });
      setQuotations(data);
    } catch (err) {
      console.error(err);
      setToast('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, includeArchived]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadQuotations();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadQuotations]);

  const handleSelect = async (quote: Quotation) => {
    setDetailQuote(quote);
    setDetailOpen(true);
    const items = await getQuotationById(quote.quoteId);
    setDetailItems(items || []);
  };

  const handleSave = async (payload: QuotationPayload, items: QuotationItemPayload[]) => {
    setSubmitting(true);
    try {
      if (payload.quoteId) {
        await updateQuotation(payload.quoteId, payload);
        await addOrReplaceQuotationItems(payload.quoteId, items);
        setToast('Quotation updated');
      } else {
        await createQuotation(payload, items);
        setToast('Quotation created');
      }
      setFormOpen(false);
      await loadQuotations();
    } catch (err) {
      console.error(err);
      setToast('Unable to save quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (quote: Quotation) => {
    try {
      const items = await getQuotationById(quote.quoteId);
      const issueDate = (quote.issueDate as any)?.toDate ? (quote.issueDate as any).toDate() : (quote.issueDate as any);
      const validUntil = (quote.validUntil as any)?.toDate ? (quote.validUntil as any).toDate() : (quote.validUntil as any);
      setFormInitial({ ...quote, issueDate, validUntil, items: items || [] });
      setFormOpen(true);
    } catch (err) {
      console.error(err);
      setToast('Unable to load quotation items');
    }
  };

  const handleDuplicate = async (quote: Quotation) => {
    try {
      await duplicateQuotation(quote.quoteId);
      setToast('Quotation duplicated as draft');
      loadQuotations();
    } catch (err) {
      console.error(err);
      setToast('Failed to duplicate quotation');
    }
  };

  const handleArchiveToggle = async (quote: Quotation) => {
    try {
      await updateQuotation(quote.quoteId, { isArchived: !quote.isArchived });
      setToast(quote.isArchived ? 'Quotation restored' : 'Quotation archived');
      loadQuotations();
    } catch (err) {
      console.error(err);
      setToast('Unable to update archive state');
    }
  };

  const handleStatusChange = async (quote: Quotation, status: Quotation['status']) => {
    try {
      await updateQuotation(quote.quoteId, { status });
      const updated = await getQuotationWithMeta(quote.quoteId);
      setDetailQuote(updated);
      setToast('Status updated');
      loadQuotations();
    } catch (err) {
      console.error(err);
      setToast('Unable to change status');
    }
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <section className="space-y-4">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-xl bg-brandPrimary px-4 py-2 text-sm font-semibold text-white shadow">
          {toast}
        </div>
      )}
      <QuotationTable
        quotations={quotations}
        loading={loading}
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        includeArchived={includeArchived}
        onIncludeArchived={setIncludeArchived}
        onAdd={() => {
          setFormInitial(undefined);
          setFormOpen(true);
        }}
        onSelect={handleSelect}
      />

      <QuotationDetailDrawer
        quotation={detailQuote}
        items={detailItems}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onArchiveToggle={handleArchiveToggle}
        onStatusChange={handleStatusChange}
      />

      <QuotationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={formInitial}
        onSubmit={handleSave}
        submitting={submitting}
      />
    </section>
  );
}
