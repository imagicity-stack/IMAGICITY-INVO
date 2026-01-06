import { Timestamp } from 'firebase/firestore';

export type InvoiceStatus = 'Draft' | 'Issued' | 'Partially Paid' | 'Paid' | 'Void' | 'Overdue';
export type InvoiceSource = 'manual' | 'quotation';
export type DiscountType = 'None' | 'Flat' | 'Percent';

export interface AddressSnapshot {
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
  billingAddress: AddressSnapshot;
  shippingAddress?: AddressSnapshot;
  gstRegistered: boolean;
  gstin?: string;
}

export interface InvoiceItem {
  itemId: string;
  source: 'service' | 'custom';
  serviceId?: string | null;
  nameSnapshot: string;
  descriptionSnapshot?: string | null;
  unitLabelSnapshot: string;
  quantity: number;
  rateSnapshot: number;
  gstRateSnapshot: number;
  taxIncludedSnapshot: boolean;
  lineSubTotal: number;
  lineTax: number;
  lineTotal: number;
}

export interface InvoicePayment {
  paymentId: string;
  paymentDate: Timestamp;
  amount: number;
  mode: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Online Gateway' | 'Other';
  reference?: string;
  notes?: string;
  createdAt?: Timestamp;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  source: InvoiceSource;
  quotationId: string | null;
  clientSnapshot: ClientSnapshot;
  shippingAddress?: AddressSnapshot;
  placeOfSupplyStateCode: string;
  currency: string;
  issueDate: Timestamp | null;
  dueDate: Timestamp | null;
  paymentTerms?: string;
  subTotal: number;
  discountType: DiscountType;
  discountValue: number;
  taxTotal: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  isArchived: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface InvoicePayload extends Omit<Invoice, 'invoiceId' | 'createdAt' | 'updatedAt'> {
  invoiceId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface InvoiceItemPayload extends Omit<InvoiceItem, 'itemId'> {
  itemId?: string;
}

export interface InvoicePaymentPayload extends Omit<InvoicePayment, 'paymentId'> {
  paymentId?: string;
}

export interface ListInvoiceParams {
  search?: string;
  status?: InvoiceStatus | 'All';
  includeArchived?: boolean;
  overdueOnly?: boolean;
}
