'use client';

import { Invoice } from '../../lib/invoices/invoiceTypes';

interface Props {
  invoices: Invoice[];
  loading?: boolean;
  search: string;
  onSearch: (value: string) => void;
  statusFilter: Invoice['status'] | 'All';
  onStatusFilter: (value: Invoice['status'] | 'All') => void;
  includeArchived: boolean;
  onIncludeArchived: (value: boolean) => void;
  overdueOnly: boolean;
  onOverdueOnly: (value: boolean) => void;
  onAdd: () => void;
  onSelect: (invoice: Invoice) => void;
  expandedId?: string | null;
}

export default function InvoiceTable({
  invoices,
  loading,
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  includeArchived,
  onIncludeArchived,
  overdueOnly,
  onOverdueOnly,
  onAdd,
  onSelect,
  expandedId,
}: Props) {
  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-brandCharcoal">Invoices</h2>
          <p className="text-sm text-gray-600">Track billing, payments and outstanding balances.</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-2xl bg-brandPrimary px-4 py-2 text-sm font-semibold text-white shadow"
        >
          Add Invoice
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by invoice no or client"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value as any)}
        >
          {['All', 'Draft', 'Issued', 'Partially Paid', 'Paid', 'Void', 'Overdue'].map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input type="checkbox" checked={overdueOnly} onChange={(e) => onOverdueOnly(e.target.checked)} />
          Overdue only
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input type="checkbox" checked={includeArchived} onChange={(e) => onIncludeArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="px-3 py-2">Invoice No</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Issue Date</th>
              <th className="px-3 py-2">Due Date</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Balance</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-gray-500">
                  Loading invoices...
                </td>
              </tr>
            )}
            {!loading && invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-gray-500">
                  No invoices yet
                </td>
              </tr>
            )}
            {!loading &&
              invoices.map((invoice) => {
                const issue = (invoice.issueDate as any)?.toDate ? (invoice.issueDate as any).toDate() : invoice.issueDate;
                const due = (invoice.dueDate as any)?.toDate ? (invoice.dueDate as any).toDate() : invoice.dueDate;
                return (
                  <tr
                    key={invoice.invoiceId}
                    className={`cursor-pointer border-t border-gray-100 hover:bg-brandMuted ${expandedId === invoice.invoiceId ? 'bg-brandMuted' : ''}`}
                    onClick={() => onSelect(invoice)}
                  >
                    <td className="px-3 py-2 font-semibold text-brandCharcoal">{invoice.invoiceNumber}</td>
                    <td className="px-3 py-2">{invoice.clientSnapshot?.legalName}</td>
                    <td className="px-3 py-2">{issue ? new Date(issue).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2">{due ? new Date(due).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2">
                      <span className="badge bg-brandPrimary/10 text-brandPrimary">{invoice.status}</span>
                    </td>
                    <td className="px-3 py-2 font-semibold">₹{invoice.grandTotal.toFixed(2)}</td>
                    <td className="px-3 py-2 font-semibold text-brandCharcoal">₹{invoice.balanceDue.toFixed(2)}</td>
                    <td className="px-3 py-2 text-brandPrimary">View</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
