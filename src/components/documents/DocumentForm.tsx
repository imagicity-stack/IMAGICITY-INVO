"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { calculateTotals, formatCurrency } from "@/lib/documents";
import { DocumentRecord, DocumentKind, LineItem } from "@/types/documents";
import { v4 as uuid } from "uuid";

const defaultIssuer = {
  name: "Imagicity",
  email: "accounts@imagicity.in",
  address: "Imagicity, Industrial Area, Bengaluru",
  gstin: "29ABCDE1234F2Z5",
  state: "Karnataka",
};

const emptyClient = { name: "", email: "", address: "", gstin: "", state: "" };

function buildStarterDocument(userId: string, brandLogoUrl?: string): DocumentRecord {
  const today = new Date();
  const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    title: "New invoice",
    documentNumber: `IM-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${Math.floor(Math.random() * 999)}`,
    kind: "invoice",
    status: "draft",
    currency: "INR",
    issueDate: today.toISOString().slice(0, 10),
    dueDate: inSevenDays.toISOString().slice(0, 10),
    client: { ...emptyClient },
    issuer: { ...defaultIssuer },
    items: [
      { id: uuid(), description: "Creative retainer", quantity: 1, rate: 50000, hsnSac: "9983", gstRate: 18 },
    ],
    notes: "Payment via bank transfer. Late fee 2% after due date.",
    gst: {
      enabled: true,
      gstin: defaultIssuer.gstin,
      placeOfSupply: "Karnataka",
      taxRate: 18,
      narration: "Input tax credit available subject to payment within due date.",
    },
    createdBy: userId,
    createdAt: Date.now(),
    subtotal: 0,
    taxTotal: 0,
    total: 0,
    brandLogoUrl,
  };
}

interface DocumentFormProps {
  userId: string;
  onSaved?: () => void;
  brandLogoUrl?: string;
}

