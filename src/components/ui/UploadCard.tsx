"use client";

import { useState } from "react";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { recordAsset } from "@/lib/firestore";
import { useAuth } from "@/components/auth/AuthProvider";

export function UploadCard() {
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !profile) return;
    const file = event.target.files[0];
    const fileRef = ref(storage, `assets/${profile.uid}/${Date.now()}-${file.name}`);
    setUploading(true);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await recordAsset({
      name: file.name,
      url,
      uploadedAt: Date.now(),
      uploadedBy: profile.uid
    });
    setMessage("Uploaded to Firebase Storage and indexed in Firestore");
    setUploading(false);
  };

  return (
    <div className="card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Upload supporting assets</h3>
          <p className="text-sm text-text-secondary">Store POs, creative proofs, eWay bills, and scope documents.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-brand-yellow/30 text-brand-red text-xs font-semibold">Storage</span>
      </div>
      <label className="flex items-center justify-between rounded-xl border-2 border-dashed border-surface-border px-4 py-6 cursor-pointer hover:border-brand-red">
        <div>
          <p className="font-semibold text-text-primary">Select file</p>
          <p className="text-sm text-text-secondary">Accepted: PDFs, images, spreadsheets.</p>
        </div>
        <input type="file" className="hidden" onChange={handleUpload} />
        <span className="px-4 py-2 rounded-xl bg-brand-red text-white font-semibold">Browse</span>
      </label>
      {message && <p className="text-sm text-brand-red">{message}</p>}
      {uploading && <p className="text-sm text-text-secondary">Uploading...</p>}
    </div>
  );
}
