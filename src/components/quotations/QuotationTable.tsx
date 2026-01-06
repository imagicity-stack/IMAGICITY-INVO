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
  expandedId: string | null;
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
  expandedId,
}: Props) {
  const renderDate = (value: any) => {
    if (!value) return '—';
    const parsed = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
  };

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

      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap gap-3">
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

        {loading ? (
          <p className="px-1 py-6 text-sm text-gray-500">Loading quotations…</p>
        ) : quotations.length === 0 ? (
          <p className="px-1 py-6 text-sm text-gray-500">No quotations found.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quotations.map((quote) => {
              const isExpanded = expandedId === quote.quoteId;
              return (
                <div
                  key={quote.quoteId}
                  className={`cursor-pointer rounded-2xl border border-gray-100 bg-brandMuted/50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow ${
                    isExpanded ? 'ring-2 ring-brandPrimary/40' : ''
                  }`}
                  onClick={() => onSelect(quote)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-brandCharcoal">{quote.quoteNumber}</p>
                      <p className="text-sm text-gray-600">{quote.clientSnapshot?.legalName || 'Unknown client'}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brandCharcoal">
                      {quote.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <p>Issue: {renderDate(quote.issueDate)}</p>
                    <p>Valid: {renderDate(quote.validUntil)}</p>
                    <p className="col-span-2">Total: ₹{quote.grandTotal.toFixed(2)}</p>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 space-y-2 rounded-xl bg-white p-3 text-sm text-gray-700">
                      <p className="font-semibold text-brandCharcoal">Client snapshot</p>
                      <p>{quote.clientSnapshot?.brandName || quote.clientSnapshot?.legalName}</p>
                      <p>{quote.clientSnapshot?.email}</p>
                      <p>{quote.clientSnapshot?.phone}</p>
                      <p className="text-gray-600">Notes: {quote.notes || '—'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
