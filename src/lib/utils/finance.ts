import { format } from "date-fns";
import { LineItem, TaxDetail, Totals } from "../types";

export const INDIA_FY_MONTH_BOUNDARY = 3; // March end

export function computeFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month <= INDIA_FY_MONTH_BOUNDARY) {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
  return `${year}-${String(year + 1).slice(-2)}`;
}

export function formatFinancialNumber(prefix: string, fy: string, seq: number): string {
  return `${prefix}-${fy}-${String(seq).padStart(4, "0")}`;
}

export function computeLineTotals(items: LineItem[], tax: TaxDetail): Totals {
  const subTotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountTotal = items.reduce((sum, item) => {
    if (item.discountType === "FLAT") return sum + (item.discountValue || 0);
    if (item.discountType === "PERCENT") {
      return sum + ((item.discountValue || 0) / 100) * item.qty * item.rate;
    }
    return sum;
  }, 0);

  const taxableValue = subTotal - discountTotal;

  const taxAmounts = { cgst: 0, sgst: 0, igst: 0 };
  if (tax.enabled && tax.mode !== "NONE") {
    const base = taxableValue;
    if (tax.mode === "CGST_SGST") {
      taxAmounts.cgst = base * ((tax.rates.cgst || 0) / 100);
      taxAmounts.sgst = base * ((tax.rates.sgst || 0) / 100);
    }
    if (tax.mode === "IGST") {
      taxAmounts.igst = base * ((tax.rates.igst || 0) / 100);
    }
  }

  const taxTotal = taxAmounts.cgst + taxAmounts.sgst + taxAmounts.igst;
  const grandTotal = taxableValue + taxTotal;

  return {
    subTotal,
    discountTotal,
    taxableValue,
    taxTotal,
    grandTotal,
    amountPaid: 0,
    amountDue: grandTotal,
  };
}

export function formatDate(value?: string | Date) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "dd MMM yyyy");
}
