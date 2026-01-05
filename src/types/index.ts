export type Role = "admin" | "staff" | "viewer";

export interface UserProfile {
  uid?: string;
  email: string;
  displayName?: string;
  role: Role;
  active: boolean;
}

export interface Address {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  gstin?: string;
  billingAddress: Address;
  createdAt: number | Date;
  createdBy: string;
}

export type DocumentType = "invoice" | "quotation";
export type TaxMode = "gst" | "non-gst";

export interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  discount?: number;
  gstRate?: number;
  hsn?: string;
  sac?: string;
}

export interface DocumentBase {
  id?: string;
  documentNumber: string;
  documentDate: string;
  dueDate?: string;
  customerId: string;
  customerName: string;
  placeOfSupply?: string;
  type: DocumentType;
  taxMode: TaxMode;
  lineItems: LineItem[];
  additionalCharges?: number;
  roundOff?: number;
  notes?: string;
  terms?: string;
  status?: "draft" | "sent" | "paid" | "accepted" | "rejected";
  createdAt: number | Date;
  createdBy: string;
  updatedAt?: number | Date;
}

export interface StorageAsset {
  id?: string;
  name: string;
  url: string;
  uploadedAt: number | Date;
  uploadedBy: string;
}
