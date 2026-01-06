import { z } from 'zod';

export const clientSnapshotSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  brandName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  billingAddress: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    pincode: z.string().min(1, 'Pincode is required'),
    stateCode: z.string().min(1, 'State code is required'),
  }),
  gstRegistered: z.boolean(),
  gstin: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.gstRegistered && !data.gstin) {
    ctx.addIssue({ code: 'custom', message: 'GSTIN is required', path: ['gstin'] });
  }
});

export const quotationItemSchema = z.object({
  itemId: z.string().optional(),
  source: z.enum(['service', 'custom']),
  serviceId: z.string().optional().nullable(),
  nameSnapshot: z.string().min(1, 'Item name is required'),
  descriptionSnapshot: z.string().optional(),
  unitLabelSnapshot: z.string().min(1, 'Unit is required'),
  rateSnapshot: z.number().min(0, 'Rate must be positive'),
  gstRateSnapshot: z.number().min(0, 'GST rate is required'),
  taxIncludedSnapshot: z.boolean(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  lineSubTotal: z.number(),
  lineTax: z.number(),
  lineTotal: z.number(),
});

export const quotationSchema = z
  .object({
    quoteId: z.string().optional(),
    quoteNumber: z.string().min(1, 'Quote number is required'),
    clientMode: z.enum(['existing', 'new']),
    clientId: z.string().nullable().optional(),
    clientSnapshot: clientSnapshotSchema,
    status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted']).default('Draft'),
    issueDate: z.date().nullable().optional(),
    validUntil: z.date().nullable().optional(),
    currency: z.string().default('INR'),
    discountType: z.enum(['None', 'Flat', 'Percent']).default('None'),
    discountValue: z.number().min(0).default(0),
    subTotal: z.number().default(0),
    taxTotal: z.number().default(0),
    grandTotal: z.number().default(0),
    notes: z.string().optional(),
    terms: z.string().optional(),
    isArchived: z.boolean().default(false),
    items: z.array(quotationItemSchema),
  })
  .superRefine((data, ctx) => {
    if (data.clientMode === 'existing' && !data.clientId) {
      ctx.addIssue({ code: 'custom', message: 'Select an existing client', path: ['clientId'] });
    }
    if (data.clientMode === 'new' && !data.clientSnapshot.legalName) {
      ctx.addIssue({ code: 'custom', message: 'Legal name is required', path: ['clientSnapshot', 'legalName'] });
    }
    if (data.items.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Add at least one item', path: ['items'] });
    }
  });

export type QuotationFormData = z.infer<typeof quotationSchema>;
