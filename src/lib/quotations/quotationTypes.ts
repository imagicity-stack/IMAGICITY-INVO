import { Timestamp } from 'firebase/firestore';

export type ClientMode = 'existing' | 'new';

export interface ClientSnapshotAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  stateCode: string;
}

export interface ClientSnapshot {
  legalName: string;
  brandName?: string;
  email?: string;
  phone?: string;
  billingAddress: ClientSnapshotAddress;
  gstRegistered: boolean;
  gstin?: string;
}

export interface QuotationItem {
  itemId: string;
  source: 'service' | 'custom';
  serviceId?: string | null;
  nameSnapshot: string;
  descriptionSnapshot?: string;
  unitLabelSnapshot: string;
  rateSnapshot: number;
  gstRateSnapshot: number;
  taxIncludedSnapshot: boolean;
  quantity: number;
  lineSubTotal: number;
  lineTax: number;
  lineTotal: number;
}

export interface Quotation {
  quoteId: string;
  quoteNumber: string;
  clientMode: ClientMode;
  clientId?: string | null;
  clientSnapshot: ClientSnapshot;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired' | 'Converted';
  issueDate: Timestamp | null;
  validUntil: Timestamp | null;
  currency: string;
  discountType: 'None' | 'Flat' | 'Percent';
  discountValue: number;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
  terms?: string;
  isArchived: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface QuotationWithItems extends Quotation {
  items: QuotationItem[];
}

export interface ListQuotationParams {
  search?: string;
  status?: Quotation['status'] | 'All';
  includeArchived?: boolean;
}

export interface QuotationPayload extends Omit<Quotation, 'quoteId' | 'createdAt' | 'updatedAt'> {
  quoteId?: string;
}

export interface QuotationItemPayload extends Omit<QuotationItem, 'itemId'> {
  itemId?: string;
}
