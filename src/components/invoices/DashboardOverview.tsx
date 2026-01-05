"use client";

import { useEffect, useState } from "react";
import { fetchDocuments } from "@/lib/firestore";
import { InvoiceDocument } from "@/types";
import { statusClasses, statusLabels } from "@/lib/invoiceLogic";
import { ArrowTrendingUpIcon, BanknotesIcon, CheckBadgeIcon, ClockIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const metricsIcons = {
  pipeline: ClockIcon,
  finalized: CheckBadgeIcon,
  revenue: BanknotesIcon,
  growth: ArrowTrendingUpIcon,
};

type MetricKey = keyof typeof metricsIcons;

export function DashboardOverview() {
  const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);

  useEffect(() => {
    fetchDocuments("invoices").then(setInvoices).catch(console.error);
  }, []);

  const draftCount = invoices.filter((i) => i.status === "draft").length;
  const finalCount = invoices.filter((i) => i.status === "final").length;
  const paidTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, inv) => acc + (inv.grandTotal ?? 0), 0);

  const metrics: Record<MetricKey, { label: string; value: string; description: string }> = {
    pipeline: {
      label: "Draft pipeline",
      value: `${draftCount}`,
      description: "Invoices/quotes awaiting review",
    },
    finalized: {
      label: "Finalized",
      value: `${finalCount}`,
      description: "Locked and ready for payment",
    },
    revenue: {
      label: "Paid to date",
      value: `₹${paidTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      description: "Gross receipts",
    },
    growth: {
      label: "Compliance",
      value: "100%",
      description: "Rule 46 checks enabled",
    },
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase text-gray-500">Welcome back</p>
          <h1 className="text-2xl font-semibold text-gray-900">Imagicity control tower</h1>
          <p className="text-sm text-gray-600">Monitor drafts, approvals, and payments in one screen.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/invoices" className="btn-primary">
            Create invoice
          </Link>
          <Link href="/quotes" className="btn-secondary">
            Create quotation
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(metricsIcons) as MetricKey[]).map((key) => {
          const Icon = metricsIcons[key];
          return (
            <div key={key} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-gray-500">{metrics[key].label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics[key].value}</p>
                </div>
                <Icon className="h-8 w-8 text-brand-red" />
              </div>
              <p className="text-sm text-gray-600 mt-2">{metrics[key].description}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recent activity</h2>
          <Link href="/invoices" className="text-sm font-semibold text-brand-red">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="pb-2">Reference</th>
                <th className="pb-2">Client</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.slice(0, 6).map((invoice) => (
                <tr key={invoice.id} className="text-sm text-gray-800">
                  <td className="py-2 font-semibold">{invoice.reference}</td>
                  <td className="py-2">{invoice.clientName}</td>
                  <td className="py-2">
                    <span className={`badge ${statusClasses[invoice.status]}`}>{statusLabels[invoice.status]}</span>
                  </td>
                  <td className="py-2 font-semibold">₹{invoice.grandTotal.toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-gray-500">
                    No invoices yet. Build your first draft to begin the lifecycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
