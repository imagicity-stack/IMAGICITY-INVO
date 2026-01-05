export type InvoiceStatus = "draft" | "final" | "paid" | "void";

export const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["final", "void"],
  final: ["paid", "void"],
  paid: ["void"],
  void: [],
};

export const statusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  final: "Finalized",
  paid: "Paid",
  void: "Voided",
};

export const statusClasses: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  final: "bg-brand-red/10 text-brand-red",
  paid: "bg-emerald-100 text-emerald-800",
  void: "bg-amber-100 text-amber-800",
};

export interface GstBreakdown {
  taxableValue: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cess?: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate?: number;
  hsnSac?: string;
}

export interface InvoiceDocument {
  id?: string;
  status: InvoiceStatus;
  reference: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  gstNumber?: string;
  placeOfSupply?: string;
  billFrom?: string;
  date: string;
  dueDate?: string;
  currency: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  gstBreakdown?: GstBreakdown;
  createdBy: string;
  createdByRole: string;
  finalizedAt?: string;
  paidAt?: string;
  voidReason?: string;
  voidedAt?: string;
  source?: "invoice" | "quotation";
  attachmentUrls?: string[];
}

export function calculateGst(values: InvoiceItem[], gstEnabled: boolean): GstBreakdown {
  const base = values.reduce(
    (acc, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const gstPortion = gstEnabled && item.gstRate ? (lineTotal * item.gstRate) / 100 : 0;
      return {
        taxableValue: acc.taxableValue + lineTotal,
        cgst: acc.cgst + gstPortion / 2,
        sgst: acc.sgst + gstPortion / 2,
        igst: acc.igst,
        cess: acc.cess,
      };
    },
    { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, cess: 0 }
  );

  return base;
}

export function computeTotals(items: InvoiceItem[], gstEnabled: boolean) {
  const gst = calculateGst(items, gstEnabled);
  const subtotal = gst.taxableValue;
  const taxTotal = (gst.cgst ?? 0) + (gst.sgst ?? 0) + (gst.igst ?? 0) + (gst.cess ?? 0);
  const grandTotal = subtotal + taxTotal;

  return { subtotal, taxTotal, grandTotal, gstBreakdown: gst };
}

export function canTransition(current: InvoiceStatus, target: InvoiceStatus) {
  return allowedTransitions[current]?.includes(target);
}
