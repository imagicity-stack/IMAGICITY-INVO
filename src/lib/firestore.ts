import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { Customer, DocumentBase, StorageAsset, UserProfile } from "@/types";

export const collections = {
  customers: "customers",
  documents: "documents",
  assets: "assets",
  users: "users"
};

export async function upsertUserProfile(uid: string, profile: UserProfile) {
  await setDoc(doc(db, collections.users, uid), profile, { merge: true });
}

export async function createCustomer(customer: Customer) {
  const payload = {
    ...customer,
    createdAt: Timestamp.now()
  };
  const ref = await addDoc(collection(db, collections.customers), payload);
  return ref.id;
}

export async function listCustomers() {
  const snap = await getDocs(query(collection(db, collections.customers), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Customer) }));
}

export async function createDocument(docBase: DocumentBase) {
  const payload = {
    ...docBase,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  const ref = await addDoc(collection(db, collections.documents), payload);
  return ref.id;
}

export async function listDocuments() {
  const snap = await getDocs(query(collection(db, collections.documents), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentBase) }));
}

export async function getDocumentDetail(id: string) {
  const snap = await getDoc(doc(db, collections.documents, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as DocumentBase) };
}

export async function recordAsset(asset: StorageAsset) {
  const ref = await addDoc(collection(db, collections.assets), {
    ...asset,
    uploadedAt: serverTimestamp()
  });
  return ref.id;
}
