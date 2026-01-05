"use client";

import { useEffect, useMemo, useState } from "react";
import { createDocument, listCustomers } from "@/lib/firestore";
import { Customer, DocumentBase, DocumentType, LineItem, TaxMode } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";

interface Props {
  onSaved?: () => void;
}

const defaultItem: LineItem = {
  description: "",
  quantity: 1,
  unit: "hrs",
  rate: 0,
  discount: 0,
  gstRate: 18
};

function calculateTotals(items: LineItem[], taxMode: TaxMode, additionalCharges = 0, roundOff = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate - (item.discount || 0), 0);
  const taxable = taxMode === "gst" ? subtotal : 0;
  const gstAmount = taxMode === "gst" ? items.reduce((sum, item) => sum + (item.gstRate || 0) * (item.quantity * item.rate - (item.discount || 0)) / 100, 0) : 0;
  const total = subtotal + gstAmount + additionalCharges + roundOff;
  return { subtotal, taxable, gstAmount, total };
}

export function DocumentForm({ onSaved }: Props) {
  const { profile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [type, setType] = useState<DocumentType>("invoice");
  const [taxMode, setTaxMode] = useState<TaxMode>("gst");
  const [items, setItems] = useState<LineItem[]>([{ ...defaultItem }]);
  const [form, setForm] = useState<Omit<DocumentBase, "lineItems">>({
    documentNumber: "",
    documentDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date().toISOString().slice(0, 10),
    customerId: "",
    customerName: "",
    placeOfSupply: "Maharashtra",
    type,
    taxMode,
    additionalCharges: 0,
    roundOff: 0,
    notes: "",
    terms: "",
    createdAt: Date.now(),
    createdBy: profile?.uid || ""
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      const list = await listCustomers();
      setCustomers(list);
      setLoadingCustomers(false);
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, type }));
  }, [type]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, taxMode }));
  }, [taxMode]);

  const totals = useMemo(
    () => calculateTotals(items, taxMode, form.additionalCharges || 0, form.roundOff || 0),
    [form.additionalCharges, form.roundOff, items, taxMode]
  );

  const handleItemChange = (index: number, key: keyof LineItem, value: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      copy[index][key] = typeof value === "string" ? (key === "description" || key === "unit" || key === "hsn" || key === "sac" ? value : Number(value)) : value;
      return copy;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { ...defaultItem }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const customer = customers.find((c) => c.id === form.customerId);
    await createDocument({
      ...form,
      customerName: customer?.name || form.customerName,
      createdBy: profile.uid,
      lineItems: items,
      type,
      taxMode,
      createdAt: Date.now(),
      status: type === "invoice" ? "draft" : "sent"
    });
    onSaved?.();
    setItems([{ ...defaultItem }]);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Create document</h3>
          <p className="text-sm text-text-secondary">Supports invoices and quotations with GST toggles.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DocumentType)}
            className="rounded-xl border border-surface-border px-3 py-2"
          >
            <option value="invoice">Invoice</option>
            <option value="quotation">Quotation</option>
          </select>
          <select
            value={taxMode}
            onChange={(e) => setTaxMode(e.target.value as TaxMode)}
            className="rounded-xl border border-surface-border px-3 py-2"
          >
            <option value="gst">GST</option>
            <option value="non-gst">Non-GST</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-text-secondary">Document number</label>
          <input
            className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
            value={form.documentNumber}
            onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
            placeholder={type === "invoice" ? "INV-2024-001" : "QUO-2024-001"}
            required
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Document date</label>
          <input
            type="date"
            className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
            value={form.documentDate}
            onChange={(e) => setForm({ ...form, documentDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Due date</label>
          <input
            type="date"
            className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-text-secondary">Customer</label>
          <select
            className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            required
          >
            <option value="">{loadingCustomers ? "Loading customers..." : "Select customer"}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} {customer.gstin ? `(${customer.gstin})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-text-secondary">Place of supply (GST)</label>
          <input
            className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
            value={form.placeOfSupply}
            onChange={(e) => setForm({ ...form, placeOfSupply: e.target.value })}
            placeholder="Maharashtra"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-text-primary">Line items</h4>
          <button type="button" onClick={addItem} className="text-sm font-semibold text-brand-red">
            Add item
          </button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="grid md:grid-cols-6 gap-3 border border-surface-border rounded-xl p-4">
            <input
              className="md:col-span-2 rounded-xl border border-surface-border px-3 py-2"
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleItemChange(idx, "description", e.target.value)}
            />
            <input
              className="rounded-xl border border-surface-border px-3 py-2"
              type="number"
              min={0}
              value={item.quantity}
              onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
            />
            <input
              className="rounded-xl border border-surface-border px-3 py-2"
              placeholder="Unit"
              value={item.unit}
              onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
            />
            <input
              className="rounded-xl border border-surface-border px-3 py-2"
              type="number"
              min={0}
              value={item.rate}
              onChange={(e) => handleItemChange(idx, "rate", Number(e.target.value))}
            />
            <input
              className="rounded-xl border border-surface-border px-3 py-2"
              type="number"
              min={0}
              value={item.discount}
              onChange={(e) => handleItemChange(idx, "discount", Number(e.target.value))}
            />
            {taxMode === "gst" && (
              <input
                className="rounded-xl border border-surface-border px-3 py-2"
                type="number"
                min={0}
                value={item.gstRate}
                onChange={(e) => handleItemChange(idx, "gstRate", Number(e.target.value))}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-sm text-text-secondary">Notes</label>
          <textarea
            className="w-full rounded-xl border border-surface-border px-3 py-2"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Narration, GST disclosures, reverse charge notes, etc."
          />
          <label className="text-sm text-text-secondary">Terms</label>
          <textarea
            className="w-full rounded-xl border border-surface-border px-3 py-2"
            rows={3}
            value={form.terms}
            onChange={(e) => setForm({ ...form, terms: e.target.value })}
            placeholder="Payment timeline, bank account, e-invoice QR references"
          />
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-text-secondary">Additional charges</label>
              <input
                type="number"
                className="w-full mt-1 rounded-xl border border-surface-border px-3 py-2"
                value={form.additionalCharges}
                onChange={(e) => setForm({ ...form, additionalCharges: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">Round off</label>
              <input
                type="number"
                className="w-full mt-1 rounded-xl border border-surface-border px-3 py-2"
                value={form.roundOff}
                onChange={(e) => setForm({ ...form, roundOff: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">HSN/SAC (global)</label>
              <input
                className="w-full mt-1 rounded-xl border border-surface-border px-3 py-2"
                onChange={(e) =>
                  setItems((prev) => prev.map((item) => ({ ...item, hsn: e.target.value, sac: e.target.value })))}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">Status</label>
              <select
                className="w-full mt-1 rounded-xl border border-surface-border px-3 py-2"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as DocumentBase["status"] })}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="rounded-xl border border-surface-border p-4 bg-surface-muted">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Sub-total</span>
              <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            {taxMode === "gst" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">GST</span>
                <span className="font-semibold">₹{totals.gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Total</span>
              <span className="font-semibold text-brand-red text-lg">₹{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="px-4 py-2 rounded-xl border border-surface-border">Save draft</button>
        <button type="submit" className="px-4 py-2 rounded-xl bg-brand-red text-white font-semibold">
          Save {type}
        </button>
      </div>
    </form>
  );
}
