import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { stripUndefinedDeep } from '../utils/stripUndefined';
import { computeTotals } from './math';
import { Invoice, InvoiceItem, InvoiceItemPayload, InvoicePayment, InvoicePaymentPayload, InvoicePayload, InvoiceStatus, ListInvoiceParams } from './invoiceTypes';

const COLLECTION = 'invoices';
const COMPANY_STATE_CODE = process.env.NEXT_PUBLIC_COMPANY_STATE_CODE || 'KA';

function mapInvoice(snapshot: any): Invoice {
  const data = snapshot.data();
  return {
    invoiceId: snapshot.id,
    ...data,
    issueDate: data.issueDate ?? null,
    dueDate: data.dueDate ?? null,
    createdAt: data.createdAt as Timestamp | undefined,
    updatedAt: data.updatedAt as Timestamp | undefined,
  } as Invoice;
}

function computeStatus(amountPaid: number, grandTotal: number, dueDate?: Timestamp | null): InvoiceStatus {
  const balanceDue = grandTotal - amountPaid;
  const today = new Date();
  if (balanceDue <= 0) return 'Paid';
  if (amountPaid > 0 && balanceDue > 0) return 'Partially Paid';
  if (dueDate && dueDate.toDate && dueDate.toDate() < today) return 'Overdue';
  if (grandTotal > 0) return 'Issued';
  return 'Draft';
}

async function getNextInvoiceNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return `INV-${year}-0001`;
  }

  const latest = mapInvoice(snapshot.docs[0]);
  const match = latest.invoiceNumber?.match(/^INV-(\d{4})-(\d{4})$/);
  const previousYear = match ? Number(match[1]) : year;
  const previousCounter = match ? Number(match[2]) : 0;
  const nextCounter = previousYear === year ? previousCounter + 1 : 1;

  return `INV-${year}-${String(nextCounter).padStart(4, '0')}`;
}

export async function listInvoices(params?: ListInvoiceParams): Promise<Invoice[]> {
  const constraints: any[] = [orderBy('createdAt', 'desc')];

  if (!params?.includeArchived) {
    constraints.push(where('isArchived', '==', false));
  }

  if (params?.status && params.status !== 'All') {
    constraints.push(where('status', '==', params.status));
  }

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  const search = params?.search?.toLowerCase().trim();
  const now = new Date();

  return snapshot.docs
    .map((docSnap) => mapInvoice(docSnap))
    .filter((invoice) => {
      if (!search) return true;
      const haystack = [invoice.invoiceNumber, invoice.clientSnapshot?.legalName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    })
    .filter((invoice) => {
      if (!params?.overdueOnly) return true;
      const due = invoice.dueDate as Timestamp | null;
      if (!due || !due.toDate) return false;
      return due.toDate() < now && invoice.balanceDue > 0;
    });
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return mapInvoice(snapshot);
}

export async function getInvoiceItems(id: string): Promise<InvoiceItem[]> {
  const itemsSnapshot = await getDocs(collection(db, COLLECTION, id, 'items'));
  if (itemsSnapshot.empty) return [];
  return itemsSnapshot.docs.map((itemSnap) => itemSnap.data() as InvoiceItem);
}

export async function getInvoicePayments(id: string): Promise<InvoicePayment[]> {
  const paymentsSnapshot = await getDocs(collection(db, COLLECTION, id, 'payments'));
  if (paymentsSnapshot.empty) return [];
  return paymentsSnapshot.docs.map((payment) => payment.data() as InvoicePayment);
}

export async function addOrReplaceInvoiceItems(invoiceId: string, items: InvoiceItemPayload[]): Promise<void> {
  const batch = writeBatch(db);
  const itemsCollection = collection(db, COLLECTION, invoiceId, 'items');
  const existing = await getDocs(itemsCollection);
  existing.forEach((docSnap) => batch.delete(docSnap.ref));

  items.forEach((item) => {
    const docRef = item.itemId ? doc(itemsCollection, item.itemId) : doc(itemsCollection);
    batch.set(docRef, stripUndefinedDeep({ ...item, itemId: docRef.id }));
  });

  await batch.commit();
}

export async function createInvoice(payload: InvoicePayload, items: InvoiceItemPayload[]): Promise<string> {
  const docRef = doc(collection(db, COLLECTION));
  const invoiceId = docRef.id;
  const invoiceNumber = payload.invoiceNumber || (await getNextInvoiceNumber());
  const totals = computeTotals(items, payload.discountType, payload.discountValue, payload.roundOff);
  const basePayload = stripUndefinedDeep({
    ...payload,
    invoiceId,
    invoiceNumber,
    subTotal: totals.subTotal,
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    balanceDue: totals.balanceDue,
    amountPaid: 0,
    status: computeStatus(0, totals.grandTotal, payload.dueDate as Timestamp),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(docRef, basePayload);
  await addOrReplaceInvoiceItems(invoiceId, totals.items);
  return invoiceId;
}

export async function updateInvoice(id: string, payload: Partial<InvoicePayload>, items?: InvoiceItemPayload[]): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  let totals = { items: items || [], subTotal: payload.subTotal, taxTotal: payload.taxTotal, grandTotal: payload.grandTotal, balanceDue: payload.balanceDue };

  if (items && items.length) {
    const computed = computeTotals(items, payload.discountType || 'None', payload.discountValue || 0, payload.roundOff || 0);
    totals = computed;
  }

  const cleaned = stripUndefinedDeep({
    ...payload,
    subTotal: totals.subTotal ?? payload.subTotal,
    taxTotal: totals.taxTotal ?? payload.taxTotal,
    grandTotal: totals.grandTotal ?? payload.grandTotal,
    balanceDue: payload.balanceDue ?? totals.balanceDue,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(docRef, cleaned);
  if (items && items.length) {
    await addOrReplaceInvoiceItems(id, totals.items);
  }
}

export async function recordInvoicePayment(invoiceId: string, payment: InvoicePaymentPayload): Promise<void> {
  const paymentsCollection = collection(db, COLLECTION, invoiceId, 'payments');
  const docRef = payment.paymentId ? doc(paymentsCollection, payment.paymentId) : undefined;
  const payload = stripUndefinedDeep({
    ...payment,
    paymentDate: payment.paymentDate instanceof Date ? Timestamp.fromDate(payment.paymentDate) : payment.paymentDate,
    createdAt: serverTimestamp(),
  });

  if (docRef) {
    await setDoc(docRef, { ...payload, paymentId: docRef.id }, { merge: true });
  } else {
    const created = await addDoc(paymentsCollection, payload);
    await updateDoc(created, { paymentId: created.id });
  }

  await refreshInvoicePaymentTotals(invoiceId);
}

export async function refreshInvoicePaymentTotals(invoiceId: string): Promise<void> {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) return;
  const payments = await getInvoicePayments(invoiceId);
  const amountPaid = payments.reduce((sum, entry) => sum + entry.amount, 0);
  const balanceDue = Math.max(invoice.grandTotal - amountPaid, 0);
  const status = computeStatus(amountPaid, invoice.grandTotal, invoice.dueDate as Timestamp);
  await updateDoc(doc(db, COLLECTION, invoiceId), stripUndefinedDeep({ amountPaid, balanceDue, status, updatedAt: serverTimestamp() }));
}

export async function toggleArchiveInvoice(invoiceId: string, isArchived: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, invoiceId), { isArchived, updatedAt: serverTimestamp() });
}

export { COMPANY_STATE_CODE };
