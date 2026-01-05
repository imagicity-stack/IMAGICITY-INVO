import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { listDocuments } from "@/lib/firebase/firestore";
import { Document } from "@/lib/types";
import { formatDate } from "@/lib/utils/finance";

export default async function DocumentsPage() {
  const documents = await listDocuments();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Documents</h1>
        <div className="flex gap-2">
          <Link className="rounded-lg bg-slate-200 px-3 py-2 text-sm" href="/app/documents/new?type=quotation">
            New quotation
          </Link>
          <Link className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white" href="/app/documents/new?type=invoice">
            New invoice
          </Link>
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Number</th>
                <th>Type</th>
                <th>Status</th>
                <th>Client</th>
                <th>Issue date</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc: Document) => (
                <tr key={doc.id}>
                  <td className="py-2 font-medium text-indigo-700">
                    <Link href={`/app/documents/${doc.id}`}>{doc.number || "Draft"}</Link>
                  </td>
                  <td className="uppercase text-slate-600">{doc.type}</td>
                  <td className="text-xs font-semibold text-slate-800">{doc.status}</td>
                  <td className="text-slate-700">{doc.clientSnapshot?.name}</td>
                  <td>{formatDate(doc.issueDate)}</td>
                  <td className="text-right font-semibold text-slate-800">{doc.totals?.grandTotal ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
