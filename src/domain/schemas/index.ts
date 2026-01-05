import { z } from 'zod';

export const addressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
});

export const clientSchema = z.object({
  name: z.string().min(2),
  companyName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  gstin: z.string().optional(),
  billingAddress: addressSchema,
  shippingAddress: addressSchema.optional(),
  defaultPaymentTermsDays: z.number().min(0).default(15),
  notes: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(2),
  unitType: z.enum(['Project', 'Month', 'Hour', 'Quantity']),
  defaultRate: z.number().nonnegative(),
  gstRatePercent: z.number().default(18),
  description: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  qty: z.number().positive(),
  unitRate: z.number().nonnegative(),
  discountPercent: z.number().min(0).max(100).optional(),
  gstRatePercent: z.number().min(0).max(50).default(18),
  serviceId: z.string().optional(),
});

export const invoiceSchema = z.object({
  clientId: z.string(),
  projectId: z.string().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
  items: z.array(invoiceItemSchema).min(1),
  notes: z.string().optional(),
  termsText: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
