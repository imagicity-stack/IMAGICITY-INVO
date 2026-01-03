"use client";

import { Card } from "@/components/ui/Card";
import { saveItem } from "@/lib/firebase/firestore";
import { Item } from "@/lib/types";
import { useState } from "react";

export default function ItemsPage() {
  const [item, setItem] = useState<Item>({ name: "", defaultRate: 0, taxable: true });
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveItem(item);
    setMessage("Item saved");
    setItem({ name: "", defaultRate: 0, taxable: true });
  };

  return (
    <Card title="Catalogue" actions={message && <span className="text-emerald-600 text-sm">{message}</span>}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Default rate</label>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={item.defaultRate}
            onChange={(e) => setItem({ ...item, defaultRate: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">SAC / HSN</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={item.sacOrHsn || ""}
            onChange={(e) => setItem({ ...item, sacOrHsn: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Taxable</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={item.taxable ? "true" : "false"}
            onChange={(e) => setItem({ ...item, taxable: e.target.value === "true" })}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
            Save item
          </button>
        </div>
      </form>
    </Card>
  );
}
