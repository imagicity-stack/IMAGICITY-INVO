import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  limit,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import stripUndefined from '../utils/stripUndefined';
import { ListQuotationParams, Quotation, QuotationItem, QuotationItemPayload, QuotationPayload } from './quotationTypes';

const COLLECTION = 'quotations';

function mapQuotation(snapshot: any): Quotation {
  const data = snapshot.data();
  return {
    quoteId: snapshot.id,
    ...data,
    issueDate: data.issueDate ?? null,
    validUntil: data.validUntil ?? null,
    createdAt: data.createdAt as Timestamp | undefined,
    updatedAt: data.updatedAt as Timestamp | undefined,
  } as Quotation;
}

export async function listQuotations(params?: ListQuotationParams): Promise<Quotation[]> {
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

  return snapshot.docs
    .map((docSnap) => mapQuotation(docSnap))
    .filter((quote) => {
      if (!search) return true;
      const haystack = [
        quote.quoteNumber,
        quote.clientSnapshot?.legalName,
        quote.clientSnapshot?.brandName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
}

export async function getQuotationById(id: string): Promise<QuotationItem[]> {
  const itemsSnapshot = await getDocs(collection(db, COLLECTION, id, 'items'));
  if (itemsSnapshot.empty) return [];
  return itemsSnapshot.docs.map((itemSnap) => itemSnap.data() as QuotationItem);
}

async function getNextQuoteNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return `Q-${year}-0001`;
  }

  const latest = mapQuotation(snapshot.docs[0]);
  const match = latest.quoteNumber?.match(/^Q-(\d{4})-(\d{4})$/);
  const previousYear = match ? Number(match[1]) : year;
  const previousCounter = match ? Number(match[2]) : 0;
  const nextCounter = previousYear === year ? previousCounter + 1 : 1;

  return `Q-${year}-${String(nextCounter).padStart(4, '0')}`;
}

export async function getQuotationWithMeta(id: string): Promise<Quotation | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return mapQuotation(snapshot);
}

export async function addOrReplaceQuotationItems(quoteId: string, items: QuotationItemPayload[]): Promise<void> {
  const batch = writeBatch(db);
  const itemsCollection = collection(db, COLLECTION, quoteId, 'items');
  const existing = await getDocs(itemsCollection);
  existing.forEach((docSnap) => batch.delete(docSnap.ref));

  items.forEach((item) => {
    const docRef = item.itemId ? doc(itemsCollection, item.itemId) : doc(itemsCollection);
    batch.set(docRef, stripUndefined({ ...item, itemId: docRef.id }));
  });

  await batch.commit();
}

export async function createQuotation(payload: QuotationPayload, items: QuotationItemPayload[]): Promise<string> {
  const docRef = doc(collection(db, COLLECTION));
  const quoteId = docRef.id;
  const quoteNumber = payload.quoteNumber || (await getNextQuoteNumber());
  const basePayload = stripUndefined({
    ...payload,
    quoteId,
    quoteNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(docRef, basePayload);
  await addOrReplaceQuotationItems(quoteId, items);
  return quoteId;
}

export async function updateQuotation(id: string, payload: Partial<QuotationPayload>): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  const cleaned = stripUndefined({ ...payload, updatedAt: serverTimestamp() });
  await updateDoc(docRef, cleaned);
}

export async function duplicateQuotation(id: string, overrides?: Partial<QuotationPayload>): Promise<string | null> {
  const base = await getQuotationWithMeta(id);
  if (!base) return null;
  const items = await getQuotationById(id);

  const clonePayload: QuotationPayload = {
    ...base,
    quoteId: undefined,
    quoteNumber: undefined,
    status: 'Draft',
    isArchived: false,
    createdAt: undefined,
    updatedAt: undefined,
    ...overrides,
  } as unknown as QuotationPayload;

  return createQuotation(clonePayload, items || []);
}

export async function deleteQuotation(id: string): Promise<void> {
  const batch = writeBatch(db);
  const itemsCollection = collection(db, COLLECTION, id, 'items');
  const itemsSnapshot = await getDocs(itemsCollection);
  itemsSnapshot.forEach((item) => batch.delete(item.ref));

  const docRef = doc(db, COLLECTION, id);
  batch.delete(docRef);

  await batch.commit();
}

export async function fetchNextQuoteNumber(): Promise<string> {
  return getNextQuoteNumber();
}
