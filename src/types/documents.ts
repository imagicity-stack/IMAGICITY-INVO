export type DocumentStatus = "draft" | "open" | "paid" | "void";
export type DocumentKind = "invoice" | "quotation";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  hsnSac?: string;
  gstRate?: number;
}

export interface PartyDetails {
  name: string;
  email: string;
  address: string;
  gstin?: string;
  state?: string;
}

export interface MonetarySummary {
  subtotal: number;
  taxTotal: number;
  total: number;
}

export interface GSTConfig {
  enabled: boolean;
  gstin?: string;
  placeOfSupply?: string;
  taxRate?: number;
  narration?: string;
}

export interface DocumentRecord extends MonetarySummary {
  id?: string;
  title: string;
  documentNumber: string;
  kind: DocumentKind;
  status: DocumentStatus;
  currency: string;
  issueDate: string;
  dueDate: string;
  client: PartyDetails;
  issuer: PartyDetails;
  items: LineItem[];
  notes?: string;
  attachments?: string[];
  gst: GSTConfig;
  createdBy: string;
  createdAt: number;
  finalizedAt?: number;
  paidAt?: number;
  voidedAt?: number;
  voidReason?: string;
  brandLogoUrl?: string;
}
