import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import stripUndefined from '../utils/stripUndefined';
import { serviceSchema, ServiceInput } from './serviceSchema';
import {
  InvoiceLineItemSnapshot,
  ListServicesParams,
  Service,
} from './serviceTypes';

const COLLECTION = 'services';

export async function createService(data: ServiceInput): Promise<Service> {
  const ref = doc(collection(db, COLLECTION));
  const parsed = serviceSchema.parse({ ...data, serviceId: ref.id });

  const payload = stripUndefined({
    ...parsed,
    serviceId: ref.id,
    currency: parsed.currency || 'INR',
    gstRate: parsed.gstRate ?? 18,
    requiresBrief: parsed.requiresBrief ?? true,
    taxIncluded: parsed.taxIncluded ?? false,
    isArchived: parsed.isArchived ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(ref, payload);
  const snapshot = await getDoc(ref);
  return snapshot.data() as Service;
}

export async function updateService(id: string, data: Partial<ServiceInput>): Promise<void> {
  const parsed = serviceSchema.partial().parse(data);
  const payload = stripUndefined({
    ...parsed,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function archiveService(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    isArchived: true,
    status: 'Inactive',
    updatedAt: serverTimestamp(),
  });
}

export async function restoreService(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    isArchived: false,
    status: 'Active',
    updatedAt: serverTimestamp(),
  });
}

export async function getServiceById(id: string): Promise<Service | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return snapshot.data() as Service;
}

function applySearchFilter(services: Service[], search?: string) {
  if (!search?.trim()) return services;
  const term = search.toLowerCase();
  return services.filter((service) => {
    const tags = service.tags || [];
    return (
      service.name.toLowerCase().includes(term) ||
      service.category.toLowerCase().includes(term) ||
      tags.some((tag) => tag.toLowerCase().includes(term))
    );
  });
}

function buildQuery(params?: ListServicesParams) {
  const filters = params?.filters;
  const constraints: any[] = [];

  if (!params?.includeArchived) {
    constraints.push(where('isArchived', '==', false));
  }

  if (filters?.category) {
    constraints.push(where('category', '==', filters.category));
  }

  if (filters?.pricingModel) {
    constraints.push(where('pricingModel', '==', filters.pricingModel));
  }

  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }

  constraints.push(orderBy('name'));

  return query(collection(db, COLLECTION), ...constraints);
}

export async function listServices(params?: ListServicesParams): Promise<Service[]> {
  const q = buildQuery(params);
  const snapshot = await getDocs(q);
  const services = snapshot.docs.map((docSnap) => docSnap.data() as Service);
  return applySearchFilter(services, params?.search);
}

export function buildInvoiceLineItemFromService(
  service: Service,
  quantity: number,
): InvoiceLineItemSnapshot {
  const rate = Number(service.rate || 0);
  const gst = Number(service.gstRate || 0);
  const totalBeforeTax = rate * quantity;
  const taxAmount = service.taxIncluded
    ? totalBeforeTax - totalBeforeTax / (1 + gst / 100)
    : totalBeforeTax * (gst / 100);
  const totalWithTax = service.taxIncluded ? totalBeforeTax : totalBeforeTax + taxAmount;

  return {
    serviceId: service.serviceId,
    quantity,
    nameSnapshot: service.name,
    rateSnapshot: rate,
    gstSnapshot: gst,
    pricingModelSnapshot: service.pricingModel,
    currencySnapshot: service.currency || 'INR',
    unitLabelSnapshot: service.unitLabel,
    taxIncludedSnapshot: service.taxIncluded,
    totalBeforeTax,
    taxAmount,
    totalWithTax,
  };
}
