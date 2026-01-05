import { z } from 'zod';
import {
  clientSourceOptions,
  clientStatusOptions,
  clientTypeOptions,
  paymentModeOptions,
  paymentTermOptions,
  reminderFrequencyOptions,
  taxPreferenceOptions,
} from './clientTypes';

const stringOrUndefined = z
  .string()
  .optional()
  .transform((val) => (val && val.trim().length ? val.trim() : undefined));

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const parsed = typeof val === 'string' ? Number(val) : val;
    return Number.isFinite(parsed) ? parsed : undefined;
  });

export const billingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: stringOrUndefined,
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(3, 'Pincode is required'),
  stateCode: z.string().min(1, 'State code is required'),
});

export const clientFormSchema = z
  .object({
    clientId: stringOrUndefined,
    clientType: z.enum(clientTypeOptions),
    legalName: z.string().min(1, 'Legal name is required'),
    brandName: stringOrUndefined,
    contactPerson: z.string().min(1, 'Contact person is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(7, 'Phone is required'),
    status: z.enum(clientStatusOptions),
    billingAddress: billingAddressSchema,
    gstRegistered: z.boolean(),
    gstin: stringOrUndefined,
    pan: stringOrUndefined,
    currency: z.string().default('INR'),
    paymentTerms: z.enum(paymentTermOptions),
    preferredPaymentMode: z.enum(paymentModeOptions),
    creditLimit: optionalNumber,
    taxPreference: z.enum(taxPreferenceOptions),
    accountOwner: stringOrUndefined,
    clientSource: z.enum(clientSourceOptions),
    industryType: stringOrUndefined,
    tags: z.array(z.string()).optional(),
    notes: stringOrUndefined,
    autoSendInvoice: z.boolean(),
    autoReminderEnabled: z.boolean(),
    reminderFrequencyDays: optionalNumber,
    lateFeeApplicable: z.boolean(),
    isArchived: z.boolean().default(false),
  })
  .superRefine((values, ctx) => {
    if (values.gstRegistered && !values.gstin) {
      ctx.addIssue({
        path: ['gstin'],
        code: z.ZodIssueCode.custom,
        message: 'GSTIN is required when GST is registered',
      });
    }

    if (values.autoReminderEnabled && values.reminderFrequencyDays === undefined) {
      ctx.addIssue({
        path: ['reminderFrequencyDays'],
        code: z.ZodIssueCode.custom,
        message: 'Reminder frequency is required when reminders are enabled',
      });
    }

    if (
      values.reminderFrequencyDays !== undefined &&
      !reminderFrequencyOptions.includes(values.reminderFrequencyDays as 3 | 7)
    ) {
      ctx.addIssue({
        path: ['reminderFrequencyDays'],
        code: z.ZodIssueCode.custom,
        message: 'Reminder frequency must be 3 or 7 days',
      });
    }
  });

export type ClientFormData = z.infer<typeof clientFormSchema>;
