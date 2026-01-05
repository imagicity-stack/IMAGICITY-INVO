'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZodError } from 'zod';
import {
  Client,
  clientSourceOptions,
  clientStatusOptions,
  clientTypeOptions,
  paymentModeOptions,
  paymentTermOptions,
  reminderFrequencyOptions,
  taxPreferenceOptions,
} from '../../lib/clients/clientTypes';
import { ClientFormData, clientFormSchema } from '../../lib/clients/clientSchema';
import { archiveClient, createClient, restoreClient, updateClient } from '../../lib/clients/clientService';
import { deriveStateCode } from '../../lib/clients/stateCodes';

type ClientFormMode = 'create' | 'edit';

interface ClientFormState {
  clientType: ClientFormData['clientType'];
  legalName: string;
  brandName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: ClientFormData['status'];
  billingAddress: ClientFormData['billingAddress'];
  gstRegistered: boolean;
  gstin?: string;
  pan?: string;
  currency: string;
  paymentTerms: ClientFormData['paymentTerms'];
  preferredPaymentMode: ClientFormData['preferredPaymentMode'];
  creditLimit?: string | number;
  taxPreference: ClientFormData['taxPreference'];
  accountOwner?: string;
  clientSource: ClientFormData['clientSource'];
  industryType?: string;
  tags?: string;
  notes?: string;
  autoSendInvoice: boolean;
  autoReminderEnabled: boolean;
  reminderFrequencyDays?: string | number;
  lateFeeApplicable: boolean;
  isArchived: boolean;
  clientId?: string;
}

interface Props {
  initialClient?: Client;
  mode: ClientFormMode;
}

const defaultState: ClientFormState = {
  clientType: 'Individual',
  legalName: '',
  brandName: '',
  contactPerson: '',
  email: '',
  phone: '',
  status: 'Active',
  billingAddress: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    stateCode: '',
  },
  gstRegistered: false,
  gstin: '',
  pan: '',
  currency: 'INR',
  paymentTerms: 'Due on Receipt',
  preferredPaymentMode: 'UPI',
  creditLimit: '',
  taxPreference: 'Inclusive',
  accountOwner: '',
  clientSource: 'Other',
  industryType: '',
  tags: '',
  notes: '',
  autoSendInvoice: false,
  autoReminderEnabled: false,
  reminderFrequencyDays: '',
  lateFeeApplicable: false,
  isArchived: false,
  clientId: '',
};

const fieldClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500';

const labelClass = 'text-sm font-medium text-gray-700';

const sectionCardClass = 'card space-y-4';

const groupClass = 'grid gap-4 md:grid-cols-2';

function getInitialState(client?: Client): ClientFormState {
  if (!client) return defaultState;
  return {
    clientType: client.clientType,
    legalName: client.legalName,
    brandName: client.brandName || '',
    contactPerson: client.contactPerson,
    email: client.email,
    phone: client.phone,
    status: client.status,
    billingAddress: {
      ...client.billingAddress,
      line2: client.billingAddress.line2 || '',
    },
    gstRegistered: client.gstRegistered,
    gstin: client.gstin || '',
    pan: client.pan || '',
    currency: client.currency,
    paymentTerms: client.paymentTerms,
    preferredPaymentMode: client.preferredPaymentMode,
    creditLimit: client.creditLimit ?? '',
    taxPreference: client.taxPreference,
    accountOwner: client.accountOwner || '',
    clientSource: client.clientSource,
    industryType: client.industryType || '',
    tags: client.tags?.join(', ') || '',
    notes: client.notes || '',
    autoSendInvoice: client.autoSendInvoice,
    autoReminderEnabled: client.autoReminderEnabled,
    reminderFrequencyDays: client.reminderFrequencyDays ?? '',
    lateFeeApplicable: client.lateFeeApplicable,
    isArchived: client.isArchived,
    clientId: client.clientId,
  };
}

