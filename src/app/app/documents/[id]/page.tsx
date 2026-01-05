"use client";

import { finalizeDocument, listDocuments, recordPayment, voidDocument } from "@/lib/firebase/firestore";
import { Document, Payment } from "@/lib/types";
import { formatDate } from "@/lib/utils/finance";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<Payment>({ amount: 0, documentId: "", mode: "UPI", paidAt: new Date().toISOString() });

  useEffect(() => {
    listDocuments()
      .then((docs) => setDoc(docs.find((d) => d.id === params.id) || null))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const finalize = async () => {
    if (!doc) return;
    await finalizeDocument(doc.id!);
    router.refresh();
  };

  const voidInvoice = async () => {
    if (!doc) return;
    await voidDocument(doc.id!, "Client requested void");
    router.refresh();
  };

  const addPayment = async () => {
    if (!doc) return;
    await recordPayment(doc.id!, { ...payment, documentId: doc.id! });
    router.refresh();
  };

  if (loading) return <p>Loading…</p>;
  if (error || !doc) return <p className="text-red-600">Document not found</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase text-slate-500">{doc.type}</p>
          <h1 className="text-2xl font-semibold text-slate-800">{doc.number || "Draft"}</h1>
          <p className="text-sm text-slate-500">Status: {doc.status}</p>
        </div>
        <div className="flex gap-2">
          {doc.status === "DRAFT" && (
            <button onClick={finalize} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
              Finalize
            </button>
          )}
          {doc.status !== "VOID" && doc.status !== "DRAFT" && (
            <button onClick={voidInvoice} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700">
              Void
            </button>
          )}
          <a
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            href={`/api/documents/${doc.id}/pdf`}
            target="_blank"
            rel="noreferrer"
          >
            Generate PDF
          </a>
        </div>
      </div>

      <Card title="Parties">
        <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-700">
          <div>
            <p className="font-semibold">Seller</p>
            <p>{doc.sellerSnapshot.legalName}</p>
            <p>{doc.sellerSnapshot.address?.line1}</p>
            {doc.sellerSnapshot.gstin && <p>GSTIN: {doc.sellerSnapshot.gstin}</p>}
          </div>
          <div>
            <p className="font-semibold">Client</p>
            <p>{doc.clientSnapshot.name}</p>
            {doc.clientSnapshot.gstin && <p>GSTIN: {doc.clientSnapshot.gstin}</p>}
          </div>
        </div>
      </Card>

      <Card title="Line items">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Title</th>
              <th>Qty</th>
              <th>Rate</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doc.lineItems.map((line, idx) => (
              <tr key={idx}>
                <td className="py-2">{line.title}</td>
                <td>{line.qty}</td>
                <td>{line.rate}</td>
                <td className="text-right">{(line.qty * line.rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Totals">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="flex justify-between"><span>Issue date</span><span>{formatDate(doc.issueDate)}</span></p>
            {doc.dueDate && (
              <p className="flex justify-between"><span>Due date</span><span>{formatDate(doc.dueDate)}</span></p>
            )}
            <p className="flex justify-between"><span>Sub total</span><span>{doc.totals.subTotal.toFixed(2)}</span></p>
            <p className="flex justify-between"><span>Tax</span><span>{doc.totals.taxTotal.toFixed(2)}</span></p>
            <p className="flex justify-between font-semibold">
              <span>Grand total</span>
              <span>{doc.totals.grandTotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between text-emerald-700">
              <span>Paid</span>
              <span>{doc.totals.amountPaid.toFixed(2)}</span>
            </p>
            <p className="flex justify-between text-red-700">
              <span>Balance</span>
              <span>{doc.totals.amountDue.toFixed(2)}</span>
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Record payment</p>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Amount"
              value={payment.amount}
              onChange={(e) => setPayment({ ...payment, amount: Number(e.target.value) })}
            />
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={payment.mode}
              onChange={(e) => setPayment({ ...payment, mode: e.target.value as Payment["mode"] })}
            >
              <option value="UPI">UPI</option>
              <option value="BANK">Bank</option>
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
            <button onClick={addPayment} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
              Add payment
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
