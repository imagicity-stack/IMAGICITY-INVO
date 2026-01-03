"use client";

import { Card } from "@/components/ui/Card";
import { loadSettings, saveSettings } from "@/lib/firebase/firestore";
import { CompanySettings } from "@/lib/types";
import { useEffect, useState } from "react";

const defaultSettings: CompanySettings = {
  legalName: "",
  brandName: "IMAGICITY",
  address: { line1: "" },
  defaultTaxRates: { cgst: 9, sgst: 9, igst: 18 },
  currency: "INR",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings()
      .then((data) => data && setSettings({ ...defaultSettings, ...data }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <Card title="Company profile">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
          <div>
            <label className="text-sm font-medium">Legal name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={settings.legalName}
              onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Brand name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">GSTIN</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={settings.gstin || ""}
              onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="text-sm font-medium">State / Place of supply</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={settings.placeOfSupplyDefault || ""}
              onChange={(e) => setSettings({ ...settings, placeOfSupplyDefault: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Address</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={[settings.address?.line1, settings.address?.line2, settings.address?.city]
                .filter(Boolean)
                .join(", ")}
              onChange={(e) => setSettings({ ...settings, address: { line1: e.target.value } })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default terms</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={settings.defaultTerms || ""}
              onChange={(e) => setSettings({ ...settings, defaultTerms: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default notes</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={settings.defaultNotes || ""}
              onChange={(e) => setSettings({ ...settings, defaultNotes: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default CGST %</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={settings.defaultTaxRates?.cgst ?? 0}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultTaxRates: { ...settings.defaultTaxRates, cgst: Number(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default SGST %</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={settings.defaultTaxRates?.sgst ?? 0}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultTaxRates: { ...settings.defaultTaxRates, sgst: Number(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default IGST %</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={settings.defaultTaxRates?.igst ?? 0}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultTaxRates: { ...settings.defaultTaxRates, igst: Number(e.target.value) },
                })
              }
            />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between pt-2">
            <p className="text-sm text-slate-500">
              Configure GST (Rule 46) fields, bank and UPI details, and defaults that appear on quotation and invoice PDFs.
            </p>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              Save settings
            </button>
          </div>
          {saved && <p className="text-sm text-emerald-600">Saved</p>}
        </form>
      </Card>
    </div>
  );
}
