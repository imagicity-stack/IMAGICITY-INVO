export type InvoiceStatus = "draft" | "open" | "paid" | "void";
export type DocumentKind = "invoice" | "quotation";

export interface Party {
  name: string;
  address: string;
  gstin?: string;
  email?: string;
  phone?: string;
  stateCode?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  sacHsn?: string;
  gstRate?: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
}

export interface BillingDocument {
  id: string;
  kind: DocumentKind;
  status: InvoiceStatus;
  number: string;
  issueDate: string;
  dueDate?: string;
  seller: Party;
  buyer: Party;
  items: LineItem[];
  notes?: string;
  terms?: string;
  currency?: string;
  gstEnabled: boolean;
  placeOfSupply?: string;
  reverseCharge?: boolean;
  finalizedAt?: string;
  voidReason?: string;
  paidAt?: string;
  totalTax?: number;
  subtotal?: number;
  total?: number;
  createdBy: string;
  updatedAt?: string;
  attachments?: Attachment[];
}

export interface LogoConfig {
  url: string;
  updatedBy: string;
  updatedAt: string;
}
