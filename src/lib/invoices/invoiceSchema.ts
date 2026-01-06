import { z } from 'zod';
import { DiscountType, InvoiceItemPayload, InvoicePaymentPayload, InvoiceStatus } from './invoiceTypes';

const addressSchema = z.object({
  line1: z.string().min(1, 'Line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  stateCode: z.string().min(1, 'State code is required'),
});

export const clientSnapshotSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  brandName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  billingAddress: addressSchema,
  shippingAddress: addressSchema.optional(),
  gstRegistered: z.boolean(),
  gstin: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  itemId: z.string().optional(),
  source: z.enum(['service', 'custom']),
  serviceId: z.string().nullable().optional(),
  nameSnapshot: z.string().min(1, 'Item name is required'),
  descriptionSnapshot: z.string().nullable().optional(),
  unitLabelSnapshot: z.string().min(1, 'Unit label is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  rateSnapshot: z.number().nonnegative('Rate must be zero or more'),
  gstRateSnapshot: z.number().nonnegative('GST rate is required'),
  taxIncludedSnapshot: z.boolean(),
  lineSubTotal: z.number(),
  lineTax: z.number(),
  lineTotal: z.number(),
});

export const invoicePaymentSchema = z.object({
  paymentId: z.string().optional(),
  paymentDate: z.date(),
  amount: z.number().positive('Payment must be greater than zero'),
  mode: z.enum(['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Online Gateway', 'Other']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const invoiceFormSchema = z.object({
  invoiceId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  status: z.enum(['Draft', 'Issued', 'Partially Paid', 'Paid', 'Void', 'Overdue']).default('Draft'),
  source: z.enum(['manual', 'quotation']).default('manual'),
  quotationId: z.string().nullable().optional(),
  clientSnapshot: clientSnapshotSchema,
  shippingAddress: addressSchema.optional(),
  placeOfSupplyStateCode: z.string().min(1, 'Place of supply is required'),
  currency: z.string().default('INR'),
  issueDate: z.date().nullable(),
  dueDate: z.date().nullable(),
  paymentTerms: z.string().optional(),
  subTotal: z.number(),
  discountType: z.enum(['None', 'Flat', 'Percent']),
  discountValue: z.number().nonnegative(),
  taxTotal: z.number(),
  roundOff: z.number().default(0),
  grandTotal: z.number(),
  amountPaid: z.number().default(0),
  balanceDue: z.number(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  isArchived: z.boolean().default(false),
  items: invoiceItemSchema.array().min(1, 'Add at least one line item'),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type InvoicePaymentFormData = z.infer<typeof invoicePaymentSchema>;

export function coerceInvoiceItems(items: InvoiceItemPayload[]): InvoiceItemPayload[] {
  return items.map((item) => ({
    ...item,
    quantity: Number(item.quantity || 0),
    rateSnapshot: Number(item.rateSnapshot || 0),
    gstRateSnapshot: Number(item.gstRateSnapshot || 0),
    lineSubTotal: Number(item.lineSubTotal || 0),
    lineTax: Number(item.lineTax || 0),
    lineTotal: Number(item.lineTotal || 0),
  }));
}

export function coerceInvoicePayments(payments: InvoicePaymentPayload[]): InvoicePaymentPayload[] {
  return payments.map((payment) => ({
    ...payment,
    amount: Number(payment.amount || 0),
    paymentDate: payment.paymentDate instanceof Date ? payment.paymentDate : new Date(payment.paymentDate as any),
  }));
}
