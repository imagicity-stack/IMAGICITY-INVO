import { Card } from "@/components/ui/Card";
import { listDocuments } from "@/lib/firebase/firestore";
import { Document } from "@/lib/types";

export default async function DashboardPage() {
  const documents = await listDocuments();
  const overdue = documents.filter(
    (doc) => doc.dueDate && doc.status !== "PAID" && new Date(doc.dueDate) < new Date()
  );

  const totals = documents.reduce(
    (acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Documents"> <p className="text-2xl font-semibold text-slate-800">{documents.length}</p></Card>
        <Card title="Overdue"> <p className="text-2xl font-semibold text-amber-700">{overdue.length}</p></Card>
        <Card title="Paid"> <p className="text-2xl font-semibold text-emerald-700">{totals["PAID"] || 0}</p></Card>
      </div>
      <Card title="Recent documents">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Number</th>
                <th>Status</th>
                <th>Client</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.slice(0, 8).map((doc: Document) => (
                <tr key={doc.id}>
                  <td className="py-2 font-medium text-slate-800">{doc.number || "Draft"}</td>
                  <td className="uppercase text-xs font-semibold text-indigo-700">{doc.status}</td>
                  <td className="text-slate-600">{doc.clientSnapshot?.name}</td>
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
