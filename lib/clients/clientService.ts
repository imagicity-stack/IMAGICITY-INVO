import {
  Timestamp,
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Client, ClientPayload } from './clientTypes';

const collectionName = 'clients';
const clientsCollection = collection(db, collectionName);

const removeUndefined = (value: any): any => {
  if (Array.isArray(value)) return value.map((entry) => removeUndefined(entry));
  if (value && value.constructor === Object) {
    const cleaned: Record<string, any> = {};
    Object.entries(value).forEach(([key, val]) => {
      if (val === undefined) return;
      cleaned[key] = removeUndefined(val);
    });
    return cleaned;
  }
  return value;
};

const mapClient = (snapshot: any): Client => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt as Timestamp | undefined,
    updatedAt: data.updatedAt as Timestamp | undefined,
  } as Client;
};

export const fetchClients = async (options: {
  status?: string;
  includeArchived?: boolean;
  search?: string;
}): Promise<Client[]> => {
  const filters = [] as any[];

  if (!options.includeArchived) {
    filters.push(where('isArchived', '==', false));
  }

  if (options.status && options.status !== 'All') {
    filters.push(where('status', '==', options.status));
  }

  const q = filters.length ? query(clientsCollection, ...filters) : query(clientsCollection);

  const snapshot = await getDocs(q);
  const searchTerm = options.search?.toLowerCase().trim();

  return snapshot.docs
    .map((docSnapshot) => mapClient(docSnapshot))
    .filter((client) => {
      if (!searchTerm) return true;
      const haystack = [
        client.legalName,
        client.brandName,
        client.email,
        client.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(searchTerm);
    });
};

export const fetchClientById = async (id: string): Promise<Client | null> => {
  const snapshot = await getDoc(doc(clientsCollection, id));
  if (!snapshot.exists()) return null;
  return mapClient(snapshot);
};

export const createClient = async (payload: ClientPayload): Promise<string> => {
  const docRef = doc(clientsCollection);
  const clientId = payload.clientId?.trim() || docRef.id;
  const docData = removeUndefined({
    ...payload,
    clientId,
    isArchived: payload.isArchived ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await setDoc(docRef, docData);
  return docRef.id;
};

export const updateClient = async (id: string, payload: Partial<ClientPayload>): Promise<void> => {
  const docRef = doc(clientsCollection, id);
  const cleanedPayload = removeUndefined({
    ...payload,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(docRef, cleanedPayload);
};

export const archiveClient = async (id: string): Promise<void> => {
  await updateDoc(doc(clientsCollection, id), {
    isArchived: true,
    status: 'Inactive',
    updatedAt: serverTimestamp(),
  });
};

export const restoreClient = async (id: string): Promise<void> => {
  await updateDoc(doc(clientsCollection, id), {
    isArchived: false,
    status: 'Active',
    updatedAt: serverTimestamp(),
  });
};

export const deleteClient = async (id: string): Promise<void> => {
  await deleteDoc(doc(clientsCollection, id));
};
