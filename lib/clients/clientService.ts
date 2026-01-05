import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Client, ClientPayload } from './clientTypes';

const collectionName = 'clients';
const clientsCollection = collection(db, collectionName);

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
  const docData = {
    ...payload,
    clientId: payload.clientId || undefined,
    isArchived: payload.isArchived ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(clientsCollection, docData);
  await updateDoc(docRef, { clientId: payload.clientId || docRef.id });
  return docRef.id;
};

export const updateClient = async (id: string, payload: Partial<ClientPayload>): Promise<void> => {
  const docRef = doc(clientsCollection, id);
  await updateDoc(docRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
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
