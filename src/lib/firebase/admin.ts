import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("FIREBASE_ADMIN_PRIVATE_KEY is required for admin initialization");
}

const app =
  getApps()[0] ||
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
