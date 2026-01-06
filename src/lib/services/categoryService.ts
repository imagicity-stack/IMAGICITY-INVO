import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface ServiceCategoryRecord {
  categoryId: string;
  name: string;
}

const COLLECTION = 'serviceCategories';

export async function listCategories(): Promise<ServiceCategoryRecord[]> {
  const q = query(collection(db, COLLECTION), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data() as ServiceCategoryRecord);
}

export async function createCategory(name: string): Promise<ServiceCategoryRecord> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Category name cannot be empty');
  }
  const ref = doc(collection(db, COLLECTION));
  const payload: ServiceCategoryRecord = {
    categoryId: ref.id,
    name: trimmed,
  };
  await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
  return payload;
}
