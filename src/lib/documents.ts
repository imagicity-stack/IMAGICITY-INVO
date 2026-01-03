import { DocumentRecord, LineItem } from "@/types/documents";

export function calculateTotals(items: LineItem[], gstEnabled: boolean, defaultRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxTotal = gstEnabled
    ? items.reduce((sum, item) => {
        const rate = item.gstRate ?? defaultRate;
        return sum + (item.quantity * item.rate * rate) / 100;
      }, 0)
    : 0;
  const total = subtotal + taxTotal;
  return { subtotal, taxTotal, total };
}

export function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function canEdit(record?: DocumentRecord | null) {
  if (!record) return true;
  return record.status === "draft";
}

export function canFinalize(record?: DocumentRecord | null) {
  if (!record) return false;
  return record.status === "draft" && record.items.length > 0;
}

export function canMarkPaid(record?: DocumentRecord | null) {
  if (!record) return false;
  return record.status === "open";
}

export function canVoid(record?: DocumentRecord | null) {
  if (!record) return false;
  return record.status === "draft" || record.status === "open";
}
