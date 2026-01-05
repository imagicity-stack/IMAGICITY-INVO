"use client";

import { useState } from "react";
import { InvoiceDocument, InvoiceItem } from "@/types";
import { computeTotals, InvoiceStatus } from "@/lib/invoiceLogic";
import { createDocument } from "@/lib/firestore";
import { useAuth } from "@/components/layout/AuthProvider";
import { toast } from "react-toastify";

interface Props {
  mode: "invoice" | "quotation";
  gstEnabled: boolean;
}

export function InvoiceForm({ mode, gstEnabled }: Props) {
  const { user, role } = useAuth();
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "Campaign strategy", quantity: 1, unitPrice: 50000, gstRate: 18, hsnSac: "998361" },
  ]);
  const [form, setForm] = useState<Omit<InvoiceDocument, "id" | "items" | "status" | "subtotal" | "taxTotal" | "grandTotal">>({
    reference: `${mode === "invoice" ? "INV" : "QUO"}-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    gstNumber: "",
    placeOfSupply: "Maharashtra",
    billFrom: "Imagicity Marketing Pvt Ltd",
    date: new Date().toISOString().slice(0, 10),
    currency: "INR",
    notes: "",
    terms: "Payment due in 15 days",
    createdBy: user?.email ?? "admin",
    createdByRole: role ?? "admin",
    source: mode,
  });
  const [loading, setLoading] = useState(false);

  const addItem = () => setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0, gstRate: 18 }]);
  const updateItem = (index: number, key: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: key === "description" || key === "hsnSac" ? value : Number(value) } : item)));
  };
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await createDocument(
        mode === "invoice" ? "invoices" : "quotations",
        {
          ...form,
          items,
          status: "draft" as InvoiceStatus,
        },
        gstEnabled
      );
      toast.success(`${mode === "invoice" ? "Invoice" : "Quotation"} saved as draft`);
    } catch (err: any) {
      toast.error(err?.message ?? "Unable to save document");
    } finally {
      setLoading(false);
    }
  };

  const totals = computeTotals(items, gstEnabled);

  return (
    <div className="card p-5 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-gray-500">{mode === "invoice" ? "Invoice" : "Quotation"} draft</p>
          <h3 className="text-xl font-semibold text-gray-900">{form.reference}</h3>
        </div>
        <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save draft"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label>Client name</label>
          <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
        </div>
        <div className="space-y-3">
          <label>Client email</label>
          <input value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} required />
        </div>
        <div className="space-y-3 md:col-span-2">
          <label>Client address</label>
          <textarea value={form.clientAddress} onChange={(e) => setForm({ ...form, clientAddress: e.target.value })} rows={2} />
        </div>
        <div className="space-y-3">
          <label>GSTIN (optional)</label>
          <input value={form.gstNumber ?? ""} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
        </div>
        <div className="space-y-3">
          <label>Place of supply</label>
          <input value={form.placeOfSupply ?? ""} onChange={(e) => setForm({ ...form, placeOfSupply: e.target.value })} />
        </div>
        <div className="space-y-3">
          <label>Invoice date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-3">
          <label>Due date</label>
          <input type="date" value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="section-title">Line items</h4>
          <button type="button" className="btn-secondary" onClick={addItem}>
            Add item
          </button>
        </div>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 p-3 md:grid-cols-12 md:items-center">
              <input
                className="md:col-span-4"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
              />
              <input
                className="md:col-span-2"
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
              />
              <input
                className="md:col-span-2"
                type="number"
                min={0}
                value={item.unitPrice}
                onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
              />
              <input
                className="md:col-span-2"
                type="number"
                min={0}
                value={item.gstRate ?? 0}
                onChange={(e) => updateItem(index, "gstRate", e.target.value)}
              />
              <input
                className="md:col-span-2"
                placeholder="HSN/SAC"
                value={item.hsnSac ?? ""}
                onChange={(e) => updateItem(index, "hsnSac", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label>Notes</label>
          <textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
        </div>
        <div className="space-y-3">
          <label>Terms</label>
          <textarea value={form.terms ?? ""} onChange={(e) => setForm({ ...form, terms: e.target.value })} rows={3} />
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-inner md:grid-cols-3">
        <div>
          <p className="text-sm text-gray-600">Subtotal</p>
          <p className="text-xl font-semibold text-gray-900">₹{totals.subtotal.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tax</p>
          <p className="text-xl font-semibold text-gray-900">₹{totals.taxTotal.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">₹{totals.grandTotal.toLocaleString("en-IN")}</p>
        </div>
      </div>
      {gstEnabled && (
        <p className="text-sm text-gray-600">
          GST breakup: CGST {totals.gstBreakdown.cgst?.toFixed(2)} | SGST {totals.gstBreakdown.sgst?.toFixed(2)} | IGST {totals.gstBreakdown.igst?.toFixed(2)}
        </p>
      )}
    </div>
  );
}
