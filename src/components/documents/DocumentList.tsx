"use client";

import { useEffect, useState } from "react";
import { listDocuments } from "@/lib/firestore";
import { DocumentBase } from "@/types";
import { motion } from "framer-motion";

export function DocumentList() {
  const [documents, setDocuments] = useState<DocumentBase[]>([]);

  useEffect(() => {
    const load = async () => {
      const docs = await listDocuments();
      setDocuments(docs);
    };
    load();
  }, []);

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Recent documents</h3>
        <p className="text-sm text-text-secondary">Invoices and quotations sorted by newest first.</p>
      </div>
      <div className="space-y-3">
        {documents.map((doc) => (
          <motion.div
            key={doc.id}
            className="flex flex-wrap items-center justify-between border border-surface-border rounded-xl px-4 py-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p className="font-semibold text-text-primary">{doc.documentNumber}</p>
              <p className="text-xs text-text-secondary">{doc.customerName}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="px-3 py-1 rounded-full bg-brand-yellow/30 text-brand-red font-semibold text-xs">{doc.type}</span>
              <span>{doc.documentDate}</span>
              <span className="font-semibold text-text-primary">₹{(doc.lineItems || []).reduce((sum, item) => sum + item.rate * item.quantity - (item.discount || 0), 0).toFixed(2)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
