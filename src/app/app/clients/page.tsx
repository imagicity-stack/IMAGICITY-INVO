"use client";

import { Card } from "@/components/ui/Card";
import { saveClient } from "@/lib/firebase/firestore";
import { Client } from "@/lib/types";
import { useState } from "react";

export default function ClientsPage() {
  const [client, setClient] = useState<Client>({ name: "" });
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveClient(client);
    setMessage("Client saved");
    setClient({ name: "" });
  };

  return (
    <Card title="Clients" actions={message && <span className="text-emerald-600 text-sm">{message}</span>}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={client.name}
            onChange={(e) => setClient({ ...client, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={client.email || ""}
            onChange={(e) => setClient({ ...client, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={client.phone || ""}
            onChange={(e) => setClient({ ...client, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">GSTIN</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={client.gstin || ""}
            onChange={(e) => setClient({ ...client, gstin: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Billing address</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={client.billingAddress?.line1 || ""}
            onChange={(e) => setClient({ ...client, billingAddress: { line1: e.target.value } })}
          />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
            Save client
          </button>
        </div>
      </form>
    </Card>
  );
}
