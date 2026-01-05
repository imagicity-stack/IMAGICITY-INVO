import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { InvoiceDocument, InvoiceStatus, canTransition, computeTotals } from "@/lib/invoiceLogic";

export const collections = {
  invoices: "invoices",
  quotations: "quotations",
};

export async function fetchDocuments(collectionName: keyof typeof collections) {
  const q = query(collection(firestore, collectionName), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as InvoiceDocument) }));
}

export async function createDocument(
  collectionName: keyof typeof collections,
  payload: Omit<InvoiceDocument, "id" | "subtotal" | "taxTotal" | "grandTotal">,
  gstEnabled: boolean
) {
  const totals = computeTotals(payload.items, gstEnabled);
  const docRef = await addDoc(collection(firestore, collectionName), {
    ...payload,
    ...totals,
    createdAt: serverTimestamp(),
    auditTrail: [
      {
        action: "created",
        actor: payload.createdBy,
        at: serverTimestamp(),
      },
    ],
  });
  return docRef.id;
}

export async function transitionInvoice(
  collectionName: keyof typeof collections,
  id: string,
  targetStatus: InvoiceStatus,
  metadata: Partial<InvoiceDocument>
) {
  const ref = doc(firestore, collectionName, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error("Document not found");
  const data = snapshot.data() as InvoiceDocument;

  if (!canTransition(data.status, targetStatus)) {
    throw new Error(`Cannot transition from ${data.status} to ${targetStatus}`);
  }

  const updates: Partial<InvoiceDocument> = { status: targetStatus };
  if (targetStatus === "final") updates.finalizedAt = new Date().toISOString();
  if (targetStatus === "paid") updates.paidAt = new Date().toISOString();
  if (targetStatus === "void") {
    updates.voidedAt = new Date().toISOString();
    updates.voidReason = metadata.voidReason ?? "Reason not provided";
  }

  await updateDoc(ref, {
    ...updates,
    auditTrail: [
      ...(data as any).auditTrail,
      {
        action: targetStatus,
        actor: metadata.createdBy,
        at: serverTimestamp(),
        notes: metadata.voidReason,
      },
    ],
  });
}
