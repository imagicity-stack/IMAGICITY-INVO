"use client";

import { ChangeEvent, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { getClientServices } from "@/lib/firebase/client";
import { Button } from "./ui/Button";
import { useAuth } from "./providers/AuthProvider";

export function LogoUploader() {
  const { storage, db } = getClientServices();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setMessage(null);
    const storageRef = ref(storage, `brand/${user.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await setDoc(doc(db, "settings", "branding"), {
      url,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    });
    setMessage("Logo uploaded to Firebase Storage and linked to branding config.");
    setUploading(false);
  };

  return (
    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
      <p className="font-semibold">Storage-backed assets</p>
      <p className="text-yellow-800">Upload a white/red logo to stamp on generated PDFs.</p>
      <div className="mt-2 flex items-center gap-3">
        <input type="file" accept="image/*" onChange={handleUpload} className="text-xs" />
        <Button disabled={uploading} type="button" variant="outline">
          {uploading ? "Uploading..." : "Attach logo"}
        </Button>
      </div>
      {message && <p className="mt-2 text-xs text-yellow-700">{message}</p>}
    </div>
  );
}
