import { DiscountType, InvoiceItemPayload } from './invoiceTypes';

interface TaxSplitResult {
  lineSubTotal: number;
  lineTax: number;
  lineTotal: number;
}

export function computeLineTotals(item: InvoiceItemPayload): TaxSplitResult {
  const rate = Number(item.rateSnapshot || 0);
  const qty = Number(item.quantity || 0);
  const gstRate = Number(item.gstRateSnapshot || 0) / 100;
  const taxIncluded = item.taxIncludedSnapshot;

  const base = rate * qty;

  if (taxIncluded) {
    const divisor = 1 + gstRate;
    const subTotal = base / divisor;
    const tax = base - subTotal;
    return { lineSubTotal: round(subTotal), lineTax: round(tax), lineTotal: round(base) };
  }

  const tax = base * gstRate;
  return { lineSubTotal: round(base), lineTax: round(tax), lineTotal: round(base + tax) };
}

export function computeDiscount(subTotal: number, discountType: DiscountType, discountValue: number): number {
  if (discountType === 'Flat') return discountValue;
  if (discountType === 'Percent') return (subTotal * discountValue) / 100;
  return 0;
}

export function computeTotals(items: InvoiceItemPayload[], discountType: DiscountType, discountValue: number, roundOff = 0) {
  const normalized = items.map((item) => ({ ...item, ...computeLineTotals(item) }));
  const subTotal = normalized.reduce((sum, item) => sum + item.lineSubTotal, 0);
  const taxTotal = normalized.reduce((sum, item) => sum + item.lineTax, 0);
  const discount = computeDiscount(subTotal, discountType, discountValue);
  const grandTotal = round(subTotal - discount + taxTotal + roundOff);
  const balanceDue = grandTotal;

  return {
    items: normalized,
    subTotal: round(subTotal),
    taxTotal: round(taxTotal),
    discount,
    grandTotal,
    balanceDue,
  };
}

export function splitGst(placeOfSupplyStateCode: string, companyStateCode: string, gstAmount: number) {
  if (placeOfSupplyStateCode === companyStateCode) {
    const half = round(gstAmount / 2);
    return { cgst: half, sgst: gstAmount - half, igst: 0 };
  }
  return { cgst: 0, sgst: 0, igst: gstAmount };
}

export function round(value: number, decimals = 2) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
