"use client";

import { useEffect, useState } from "react";
import { fetchDocuments, transitionInvoice } from "@/lib/firestore";
import { InvoiceDocument, InvoiceStatus } from "@/types";
import { statusClasses, statusLabels } from "@/lib/invoiceLogic";
import { toast } from "react-toastify";
import { useAuth } from "@/components/layout/AuthProvider";

const statusOrder: InvoiceStatus[] = ["draft", "final", "paid", "void"];

export function InvoiceBoard({ mode }: { mode: "invoice" | "quotation" }) {
  const [documents, setDocuments] = useState<InvoiceDocument[]>([]);
  const { user } = useAuth();

  const collectionName = mode === "invoice" ? "invoices" : "quotations";

  const refresh = async () => {
    const data = await fetchDocuments(collectionName as any);
    setDocuments(data);
  };

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  const handleTransition = async (id: string, target: InvoiceStatus) => {
    if (!user) return;
    try {
      await transitionInvoice(collectionName as any, id, target, { createdBy: user.email ?? "admin" });
      toast.success(`Moved to ${statusLabels[target]}`);
      refresh();
    } catch (err: any) {
      toast.error(err?.message ?? "Transition failed");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {statusOrder.map((status) => (
        <div key={status} className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500">{statusLabels[status]}</p>
              <p className="text-2xl font-bold text-gray-900">{documents.filter((d) => d.status === status).length}</p>
            </div>
            <span className={`badge ${statusClasses[status]}`}>{status.toUpperCase()}</span>
          </div>
          <div className="mt-4 space-y-3">
            {documents
              .filter((d) => d.status === status)
              .slice(0, 6)
              .map((doc) => (
                <div key={doc.id} className="rounded-lg border border-gray-100 bg-white/70 p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{doc.reference}</p>
                      <p className="text-xs text-gray-500">{doc.clientName}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">₹{doc.grandTotal.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                    {status === "draft" && (
                      <button className="btn-secondary text-xs" onClick={() => handleTransition(doc.id!, "final")}>Finalize</button>
                    )}
                    {status === "final" && (
                      <button className="btn-primary text-xs" onClick={() => handleTransition(doc.id!, "paid")}>
                        Mark paid
                      </button>
                    )}
                    {status !== "void" && (
                      <button
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                        onClick={() => handleTransition(doc.id!, "void")}
                      >
                        Void
                      </button>
                    )}
                  </div>
                </div>
              ))}
            {documents.filter((d) => d.status === status).length === 0 && (
              <p className="text-sm text-gray-500">Nothing in this lane.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
