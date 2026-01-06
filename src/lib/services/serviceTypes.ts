import { Timestamp } from 'firebase/firestore';

export type ServiceType = 'Service' | 'Package' | 'Add-on';
export type ServiceCategory = 'Branding' | 'Web' | 'Marketing' | 'Ads' | 'Content' | 'Design' | 'Other';
export type PricingModel = 'Fixed' | 'Hourly' | 'Monthly' | 'Per Unit';
export type ServiceStatus = 'Active' | 'Inactive';

export interface Service {
  serviceId: string;
  name: string;
  type: ServiceType;
  category: ServiceCategory;
  description?: string;
  deliverables?: string[];
  pricingModel: PricingModel;
  rate: number;
  currency: string;
  gstRate: number;
  taxIncluded: boolean;
  unitLabel: string;
  turnaroundDays?: number;
  requiresBrief: boolean;
  internalCost?: number;
  notesInternal?: string;
  tags?: string[];
  status: ServiceStatus;
  isArchived: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ServiceFilters {
  category?: ServiceCategory;
  pricingModel?: PricingModel;
  status?: ServiceStatus;
}

export interface ListServicesParams {
  includeArchived?: boolean;
  filters?: ServiceFilters;
  search?: string;
}

export interface InvoiceLineItemSnapshot {
  serviceId: string;
  quantity: number;
  nameSnapshot: string;
  rateSnapshot: number;
  gstSnapshot: number;
  pricingModelSnapshot: PricingModel;
  currencySnapshot: string;
  unitLabelSnapshot: string;
  taxIncludedSnapshot: boolean;
  totalBeforeTax: number;
  taxAmount: number;
  totalWithTax: number;
}
