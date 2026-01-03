import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Transaction,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { db } from "./client";
import {
  AuditLog,
  Client,
  CompanySettings,
  Document,
  DocumentStatus,
  DocumentType,
  Item,
  Payment,
  TaxDetail,
  UserDoc,
} from "../types";
import { computeFinancialYear, computeLineTotals, formatFinancialNumber } from "../utils/finance";

const COUNTERS = "counters";
const USERS = "users";
const SETTINGS = "settings";
const CLIENTS = "clients";
const ITEMS = "items";
const DOCUMENTS = "documents";
const PAYMENTS = "payments";
const AUDIT_LOGS = "auditLogs";

export async function bootstrapUser(uid: string, email: string) {
  const adminQuery = await getDocs(collection(db, USERS));
  const hasAdmin = adminQuery.docs.some((doc) => (doc.data() as UserDoc).role === "admin");

  return runTransaction(db, async (tx) => {
    const userRef = doc(db, USERS, uid);
    const snapshot = await tx.get(userRef);
    if (snapshot.exists()) return snapshot.data() as UserDoc;

    if (hasAdmin) {
      throw new Error("Access denied: admin already exists");
    }
    tx.set(userRef, {
      email,
      role: "admin",
      createdAt: serverTimestamp(),
    });
    return { email, role: "admin", createdAt: new Date().toISOString() } as UserDoc;
  });
}

export async function loadSettings(): Promise<CompanySettings | null> {
  const settingsRef = doc(db, SETTINGS, "company");
  const snap = await getDoc(settingsRef);
  return snap.exists() ? (snap.data() as CompanySettings) : null;
}

export async function saveSettings(payload: CompanySettings) {
  const settingsRef = doc(db, SETTINGS, "company");
  await setDoc(settingsRef, payload, { merge: true });
}

function counterId(type: DocumentType, fy: string) {
  return `${type === "quotation" ? "quotation" : "invoice"}_${fy}`;
}

function prefix(type: DocumentType) {
  switch (type) {
    case "quotation":
      return "IMQ";
    case "invoice":
      return "IMI";
    case "proforma":
      return "IMP";
    case "receipt":
      return "IMR";
    case "credit_note":
      return "IMC";
  }
}

export async function generateNumber(
  tx: Transaction,
  type: DocumentType,
  issueDate: Date
): Promise<{ seq: number; number: string; financialYear: string }> {
  const fy = computeFinancialYear(issueDate);
  const pref = prefix(type);
  const counterRef = doc(db, COUNTERS, counterId(type, fy));
  const snap = await tx.get(counterRef);
  const current = snap.exists() ? (snap.data().currentNumber as number) : 0;
  const nextSeq = current + 1;
  tx.set(counterRef, { currentNumber: nextSeq }, { merge: true });
  return { seq: nextSeq, number: formatFinancialNumber(pref, fy, nextSeq), financialYear: fy };
}

export async function finalizeDocument(documentId: string) {
  const docRef = doc(db, DOCUMENTS, documentId);
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(docRef);
    if (!snapshot.exists()) throw new Error("Document not found");
    const data = snapshot.data() as Document;
    if (data.status !== "DRAFT") throw new Error("Only drafts can be finalized");
    const { seq, number, financialYear } = await generateNumber(tx, data.type, new Date(data.issueDate));
    const totals = computeLineTotals(data.lineItems, data.tax as TaxDetail);
    const updated: Partial<Document> = {
      seq,
      number,
      financialYear,
      totals,
      status: "OPEN",
      metadata: { ...data.metadata, finalizedAt: new Date().toISOString() },
    };
    tx.update(docRef, updated);
    const logRef = doc(collection(db, AUDIT_LOGS));
    tx.set(logRef, {
      action: "FINALIZE",
      documentId,
      createdAt: serverTimestamp(),
    });
  });
}

export async function recordPayment(documentId: string, payment: Payment) {
  const docRef = doc(db, DOCUMENTS, documentId);
  const paymentRef = doc(collection(db, PAYMENTS));
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(docRef);
    if (!snapshot.exists()) throw new Error("Document not found");
    const data = snapshot.data() as Document;
    if (data.status === "VOID") throw new Error("Cannot pay void document");
    const newPaid = (data.totals.amountPaid || 0) + payment.amount;
    const status: DocumentStatus =
      newPaid >= data.totals.grandTotal
        ? "PAID"
        : newPaid > 0
          ? "PARTIALLY_PAID"
          : data.status;
    tx.set(paymentRef, {
      ...payment,
      documentId,
      createdAt: serverTimestamp(),
    });
    tx.update(docRef, {
      totals: { ...data.totals, amountPaid: newPaid, amountDue: data.totals.grandTotal - newPaid },
      status,
    });
    const logRef = doc(collection(db, AUDIT_LOGS));
    tx.set(logRef, {
      action: "ADD_PAYMENT",
      documentId,
      changes: `Payment of ${payment.amount}`,
      createdAt: serverTimestamp(),
    });
  });
}

export async function voidDocument(documentId: string, reason: string) {
  const docRef = doc(db, DOCUMENTS, documentId);
  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(docRef);
    if (!snapshot.exists()) throw new Error("Document not found");
    const data = snapshot.data() as Document;
    if (data.status === "VOID") return;
    tx.update(docRef, {
      status: "VOID",
      metadata: { ...data.metadata, voidedAt: new Date().toISOString(), voidReason: reason },
    });
    tx.set(doc(collection(db, AUDIT_LOGS)), {
      action: "VOID",
      documentId,
      changes: reason,
      createdAt: serverTimestamp(),
    });
  });
}

export async function createDocument(payload: Document) {
  const ref = await addDoc(collection(db, DOCUMENTS), {
    ...payload,
    metadata: { ...payload.metadata, createdAt: serverTimestamp() },
  });
  await addDoc(collection(db, AUDIT_LOGS), {
    action: "CREATE",
    documentId: ref.id,
    createdAt: serverTimestamp(),
  } as AuditLog);
  return ref.id;
}

export async function listDocuments() {
  const snap = await getDocs(collection(db, DOCUMENTS));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Document) }));
}

export async function saveClient(payload: Client) {
  if (payload.id) {
    await updateDoc(doc(db, CLIENTS, payload.id), payload);
    return payload.id;
  }
  const ref = await addDoc(collection(db, CLIENTS), payload);
  return ref.id;
}

export async function saveItem(payload: Item) {
  if (payload.id) {
    await updateDoc(doc(db, ITEMS, payload.id), payload);
    return payload.id;
  }
  const ref = await addDoc(collection(db, ITEMS), payload);
  return ref.id;
}