export function DocumentForm({ userId, onSaved, brandLogoUrl }: DocumentFormProps) {
  const [record, setRecord] = useState<DocumentRecord>(() => buildStarterDocument(userId, brandLogoUrl));
  const [saving, setSaving] = useState(false);
  const totals = useMemo(
    () => calculateTotals(record.items, record.gst.enabled, record.gst.taxRate ?? 0),
    [record.items, record.gst.enabled, record.gst.taxRate]
  );

  const updateItem = (id: string, key: keyof LineItem, value: string | number) => {
    setRecord((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [key]: key === "description" || key === "hsnSac" ? value : Number(value) } : item
      ),
    }));
  };

  const addItem = () => {
    setRecord((prev) => ({
      ...prev,
      items: [...prev.items, { id: uuid(), description: "", quantity: 1, rate: 0, gstRate: prev.gst.taxRate ?? 0 }],
    }));
  };

  const removeItem = (id: string) => {
    setRecord((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  };

  const handleSubmit = async (kind: DocumentKind = "invoice") => {
    setSaving(true);
    try {
      const payload: DocumentRecord = {
        ...record,
        ...totals,
        kind,
        createdAt: Date.now(),
        status: "draft",
        brandLogoUrl,
      };
      await addDoc(collection(db, "documents"), payload);
      setRecord(buildStarterDocument(userId, brandLogoUrl));
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (brandLogoUrl) {
      setRecord((prev) => ({ ...prev, brandLogoUrl }));
    }
  }, [brandLogoUrl]);

  return (
    <section className="card-surface rounded-2xl p-6 text-sm shadow-lg">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Create</p>
          <h3 className="text-2xl font-bold text-[color:var(--brand-red)]">Invoice & quotation builder</h3>
          <p className="text-neutral-700">Save drafts, then finalize when you are ready to bill or share.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-700">
          <span className="h-2 w-2 rounded-full bg-[color:var(--brand-yellow)]" />
          GST ready
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700">Document title</label>
            <input
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 focus:border-[color:var(--brand-red)] focus:outline-none"
              value={record.title}
              onChange={(e) => setRecord({ ...record, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Document number</label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                value={record.documentNumber}
                onChange={(e) => setRecord({ ...record, documentNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Currency</label>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                value={record.currency}
                onChange={(e) => setRecord({ ...record, currency: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Issue date</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                value={record.issueDate}
                onChange={(e) => setRecord({ ...record, issueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Due date</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                value={record.dueDate}
                onChange={(e) => setRecord({ ...record, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-neutral-700">Bill to (client)</p>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                placeholder="Client name"
                value={record.client.name}
                onChange={(e) => setRecord({ ...record, client: { ...record.client, name: e.target.value } })}
              />
              <input
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                placeholder="Client email"
                value={record.client.email}
                onChange={(e) => setRecord({ ...record, client: { ...record.client, email: e.target.value } })}
              />
              <textarea
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                placeholder="Client address"
                value={record.client.address}
                onChange={(e) => setRecord({ ...record, client: { ...record.client, address: e.target.value } })}
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                  placeholder="GSTIN"
                  value={record.client.gstin}
                  onChange={(e) => setRecord({ ...record, client: { ...record.client, gstin: e.target.value } })}
                />
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                  placeholder="State"
                  value={record.client.state}
                  onChange={(e) => setRecord({ ...record, client: { ...record.client, state: e.target.value } })}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-700">Issued by (Imagicity)</p>
              <input
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                placeholder="Issuer name"
                value={record.issuer.name}
                onChange={(e) => setRecord({ ...record, issuer: { ...record.issuer, name: e.target.value } })}
              />
              <input
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                placeholder="Issuer email"
                value={record.issuer.email}
                onChange={(e) => setRecord({ ...record, issuer: { ...record.issuer, email: e.target.value } })}
              />
              <textarea
                className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                placeholder="Issuer address"
                value={record.issuer.address}
                onChange={(e) => setRecord({ ...record, issuer: { ...record.issuer, address: e.target.value } })}
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                  placeholder="GSTIN"
                  value={record.issuer.gstin}
                  onChange={(e) => setRecord({ ...record, issuer: { ...record.issuer, gstin: e.target.value } })}
                />
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                  placeholder="State"
                  value={record.issuer.state}
                  onChange={(e) => setRecord({ ...record, issuer: { ...record.issuer, state: e.target.value } })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-800">GST & compliance</p>
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <input
                  type="checkbox"
                  checked={record.gst.enabled}
                  onChange={(e) => setRecord({ ...record, gst: { ...record.gst, enabled: e.target.checked } })}
                  className="h-4 w-4 accent-[color:var(--brand-red)]"
                />
                Enable GST
              </label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                placeholder="Place of supply"
                value={record.gst.placeOfSupply ?? ""}
                onChange={(e) => setRecord({ ...record, gst: { ...record.gst, placeOfSupply: e.target.value } })}
              />
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
                placeholder="GST rate %"
                type="number"
                value={record.gst.taxRate ?? 0}
                onChange={(e) => setRecord({ ...record, gst: { ...record.gst, taxRate: Number(e.target.value) } })}
              />
            </div>
            <input
              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
              placeholder="GST narration / Rule 46 notes"
              value={record.gst.narration ?? ""}
              onChange={(e) => setRecord({ ...record, gst: { ...record.gst, narration: e.target.value } })}
            />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-800">Line items</p>
              <button
                className="rounded-full bg-[color:var(--brand-yellow)] px-3 py-2 text-xs font-bold text-neutral-900 transition hover:translate-y-[-1px]"
                type="button"
                onClick={addItem}
              >
                + Add item
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {record.items.map((item) => (
                <div key={item.id} className="rounded-lg border border-neutral-200 bg-[color:var(--brand-white)] p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <input
                      className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full bg-[color:var(--brand-red)] px-3 py-2 text-xs font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="font-semibold text-neutral-700">Qty</label>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-700">Rate</label>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-700">HSN/SAC</label>
                      <input
                        className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2"
                        value={item.hsnSac ?? ""}
                        onChange={(e) => updateItem(item.id, "hsnSac", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-700">GST %</label>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2"
                        value={item.gstRate ?? 0}
                        onChange={(e) => updateItem(item.id, "gstRate", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-right text-xs font-semibold text-neutral-700">
                    Line total: {formatCurrency(item.quantity * item.rate, record.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-2">
            <p className="text-sm font-semibold text-neutral-800">Notes</p>
            <textarea
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2"
              placeholder="Share bank details, payment terms, or marketing delivery milestones"
              value={record.notes}
              onChange={(e) => setRecord({ ...record, notes: e.target.value })}
            />
            <div className="rounded-lg bg-[color:var(--card)] p-3 text-xs text-neutral-700">
              Follow GST Rule 46: include invoice number, date of issue, supplier & recipient details, place of supply, GSTIN, item
              descriptions with HSN/SAC, and tax breakdown. Use the GST toggle above to ensure the PDF will contain compliant
              totals.
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm font-semibold text-neutral-800">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal, record.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-neutral-800">
              <span>GST</span>
              <span>{formatCurrency(totals.taxTotal, record.currency)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-lg font-bold text-[color:var(--brand-red)]">
              <span>Grand total</span>
              <span>{formatCurrency(totals.total, record.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          className="rounded-full bg-[color:var(--brand-red)] px-4 py-2 text-sm font-bold text-white transition hover:translate-y-[-1px] disabled:opacity-60"
          disabled={saving}
          type="button"
          onClick={() => handleSubmit("invoice")}
        >
          Save draft invoice
        </button>
        <button
          className="rounded-full border border-[color:var(--brand-red)] px-4 py-2 text-sm font-bold text-[color:var(--brand-red)] transition hover:bg-[color:var(--brand-yellow)] disabled:opacity-60"
          disabled={saving}
          type="button"
          onClick={() => handleSubmit("quotation")}
        >
          Save as quotation
        </button>
        {saving && <span className="text-xs font-semibold text-neutral-600">Saving to Firestore...</span>}
      </div>
    </section>
  );
}
