"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { getClientServices } from "@/lib/firebase/client";
import { BillingDocument, DocumentKind, InvoiceStatus, LineItem } from "@/lib/types";
import { computeDocumentTotals } from "@/lib/calculations";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/components/providers/AuthProvider";
import { format } from "date-fns";

interface Props {
  kind: DocumentKind;
}

const emptyItem = (): LineItem => ({
  id: uuid(),
  description: "",
  quantity: 1,
  unitPrice: 0,
  gstRate: 18,
});

export function BillingForm({ kind }: Props) {
  const { user, role } = useAuth();
  const { db } = getClientServices();
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [seller, setSeller] = useState({ name: "Imagicity", address: "", gstin: "" });
  const [buyer, setBuyer] = useState({ name: "", address: "", gstin: "" });
  const [issueDate, setIssueDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState<string>("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [notes, setNotes] = useState("Campaign billing per contract.");
  const [gstEnabled, setGstEnabled] = useState(true);
  const [documents, setDocuments] = useState<BillingDocument[]>([]);
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [number, setNumber] = useState("");
  const [terms, setTerms] = useState("Payment due within 15 days. Late fee 1.5% monthly.");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "documents"), orderBy("issueDate", "desc"));
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => {
        const data = d.data() as BillingDocument;
        return { ...data, id: d.id };
      });
      setDocuments(docs.filter((doc) => doc.kind === kind));
    });
  }, [db, kind, user]);

  const totals = useMemo(
    () =>
      computeDocumentTotals({
        id: "preview",
        kind,
        status,
        number,
        issueDate,
        dueDate,
        seller,
        buyer,
        items,
        notes,
        terms,
        gstEnabled,
        placeOfSupply,
        createdBy: user?.uid ?? "preview",
      }),
    [buyer, dueDate, gstEnabled, issueDate, items, kind, notes, number, placeOfSupply, seller, status, terms, user?.uid]
  );

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const submit = async () => {
    if (!user || role !== "admin") return;
    await addDoc(collection(db, "documents"), {
      kind,
      status,
      number: number || `${kind === "invoice" ? "INV" : "QUO"}-${Date.now()}`,
      issueDate,
      dueDate: dueDate || null,
      seller,
      buyer,
      items,
      notes,
      terms,
      gstEnabled,
      placeOfSupply,
      reverseCharge: false,
      createdBy: user.uid,
      finalizedAt: status === "open" ? new Date().toISOString() : null,
      subtotal: totals.subtotal,
      totalTax: totals.totalTax,
      total: totals.total,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
      setNumber("");
      setItems([emptyItem()]);
  };

  const finalize = async (docId: string) => {
    if (role !== "admin") return;
    await setDoc(
      doc(db, "documents", docId),
      {
        status: "open",
        finalizedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const markPaid = async (docId: string) => {
    if (role !== "admin") return;
    await setDoc(
      doc(db, "documents", docId),
      { status: "paid", paidAt: new Date().toISOString() },
      { merge: true }
    );
  };

  const voidDoc = async (docId: string) => {
    if (role !== "admin") return;
    await setDoc(
      doc(db, "documents", docId),
      { status: "void", voidReason: "Superseded by admin", updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card title={`New ${kind === "invoice" ? "Invoice" : "Quotation"}`}
        action={<StatusBadge status={status} />}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder={`${kind === "invoice" ? "Invoice" : "Quote"} number`}
              className="flex-1 rounded-lg border border-red-100 px-3 py-2"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="rounded-lg border border-red-100 px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="open">Finalize</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-yellow-200/80 bg-yellow-50 p-3">
              <p className="text-xs uppercase text-yellow-700">Seller (Imagicity)</p>
              <input
                value={seller.name}
                onChange={(e) => setSeller({ ...seller, name: e.target.value })}
                placeholder="Seller name"
                className="mt-2 w-full rounded-md border border-yellow-200 px-3 py-2"
              />
              <textarea
                value={seller.address}
                onChange={(e) => setSeller({ ...seller, address: e.target.value })}
                placeholder="Address"
                className="mt-2 w-full rounded-md border border-yellow-200 px-3 py-2"
              />
              <input
                value={seller.gstin}
                onChange={(e) => setSeller({ ...seller, gstin: e.target.value })}
                placeholder="GSTIN"
                className="mt-2 w-full rounded-md border border-yellow-200 px-3 py-2"
              />
            </div>
            <div className="rounded-lg border border-red-100 bg-white p-3">
              <p className="text-xs uppercase text-red-700">Client</p>
              <input
                value={buyer.name}
                onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                placeholder="Client name"
                className="mt-2 w-full rounded-md border border-red-100 px-3 py-2"
              />
              <textarea
                value={buyer.address}
                onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                placeholder="Address"
                className="mt-2 w-full rounded-md border border-red-100 px-3 py-2"
              />
              <input
                value={buyer.gstin}
                onChange={(e) => setBuyer({ ...buyer, gstin: e.target.value })}
                placeholder="GSTIN"
                className="mt-2 w-full rounded-md border border-red-100 px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col text-sm font-medium text-gray-600">
              Issue date
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="rounded-md border border-red-100 px-3 py-2"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-gray-600">
              Due date
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-md border border-red-100 px-3 py-2"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              GST enabled (Rule 46 fields)
            </label>
            <input
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              placeholder="Place of supply"
              className="flex-1 rounded-md border border-red-100 px-3 py-2"
            />
          </div>
          <div className="space-y-2 rounded-xl border border-red-100 bg-white">
            <div className="grid grid-cols-12 gap-2 border-b border-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              <span className="col-span-4">Description</span>
              <span className="col-span-2">Qty</span>
              <span className="col-span-2">Rate</span>
              <span className="col-span-2">GST %</span>
              <span className="col-span-2">Amount</span>
            </div>
            {items.map((item) => {
              const line = item.quantity * item.unitPrice;
              return (
                <div key={item.id} className="grid grid-cols-12 items-center gap-2 px-3 py-2">
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    className="col-span-4 rounded-md border border-red-100 px-3 py-2"
                    placeholder="Service description"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                    className="col-span-2 rounded-md border border-red-100 px-3 py-2"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                    className="col-span-2 rounded-md border border-red-100 px-3 py-2"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.gstRate}
                    onChange={(e) => updateItem(item.id, { gstRate: Number(e.target.value) })}
                    className="col-span-2 rounded-md border border-red-100 px-3 py-2"
                  />
                  <div className="col-span-2 flex items-center justify-between gap-2 text-sm font-semibold text-red-700">
                    ₹{line.toFixed(2)}
                    <button onClick={() => removeItem(item.id)} className="text-xs text-gray-500 hover:text-red-500">
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="px-3 pb-3">
              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                Add line item
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border border-red-100 bg-white px-3 py-2"
              placeholder="Narration / work notes"
            />
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="rounded-xl border border-red-100 bg-white px-3 py-2"
              placeholder="Payment terms"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
            <span>Subtotal: ₹{totals.subtotal.toFixed(2)}</span>
            <span>Tax: ₹{totals.totalTax.toFixed(2)}</span>
            <span>Total: ₹{totals.total.toFixed(2)}</span>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="ghost" type="button" onClick={addItem}>
              Quick add row
            </Button>
            <Button className="pulse-button" type="button" onClick={submit} disabled={!user || role !== "admin"}>
              Save {kind === "invoice" ? "Invoice" : "Quotation"}
            </Button>
          </div>
          {role !== "admin" && <p className="text-sm text-red-600">Role restricted: only admins may save.</p>}
        </div>
      </Card>
      <div className="space-y-4 xl:col-span-2">
        <Card title={`${kind === "invoice" ? "Invoices" : "Quotations"} ledger`}>
          <div className="overflow-x-auto rounded-xl border border-red-100">
            <table className="min-w-full text-sm">
              <thead className="bg-red-50 text-left text-xs uppercase text-red-700">
                <tr>
                  <th className="px-3 py-2">Number</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Issue</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t border-red-50 hover:bg-red-50/60">
                    <td className="px-3 py-2 font-semibold text-[var(--primary)]">{doc.number}</td>
                    <td className="px-3 py-2">{doc.buyer?.name}</td>
                    <td className="px-3 py-2">{doc.issueDate}</td>
                    <td className="px-3 py-2 font-semibold">₹{(doc.total ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-3 py-2 space-x-2">
                      {doc.status === "draft" && (
                        <Button variant="outline" onClick={() => finalize(doc.id)} disabled={role !== "admin"}>
                          Finalize
                        </Button>
                      )}
                      {doc.status === "open" && (
                        <Button variant="solid" onClick={() => markPaid(doc.id)} disabled={role !== "admin"}>
                          Mark paid
                        </Button>
                      )}
                      {doc.status !== "void" && (
                        <Button variant="ghost" onClick={() => voidDoc(doc.id)} disabled={role !== "admin"}>
                          Void
                        </Button>
                      )}
                      <a
                        className="text-sm font-semibold text-[var(--primary)] hover:underline"
                        href={`/api/documents/${doc.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Rule 46 compliance checklist">
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm text-gray-700">
            <li>✔️ Serial invoice number + date</li>
            <li>✔️ Supplier & recipient details with GSTIN</li>
            <li>✔️ Description, quantity, value, and tax rate</li>
            <li>✔️ Place of supply & reverse charge marker</li>
            <li>✔️ Separate tax amount and total payable</li>
            <li>✔️ Optional digital signature block in PDF</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