export default function ClientForm({ initialClient, mode }: Props) {
  const router = useRouter();
  const [formState, setFormState] = useState<ClientFormState>(getInitialState(initialClient));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setFormState(getInitialState(initialClient));
  }, [initialClient]);

  const parsedTags = useMemo(
    () =>
      formState.tags
        ?.split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [formState.tags],
  );

  const buildPayload = (): ClientFormData => {
    const payload: ClientFormData = {
      ...formState,
      creditLimit: formState.creditLimit === '' ? undefined : Number(formState.creditLimit),
      reminderFrequencyDays:
        formState.reminderFrequencyDays === '' || formState.reminderFrequencyDays === undefined
          ? undefined
          : Number(formState.reminderFrequencyDays),
      tags: parsedTags,
      gstin: formState.gstin?.trim() || undefined,
      pan: formState.pan?.trim() || undefined,
      brandName: formState.brandName?.trim() || undefined,
      notes: formState.notes?.trim() || undefined,
      accountOwner: formState.accountOwner?.trim() || undefined,
      industryType: formState.industryType?.trim() || undefined,
      clientId: formState.clientId?.trim() || undefined,
    };

    return clientFormSchema.parse(payload);
  };

  const handleErrorMapping = (error: ZodError) => {
    const fieldErrors: Record<string, string> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join('.') || 'form';
      fieldErrors[path] = issue.message;
    });
    setErrors(fieldErrors);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFeedback(null);
    try {
      const payload = buildPayload();
      setSubmitting(true);
      if (mode === 'edit' && initialClient) {
        await updateClient(initialClient.id, payload);
        setFeedback('Client updated successfully.');
      } else {
        await createClient(payload);
        setFeedback('Client created successfully.');
      }
      router.push('/clients');
    } catch (err) {
      if (err instanceof ZodError) {
        handleErrorMapping(err);
      } else {
        console.error(err);
        setFeedback('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof ClientFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field: keyof ClientFormState['billingAddress'], value: any) => {
    setFormState((prev) => ({ ...prev, billingAddress: { ...prev.billingAddress, [field]: value } }));
  };

  const autoFillStateCode = (stateName: string) => {
    const derived = deriveStateCode(stateName);
    if (derived) {
      handleBillingChange('stateCode', derived);
    }
  };

  const toggleArchive = async () => {
    if (!initialClient) return;
    setSubmitting(true);
    try {
      if (initialClient.isArchived) {
        await restoreClient(initialClient.id);
        setFeedback('Client restored.');
      } else {
        await archiveClient(initialClient.id);
        setFeedback('Client archived.');
      }
      router.push('/clients');
    } catch (err) {
      console.error(err);
      setFeedback('Unable to update archive status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{mode === 'edit' ? 'Edit Client' : 'Add Client'}</h1>
          <p className="text-sm text-gray-600">All fields marked with * are mandatory.</p>
        </div>
        {mode === 'edit' && initialClient && (
          <button
            type="button"
            onClick={toggleArchive}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {initialClient.isArchived ? 'Restore Client' : 'Archive Client'}
          </button>
        )}
      </div>

      {feedback && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {feedback}
        </div>
      )}

      <div className="grid gap-6">
        <div className={sectionCardClass}>
          <div className="flex items-center justify-between">
            <h2 className="section-title">Identity</h2>
            <span className="text-xs text-gray-500">Client ID auto-generated</span>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Legal Name *</label>
              <input
                className={fieldClass}
                value={formState.legalName}
                onChange={(e) => handleChange('legalName', e.target.value)}
                required
              />
              {errors['legalName'] && <p className="text-xs text-red-600">{errors['legalName']}</p>}
            </div>
            <div>
              <label className={labelClass}>Brand Name</label>
              <input
                className={fieldClass}
                value={formState.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
              />
              {errors['brandName'] && <p className="text-xs text-red-600">{errors['brandName']}</p>}
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Contact Person *</label>
              <input
                className={fieldClass}
                value={formState.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                required
              />
              {errors['contactPerson'] && <p className="text-xs text-red-600">{errors['contactPerson']}</p>}
            </div>
            <div>
              <label className={labelClass}>Client Type *</label>
              <select
                className={fieldClass}
                value={formState.clientType}
                onChange={(e) => handleChange('clientType', e.target.value as ClientFormState['clientType'])}
              >
                {clientTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors['clientType'] && <p className="text-xs text-red-600">{errors['clientType']}</p>}
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Email *</label>
              <input
                className={fieldClass}
                type="email"
                value={formState.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              {errors['email'] && <p className="text-xs text-red-600">{errors['email']}</p>}
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input
                className={fieldClass}
                value={formState.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
              {errors['phone'] && <p className="text-xs text-red-600">{errors['phone']}</p>}
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Status *</label>
              <select
                className={fieldClass}
                value={formState.status}
                onChange={(e) => handleChange('status', e.target.value as ClientFormState['status'])}
              >
                {clientStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors['status'] && <p className="text-xs text-red-600">{errors['status']}</p>}
            </div>
            <div>
              <label className={labelClass}>Client Source *</label>
              <select
                className={fieldClass}
                value={formState.clientSource}
                onChange={(e) => handleChange('clientSource', e.target.value as ClientFormState['clientSource'])}
              >
                {clientSourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors['clientSource'] && <p className="text-xs text-red-600">{errors['clientSource']}</p>}
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <h2 className="section-title">Billing Address</h2>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Line 1 *</label>
              <input
                className={fieldClass}
                value={formState.billingAddress.line1}
                onChange={(e) => handleBillingChange('line1', e.target.value)}
              />
              {errors['billingAddress.line1'] && (
                <p className="text-xs text-red-600">{errors['billingAddress.line1']}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Line 2</label>
              <input
                className={fieldClass}
                value={formState.billingAddress.line2}
                onChange={(e) => handleBillingChange('line2', e.target.value)}
              />
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>City *</label>
              <input
                className={fieldClass}
                value={formState.billingAddress.city}
                onChange={(e) => handleBillingChange('city', e.target.value)}
              />
              {errors['billingAddress.city'] && (
                <p className="text-xs text-red-600">{errors['billingAddress.city']}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input
                className={fieldClass}
                value={formState.billingAddress.state}
                onChange={(e) => {
                  const value = e.target.value;
                  handleBillingChange('state', value);
                  autoFillStateCode(value);
                }}
              />
              {errors['billingAddress.state'] && (
                <p className="text-xs text-red-600">{errors['billingAddress.state']}</p>
              )}
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Country *</label>
              <input
                className={fieldClass}
                value={formState.billingAddress.country}
                onChange={(e) => handleBillingChange('country', e.target.value)}
              />
              {errors['billingAddress.country'] && (
                <p className="text-xs text-red-600">{errors['billingAddress.country']}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Pincode *</label>
              <input
                className={fieldClass}
                value={formState.billingAddress.pincode}
                onChange={(e) => handleBillingChange('pincode', e.target.value)}
              />
              {errors['billingAddress.pincode'] && (
                <p className="text-xs text-red-600">{errors['billingAddress.pincode']}</p>
              )}
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>State Code *</label>
              <input
                className={fieldClass}
                value={formState.billingAddress.stateCode}
                onChange={(e) => handleBillingChange('stateCode', e.target.value.toUpperCase())}
              />
              {errors['billingAddress.stateCode'] && (
                <p className="text-xs text-red-600">{errors['billingAddress.stateCode']}</p>
              )}
            </div>
            <div className="flex items-center gap-2 pt-6 text-sm text-gray-600">
              <span className="rounded-lg bg-gray-100 px-3 py-1">GST ready</span>
              <span className="rounded-lg bg-gray-100 px-3 py-1">Invoices enabled</span>
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <h2 className="section-title">Tax & Compliance</h2>
          <div className={groupClass}>
            <div className="flex items-center gap-3">
              <input
                id="gst-registered"
                type="checkbox"
                checked={formState.gstRegistered}
                onChange={(e) => handleChange('gstRegistered', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="gst-registered" className={labelClass}>
                GST Registered
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="late-fee"
                type="checkbox"
                checked={formState.lateFeeApplicable}
                onChange={(e) => handleChange('lateFeeApplicable', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="late-fee" className={labelClass}>
                Late Fee Applicable
              </label>
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>GSTIN {formState.gstRegistered ? '*' : ''}</label>
              <input
                className={fieldClass}
                value={formState.gstin}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                disabled={!formState.gstRegistered}
              />
              {errors['gstin'] && <p className="text-xs text-red-600">{errors['gstin']}</p>}
            </div>
            <div>
              <label className={labelClass}>PAN</label>
              <input
                className={fieldClass}
                value={formState.pan}
                onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
              />
              {errors['pan'] && <p className="text-xs text-red-600">{errors['pan']}</p>}
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <h2 className="section-title">Billing Preferences</h2>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Currency</label>
              <input
                className={fieldClass}
                value={formState.currency}
                onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className={labelClass}>Payment Terms</label>
              <select
                className={fieldClass}
                value={formState.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value as ClientFormState['paymentTerms'])}
              >
                {paymentTermOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Preferred Payment Mode</label>
              <select
                className={fieldClass}
                value={formState.preferredPaymentMode}
                onChange={(e) =>
                  handleChange('preferredPaymentMode', e.target.value as ClientFormState['preferredPaymentMode'])
                }
              >
                {paymentModeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tax Preference</label>
              <select
                className={fieldClass}
                value={formState.taxPreference}
                onChange={(e) => handleChange('taxPreference', e.target.value as ClientFormState['taxPreference'])}
              >
                {taxPreferenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Credit Limit</label>
              <input
                className={fieldClass}
                type="number"
                min={0}
                value={formState.creditLimit}
                onChange={(e) => handleChange('creditLimit', e.target.value)}
              />
              {errors['creditLimit'] && <p className="text-xs text-red-600">{errors['creditLimit']}</p>}
            </div>
            <div>
              <label className={labelClass}>Reminder Frequency (days)</label>
              <select
                className={fieldClass}
                value={formState.reminderFrequencyDays}
                onChange={(e) => handleChange('reminderFrequencyDays', e.target.value)}
                disabled={!formState.autoReminderEnabled}
              >
                <option value="">Select</option>
                {reminderFrequencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors['reminderFrequencyDays'] && (
                <p className="text-xs text-red-600">{errors['reminderFrequencyDays']}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formState.autoSendInvoice}
                onChange={(e) => handleChange('autoSendInvoice', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Auto send invoice
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formState.autoReminderEnabled}
                onChange={(e) => handleChange('autoReminderEnabled', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Auto reminders
            </label>
          </div>
        </div>

        <div className={sectionCardClass}>
          <h2 className="section-title">Internal Notes</h2>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Account Owner</label>
              <input
                className={fieldClass}
                value={formState.accountOwner}
                onChange={(e) => handleChange('accountOwner', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Industry Type</label>
              <input
                className={fieldClass}
                value={formState.industryType}
                onChange={(e) => handleChange('industryType', e.target.value)}
              />
            </div>
          </div>
          <div className={groupClass}>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input
                className={fieldClass}
                value={formState.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                className={`${fieldClass} min-h-[96px]`}
                value={formState.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/clients')}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Saving…' : mode === 'edit' ? 'Update Client' : 'Create Client'}
        </button>
      </div>
    </form>
  );
}
