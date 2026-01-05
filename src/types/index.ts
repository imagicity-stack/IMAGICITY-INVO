import { InvoiceDocument, InvoiceItem, InvoiceStatus } from "@/lib/invoiceLogic";

export type { InvoiceDocument, InvoiceItem, InvoiceStatus };

export interface ClientProfile {
  id?: string;
  name: string;
  email: string;
  address?: string;
  gstNumber?: string;
  contactPerson?: string;
  notes?: string;
}
