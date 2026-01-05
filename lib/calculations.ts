import { BillingDocument, LineItem } from "./types";

export function computeItemTotals(item: LineItem) {
  const lineTotal = item.quantity * item.unitPrice;
  const taxRate = item.gstRate ?? 0;
  const taxAmount = (lineTotal * taxRate) / 100;
  return { lineTotal, taxAmount };
}

export function computeDocumentTotals(doc: BillingDocument) {
  const subtotal = doc.items.reduce((sum, item) => sum + computeItemTotals(item).lineTotal, 0);
  const totalTax = doc.gstEnabled
    ? doc.items.reduce((sum, item) => sum + computeItemTotals(item).taxAmount, 0)
    : 0;
  const total = subtotal + totalTax;
  return { subtotal, totalTax, total };
}
