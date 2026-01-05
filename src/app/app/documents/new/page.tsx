"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Document, DocumentType, LineItem, TaxDetail } from "@/lib/types";
import { computeLineTotals } from "@/lib/utils/finance";
import { createDocument, loadSettings } from "@/lib/firebase/firestore";

const emptyLine: LineItem = {
  title: "Service",
  qty: 1,
  rate: 0,
  discountType: "NONE",
  discountValue: 0,
  taxable: true,
};

export default function NewDocumentPage() {
  const params = useSearchParams();
  const router = useRouter();
  const type = (params.get("type") as DocumentType) || "invoice";
  const [document, setDocument] = useState<Document | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings().then((data) => {
      const baseTax: TaxDetail = {
        enabled: Boolean(data?.gstin),
        mode: "CGST_SGST",
        rates: { cgst: data?.defaultTaxRates?.cgst || 0, sgst: data?.defaultTaxRates?.sgst || 0, igst: data?.defaultTaxRates?.igst || 0 },
        amounts: { cgst: 0, sgst: 0, igst: 0 },
        placeOfSupplyState: data?.placeOfSupplyDefault,
      };
      const newDoc: Document = {
        type,
        status: "DRAFT",
        issueDate: new Date().toISOString(),
        currency: data?.currency || "INR",
        clientId: "",
        clientSnapshot: { name: "", email: "" },
        sellerSnapshot: data || {
          legalName: "",
          brandName: "IMAGICITY",
          address: { line1: "" },
        },
        lineItems: [emptyLine],
        tax: baseTax,
        totals: computeLineTotals([emptyLine], baseTax),
        metadata: { createdAt: new Date().toISOString() },
      };
      setDocument(newDoc);
    });
  }, [type]);

  if (!document) return <p>Loading…</p>;

  const updateLine = (index: number, next: Partial<LineItem>) => {
    const updated = document.lineItems.map((line, i) => (i === index ? { ...line, ...next } : line));
    const totals = computeLineTotals(updated, document.tax);
    setDocument({ ...document, lineItems: updated, totals });
  };

  const updateTaxMode = (mode: TaxDetail["mode"]) => {
    const totals = computeLineTotals(document.lineItems, { ...document.tax, mode });
    setDocument({ ...document, tax: { ...document.tax, mode }, totals });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document.clientSnapshot?.name) return;
    setSaving(true);
    const id = await createDocument(document);
    router.push(`/app/documents/${id}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">New {type}</h1>
      <form className="space-y-4" onSubmit={submit}>
        <Card title="Client">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Client name</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={document.clientSnapshot?.name || ""}
                onChange={(e) => setDocument({ ...document, clientSnapshot: { ...document.clientSnapshot, name: e.target.value } })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={document.clientSnapshot?.email || ""}
                onChange={(e) => setDocument({ ...document, clientSnapshot: { ...document.clientSnapshot, email: e.target.value } })}
              />
            </div>
          </div>
        </Card>

        <Card title="Line items">
          <div className="space-y-3">
            {document.lineItems.map((line, idx) => (
              <div key={idx} className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-5">
                <input
                  className="col-span-2 rounded-md border border-slate-200 px-3 py-2"
                  value={line.title}
                  onChange={(e) => updateLine(idx, { title: e.target.value })}
                />
                <input
                  type="number"
                  className="rounded-md border border-slate-200 px-3 py-2"
                  value={line.qty}
                  onChange={(e) => updateLine(idx, { qty: Number(e.target.value) })}
                />
                <input
                  type="number"
                  className="rounded-md border border-slate-200 px-3 py-2"
                  value={line.rate}
                  onChange={(e) => updateLine(idx, { rate: Number(e.target.value) })}
                />
                <select
                  className="rounded-md border border-slate-200 px-3 py-2"
                  value={line.discountType}
                  onChange={(e) => updateLine(idx, { discountType: e.target.value as LineItem["discountType"] })}
                >
                  <option value="NONE">No discount</option>
                  <option value="FLAT">Flat</option>
                  <option value="PERCENT">Percent</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-semibold text-indigo-700"
              onClick={() => setDocument({ ...document, lineItems: [...document.lineItems, { ...emptyLine }] })}
            >
              + Add line
            </button>
          </div>
        </Card>

        <Card title="Tax and totals">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium">GST mode</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={document.tax.mode}
                onChange={(e) => updateTaxMode(e.target.value as TaxDetail["mode"]) }
              >
                <option value="NONE">GST disabled</option>
                <option value="CGST_SGST">CGST + SGST</option>
                <option value="IGST">IGST</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Place of supply</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={document.tax.placeOfSupplyState || ""}
                onChange={(e) => setDocument({ ...document, tax: { ...document.tax, placeOfSupplyState: e.target.value } })}
              />
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="flex justify-between"><span>Subtotal</span><span>{document.totals.subTotal.toFixed(2)}</span></p>
              <p className="flex justify-between"><span>Discounts</span><span>{document.totals.discountTotal.toFixed(2)}</span></p>
              <p className="flex justify-between"><span>Tax</span><span>{document.totals.taxTotal.toFixed(2)}</span></p>
              <p className="flex justify-between font-semibold text-slate-900">
                <span>Grand total</span>
                <span>{document.totals.grandTotal.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow"
          >
            Create {type}
          </button>
        </div>
      </form>
    </div>
  );
}
