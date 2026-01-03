export type DocumentType = "quotation" | "invoice" | "proforma" | "receipt" | "credit_note";

export type DocumentStatus =
  | "DRAFT"
  | "OPEN"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "VOID"
  | "UNCOLLECTIBLE";

export type TaxMode = "NONE" | "CGST_SGST" | "IGST";

export type DiscountType = "NONE" | "FLAT" | "PERCENT";

export interface Address {
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface CompanySettings {
  legalName: string;
  brandName: string;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  gstin?: string;
  state?: string;
  placeOfSupplyDefault?: string;
  logoUrl?: string;
  bankDetails?: {
    accountName?: string;
    accountNo?: string;
    ifsc?: string;
    bankName?: string;
    upiId?: string;
    upiQrUrl?: string;
  };
  defaultTerms?: string;
  defaultNotes?: string;
  defaultTaxRates?: {
    cgst?: number;
    sgst?: number;
    igst?: number;
  };
  currency?: string;
}

export interface Client {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  billingAddress?: Address;
  gstin?: string;
  placeOfSupplyState?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Item {
  id?: string;
  name: string;
  description?: string;
  defaultRate: number;
  sacOrHsn?: string;
  taxable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LineItem {
  itemId?: string;
  title: string;
  description?: string;
  qty: number;
  unit?: string;
  rate: number;
  discountType: DiscountType;
  discountValue?: number;
  taxable: boolean;
  sacOrHsn?: string;
}

export interface TaxDetail {
  enabled: boolean;
  mode: TaxMode;
  rates: { cgst?: number; sgst?: number; igst?: number };
  amounts: { cgst?: number; sgst?: number; igst?: number };
  placeOfSupplyState?: string;
}

export interface Totals {
  subTotal: number;
  discountTotal: number;
  taxableValue: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
}

export interface Document {
  id?: string;
  type: DocumentType;
  status: DocumentStatus;
  number?: string;
  seq?: number;
  financialYear?: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  clientId: string;
  clientSnapshot: Omit<Client, "id">;
  sellerSnapshot: CompanySettings;
  lineItems: LineItem[];
  tax: TaxDetail;
  totals: Totals;
  notes?: string;
  terms?: string;
  metadata: {
    createdAt: string;
    updatedAt?: string;
    finalizedAt?: string;
    sentAt?: string;
    voidedAt?: string;
    voidReason?: string;
    sourceDocumentId?: string;
  };
  pdf?: {
    url?: string;
    path?: string;
    generatedAt?: string;
    version?: number;
    checksum?: string;
  };
}

export interface Payment {
  id?: string;
  documentId: string;
  amount: number;
  mode: "CASH" | "UPI" | "BANK" | "CARD" | "OTHER";
  referenceId?: string;
  paidAt: string;
  notes?: string;
}

export interface AuditLog {
  id?: string;
  actorUid?: string;
  documentId?: string;
  action:
    | "CREATE"
    | "UPDATE"
    | "FINALIZE"
    | "PDF_GENERATE"
    | "SEND"
    | "ADD_PAYMENT"
    | "VOID"
    | "STATUS_CHANGE";
  changes?: string;
  createdAt: string;
}

export interface Counter {
  currentNumber: number;
}

export interface UserDoc {
  email: string;
  role: "admin";
  createdAt: string;
}
