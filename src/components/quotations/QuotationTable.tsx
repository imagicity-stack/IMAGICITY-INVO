'use client';

import { Quotation } from '../../lib/quotations/quotationTypes';

interface Props {
  quotations: Quotation[];
  loading: boolean;
  search: string;
  onSearch: (value: string) => void;
  statusFilter: Quotation['status'] | 'All';
  onStatusFilter: (value: Quotation['status'] | 'All') => void;
  includeArchived: boolean;
  onIncludeArchived: (value: boolean) => void;
  onAdd: () => void;
  onSelect: (quote: Quotation) => void;
}

export default function QuotationTable({
  quotations,
  loading,
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  includeArchived,
  onIncludeArchived,
  onAdd,
  onSelect,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-brandCharcoal">Quotations</p>
          <p className="text-sm text-gray-500">Track drafts, sent quotes, and client decisions.</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full bg-brandPrimary px-5 py-2 text-sm font-semibold text-white shadow"
        >
          Add Quotation
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <input
          className="flex-1 rounded-2xl border border-gray-200 bg-brandMuted px-3 py-2 text-sm"
          placeholder="Search by quote number or client"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select
          className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value as Quotation['status'] | 'All')}
        >
          {['All', 'Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted'].map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-brandPrimary focus:ring-brandPrimary"
            checked={includeArchived}
            onChange={(e) => onIncludeArchived(e.target.checked)}
          />
          Show archived
        </label>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="grid grid-cols-7 gap-3 border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-600">
          <span>Quote No</span>
          <span>Client Name</span>
          <span>Issue Date</span>
          <span>Valid Until</span>
          <span>Status</span>
          <span>Total</span>
          <span>Actions</span>
        </div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-gray-500">Loading quotations…</p>
        ) : quotations.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">No quotations found.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {quotations.map((quote) => (
              <div
                key={quote.quoteId}
                className="grid grid-cols-7 gap-3 px-4 py-3 text-sm hover:bg-brandMuted/50"
                onClick={() => onSelect(quote)}
              >
                <span className="font-semibold text-brandCharcoal">{quote.quoteNumber}</span>
                <span>{quote.clientSnapshot?.legalName}</span>
                <span>{quote.issueDate ? new Date((quote.issueDate as any).toDate?.() || quote.issueDate).toLocaleDateString() : '—'}</span>
                <span>
                  {quote.validUntil
                    ? new Date((quote.validUntil as any).toDate?.() || quote.validUntil).toLocaleDateString()
                    : '—'}
                </span>
                <span>
                  <span className="badge bg-brandSecondary/30 text-brandCharcoal">{quote.status}</span>
                </span>
                <span className="font-semibold text-brandCharcoal">{quote.grandTotal.toFixed(2)}</span>
                <span>
                  <button
                    type="button"
                    className="text-sm font-semibold text-brandPrimary underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(quote);
                    }}
                  >
                    View
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
