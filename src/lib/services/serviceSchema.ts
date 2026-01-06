import { z } from 'zod';
import { PricingModel, ServiceCategory, ServiceStatus, ServiceType } from './serviceTypes';

const typeEnum = z.enum(['Service', 'Package', 'Add-on']);
const pricingEnum = z.enum(['Fixed', 'Hourly', 'Monthly', 'Per Unit']);
const statusEnum = z.enum(['Active', 'Inactive']);

export const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: typeEnum.default('Service'),
  category: z
    .string()
    .min(1, 'Category is required')
    .transform((val) => val.trim())
    .pipe(z.string().min(1, 'Category is required')) as unknown as z.ZodType<ServiceCategory>,
  description: z.string().optional().or(z.literal('').transform(() => undefined)),
  deliverables: z
    .union([z.array(z.string().min(1)), z.string()])
    .optional()
    .transform((value) => {
      if (typeof value === 'string') {
        const items = value
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean);
        return items.length ? items : undefined;
      }
      return value && value.length ? value : undefined;
    }),
  pricingModel: pricingEnum,
  rate: z
    .number()
    .min(0, 'Rate cannot be negative')
    .or(z.string())
    .transform((val) => (typeof val === 'string' ? Number(val) : val))
    .pipe(z.number().min(0, 'Rate cannot be negative')),
  currency: z.string().default('INR'),
  gstRate: z
    .number()
    .min(0, 'GST cannot be negative')
    .max(28, 'GST cannot exceed 28%')
    .or(z.string())
    .transform((val) => (typeof val === 'string' ? Number(val) : val))
    .pipe(z.number().min(0).max(28)),
  taxIncluded: z.boolean().default(false),
  unitLabel: z.string().min(1, 'Unit label is required'),
  turnaroundDays: z
    .number()
    .int()
    .min(0, 'Turnaround days cannot be negative')
    .optional()
    .or(z.string())
    .transform((val) => {
      if (val === '' || val === undefined) return undefined;
      if (typeof val === 'string') return Number(val);
      return val;
    })
    .pipe(z.number().int().min(0).optional()),
  requiresBrief: z.boolean().default(true),
  internalCost: z
    .number()
    .min(0, 'Internal cost cannot be negative')
    .optional()
    .or(z.string())
    .transform((val) => {
      if (val === '' || val === undefined) return undefined;
      if (typeof val === 'string') return Number(val);
      return val;
    })
    .pipe(z.number().min(0).optional()),
  notesInternal: z.string().optional().or(z.literal('').transform(() => undefined)),
  tags: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((value) => {
      if (typeof value === 'string') {
        const tags = value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
        return tags.length ? tags : undefined;
      }
      return value && value.length ? value : undefined;
    }),
  status: statusEnum,
  isArchived: z.boolean().default(false),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
