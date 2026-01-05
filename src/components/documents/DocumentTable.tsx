"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { canFinalize, canMarkPaid, canVoid, formatCurrency } from "@/lib/documents";
import { DocumentRecord } from "@/types/documents";
import { StatusBadge } from "./StatusBadge";

interface DocumentTableProps {
  documents: DocumentRecord[];
  onRefresh?: () => void;
}

export function DocumentTable({ documents, onRefresh }: DocumentTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (
    record: DocumentRecord,
    status: DocumentRecord["status"],
    extra: Partial<DocumentRecord> = {}
  ) => {
    if (!record.id) return;
    setLoadingId(record.id);
    try {
      await updateDoc(doc(db, "documents", record.id), {
        status,
        ...extra,
      });
      onRefresh?.();
    } finally {
      setLoadingId(null);
    }
  };

  const downloadPdf = async (record: DocumentRecord) => {
    setLoadingId(record.id ?? null);
    try {
      const response = await fetch("/api/documents/pdf", {
        method: "POST",
        body: JSON.stringify(record),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${record.documentNumber}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Pipeline</p>
          <h3 className="text-xl font-bold text-[color:var(--brand-red)]">Invoices & quotations</h3>
        </div>
        <div className="rounded-full bg-[color:var(--brand-yellow)] px-4 py-2 text-xs font-bold text-neutral-900">
          Draft → Finalized → Paid / Void
        </div>
      </div>
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--card)] text-left text-xs font-semibold uppercase text-neutral-600">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((record) => (
              <tr key={record.id} className="border-t border-neutral-200 hover:bg-[color:var(--card)]">
                <td className="px-4 py-3">
                  <div className="font-semibold text-neutral-900">{record.title}</div>
                  <div className="text-xs text-neutral-600">{record.documentNumber} · {record.kind}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-neutral-900">{record.client.name || "Unnamed client"}</div>
                  <div className="text-xs text-neutral-600">{record.client.email}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                <td className="px-4 py-3 font-semibold text-neutral-900">{formatCurrency(record.total, record.currency)}</td>
                <td className="px-4 py-3 text-xs text-neutral-700">
                  <div>Issued: {record.issueDate}</div>
                  <div>Due: {record.dueDate}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <button
                      disabled={!canFinalize(record) || loadingId === record.id}
                      onClick={() => updateStatus(record, "open", { finalizedAt: Date.now() })}
                      className="rounded-full bg-[color:var(--brand-yellow)] px-3 py-2 text-neutral-900 disabled:opacity-50"
                    >
                      Finalize
                    </button>
                    <button
                      disabled={!canMarkPaid(record) || loadingId === record.id}
                      onClick={() => updateStatus(record, "paid", { paidAt: Date.now() })}
                      className="rounded-full border border-green-500 px-3 py-2 text-green-700 disabled:opacity-50"
                    >
                      Mark paid
                    </button>
                    <button
                      disabled={!canVoid(record) || loadingId === record.id}
                      onClick={() =>
                        updateStatus(record, "void", {
                          voidedAt: Date.now(),
                          voidReason: record.voidReason ?? "Voided by admin",
                        })
                      }
                      className="rounded-full border border-[color:var(--brand-red)] px-3 py-2 text-[color:var(--brand-red)] disabled:opacity-50"
                    >
                      Void
                    </button>
                    <button
                      disabled={loadingId === record.id}
                      onClick={() => downloadPdf(record)}
                      className="rounded-full border border-neutral-300 px-3 py-2 text-neutral-800 disabled:opacity-50"
                    >
                      PDF
                    </button>
                  </div>
                  {record.status !== "draft" && (
                    <p className="mt-2 text-[11px] text-neutral-600">
                      Finalized docs are immutable. Void to preserve audit trail.
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
