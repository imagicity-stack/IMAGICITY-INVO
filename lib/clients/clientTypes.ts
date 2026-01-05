import { Timestamp } from 'firebase/firestore';

export const clientTypeOptions = ['Individual', 'Business', 'Startup', 'Enterprise'] as const;
export type ClientType = (typeof clientTypeOptions)[number];

export const clientStatusOptions = ['Active', 'On Hold', 'Inactive', 'Blacklisted'] as const;
export type ClientStatus = (typeof clientStatusOptions)[number];

export const paymentTermOptions = ['Due on Receipt', 'Net 7', 'Net 15', 'Net 30'] as const;
export type PaymentTerms = (typeof paymentTermOptions)[number];

export const paymentModeOptions = ['UPI', 'Bank Transfer', 'Cheque', 'Online Gateway'] as const;
export type PaymentMode = (typeof paymentModeOptions)[number];

export const taxPreferenceOptions = ['Inclusive', 'Exclusive'] as const;
export type TaxPreference = (typeof taxPreferenceOptions)[number];

export const clientSourceOptions = ['Instagram', 'Referral', 'Website', 'Cold Outreach', 'Other'] as const;
export type ClientSource = (typeof clientSourceOptions)[number];

export const reminderFrequencyOptions = [3, 7] as const;
type ReminderFrequency = (typeof reminderFrequencyOptions)[number];

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  stateCode: string;
}

export interface Client {
  id: string;
  clientId: string;
  clientType: ClientType;
  legalName: string;
  brandName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: ClientStatus;
  billingAddress: BillingAddress;
  gstRegistered: boolean;
  gstin?: string;
  pan?: string;
  currency: string;
  paymentTerms: PaymentTerms;
  preferredPaymentMode: PaymentMode;
  creditLimit?: number;
  taxPreference: TaxPreference;
  accountOwner?: string;
  clientSource: ClientSource;
  industryType?: string;
  tags?: string[];
  notes?: string;
  autoSendInvoice: boolean;
  autoReminderEnabled: boolean;
  reminderFrequencyDays?: number;
  lateFeeApplicable: boolean;
  isArchived: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ClientPayload
  extends Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'clientId'> {
  clientId?: string;
}
