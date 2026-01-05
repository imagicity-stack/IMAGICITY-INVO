"use client";

import { useState } from "react";
import { createCustomer } from "@/lib/firestore";
import { Customer } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";

interface Props {
  onCreated?: () => void;
}

export function CustomerForm({ onCreated }: Props) {
  const { profile } = useAuth();
  const [form, setForm] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    gstin: "",
    billingAddress: {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India"
    },
    createdAt: Date.now(),
    createdBy: profile?.uid || ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateBilling = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    await createCustomer({ ...form, createdBy: profile.uid, createdAt: Date.now() });
    setMessage("Customer saved to Firestore");
    setSaving(false);
    setForm({ ...form, name: "", email: "", phone: "", gstin: "", billingAddress: { ...form.billingAddress, line1: "", city: "", state: "", postalCode: "" } });
    onCreated?.();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">New Customer</h3>
        {message && <p className="text-xs text-brand-red">{message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-text-secondary">Name</label>
          <input
            className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Email</label>
          <input
            className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Phone</label>
          <input
            className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary">GSTIN (optional)</label>
          <input
            className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
            value={form.gstin}
            onChange={(e) => setForm({ ...form, gstin: e.target.value })}
          />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-secondary">Billing line 1</label>
            <input
              className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
              value={form.billingAddress.line1}
              onChange={(e) => updateBilling("line1", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary">City</label>
            <input
              className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
              value={form.billingAddress.city}
              onChange={(e) => updateBilling("city", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary">State</label>
            <input
              className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
              value={form.billingAddress.state}
              onChange={(e) => updateBilling("state", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary">Postal code</label>
            <input
              className="w-full mt-1 rounded-xl border border-surface-border px-4 py-2"
              value={form.billingAddress.postalCode}
              onChange={(e) => updateBilling("postalCode", e.target.value)}
              required
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-brand-red text-white font-semibold"
        >
          {saving ? "Saving..." : "Save customer"}
        </button>
      </div>
    </form>
  );
}
