'use client';

import { useCallback, useEffect, useState } from 'react';
import InvoiceDetailDrawer from './InvoiceDetailDrawer';
import InvoiceForm from './InvoiceForm';
import InvoicePaymentModal from './InvoicePaymentModal';
import InvoiceTable from './InvoiceTable';
import {
  createInvoice,
  getInvoiceById,
  getInvoiceItems,
  getInvoicePayments,
  listInvoices,
  recordInvoicePayment,
  toggleArchiveInvoice,
  updateInvoice,
} from '../../lib/invoices/invoiceService';
import { Invoice, InvoiceItem, InvoiceItemPayload, InvoicePayload, InvoicePayment } from '../../lib/invoices/invoiceTypes';
import { fetchClients } from '../../../lib/clients/clientService';
import { Client } from '../../../lib/clients/clientTypes';
import { listServices } from '../../lib/services/serviceService';
import { Service } from '../../lib/services/serviceTypes';
import { listQuotations } from '../../lib/quotations/quotationService';
import { Quotation } from '../../lib/quotations/quotationTypes';
import renderInvoiceHtml from './InvoicePdfTemplate';

export default function InvoiceSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'All'>('All');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [detailItems, setDetailItems] = useState<InvoiceItem[]>([]);
  const [detailPayments, setDetailPayments] = useState<InvoicePayment[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<any | undefined>(undefined);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listInvoices({ search, status: statusFilter, includeArchived, overdueOnly });
      setInvoices(data);
    } catch (err) {
      console.error(err);
      setToast('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [includeArchived, overdueOnly, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadInvoices]);

  useEffect(() => {
    fetchClients({ includeArchived: true }).then(setClients).catch(console.error);
    listServices({ includeArchived: true }).then(setServices).catch(console.error);
    listQuotations({ includeArchived: false, status: 'All' } as any).then(setQuotations).catch(console.error);
  }, []);

  const openDetail = async (invoice: Invoice) => {
    setDetailInvoice(invoice);
    setDetailOpen(true);
    const [items, payments] = await Promise.all([getInvoiceItems(invoice.invoiceId), getInvoicePayments(invoice.invoiceId)]);
    setDetailItems(items || []);
    setDetailPayments(payments || []);
  };

  const handleSave = async (payload: InvoicePayload, items: InvoiceItemPayload[]) => {
    setSubmitting(true);
    try {
      if (payload.invoiceId) {
        await updateInvoice(payload.invoiceId, payload, items);
        setToast('Invoice updated');
      } else {
        await createInvoice(payload, items);
        setToast('Invoice created');
      }
      setFormOpen(false);
      await loadInvoices();
    } catch (err) {
      console.error(err);
      setToast('Unable to save invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!detailInvoice) return;
    const items = await getInvoiceItems(detailInvoice.invoiceId);
    const issueDate = (detailInvoice.issueDate as any)?.toDate ? (detailInvoice.issueDate as any).toDate() : (detailInvoice.issueDate as any);
    const dueDate = (detailInvoice.dueDate as any)?.toDate ? (detailInvoice.dueDate as any).toDate() : (detailInvoice.dueDate as any);
    setFormInitial({ ...detailInvoice, issueDate, dueDate, items });
    setFormOpen(true);
  };

  const handleArchiveToggle = async () => {
    if (!detailInvoice) return;
    await toggleArchiveInvoice(detailInvoice.invoiceId, !detailInvoice.isArchived);
    setToast(detailInvoice.isArchived ? 'Invoice restored' : 'Invoice archived');
    await loadInvoices();
  };

  const handlePayment = async (payment: any) => {
    if (!detailInvoice) return;
    await recordInvoicePayment(detailInvoice.invoiceId, payment);
    const invoice = await getInvoiceById(detailInvoice.invoiceId);
    const payments = await getInvoicePayments(detailInvoice.invoiceId);
    setDetailInvoice(invoice);
    setDetailPayments(payments);
    setToast('Payment recorded');
    loadInvoices();
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

      <InvoiceTable
        invoices={invoices}
        loading={loading}
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        includeArchived={includeArchived}
        onIncludeArchived={setIncludeArchived}
        overdueOnly={overdueOnly}
        onOverdueOnly={setOverdueOnly}
        onAdd={() => {
          setFormInitial(undefined);
          setFormOpen(true);
        }}
        onSelect={openDetail}
        expandedId={detailInvoice?.invoiceId}
      />

      <InvoiceDetailDrawer
        invoice={detailInvoice}
        items={detailItems}
        payments={detailPayments}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEdit}
        onArchiveToggle={handleArchiveToggle}
        onPayment={() => setPaymentOpen(true)}
        onDownload={() => {
          if (!detailInvoice) return;
          const html = renderInvoiceHtml(detailInvoice, detailItems, detailPayments);
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${detailInvoice.invoiceNumber}.html`;
          a.click();
        }}
      />

      {formOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 p-4 overflow-y-auto">
          <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-2xl">
            <InvoiceForm
              initialData={formInitial}
              quotations={quotations}
              clients={clients}
              services={services}
              onSubmit={handleSave}
              onCancel={() => setFormOpen(false)}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      <InvoicePaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} onSubmit={handlePayment} />
    </section>
  );
}
