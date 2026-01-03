"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";

interface BrandSettingsProps {
  onLogoChange?: (url: string) => void;
}

export function BrandSettings({ onLogoChange }: BrandSettingsProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const uploadLogo = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const storageRef = ref(storage, `branding/logo-${Date.now()}.png`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, "branding", "global"), { logoUrl: url }, { merge: true });
      onLogoChange?.(url);
      setMessage("Logo updated and stored in Firebase Storage.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Branding</p>
          <h3 className="text-lg font-bold text-[color:var(--brand-red)]">Upload logo</h3>
          <p className="text-sm text-neutral-700">Stored in Firebase Storage and reused inside invoices & quotations.</p>
        </div>
        <label className="cursor-pointer rounded-full bg-[color:var(--brand-red)] px-4 py-2 text-xs font-bold text-white">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadLogo(file);
            }}
          />
          {uploading ? "Uploading..." : "Upload"}
        </label>
      </div>
      {message && <p className="mt-2 text-xs font-semibold text-green-700">{message}</p>}
    </div>
  );
}
