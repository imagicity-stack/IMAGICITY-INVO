'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { Service, ServiceCategory } from '../../lib/services/serviceTypes';
import { ServiceInput, serviceSchema } from '../../lib/services/serviceSchema';

type Mode = 'create' | 'edit';

interface Props {
  mode: Mode;
  initialData?: Service;
  onSubmit: (data: ServiceInput) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
  categories?: ServiceCategory[];
  onAddCategory?: (name: string) => Promise<void>;
}

const typeOptions = ['Service', 'Package', 'Add-on'] as const;
const pricingOptions = ['Fixed', 'Hourly', 'Monthly', 'Per Unit'] as const;
const statusOptions = ['Active', 'Inactive'] as const;

export default function ServiceForm({ mode, initialData, onSubmit, onCancel, submitting, categories = [], onAddCategory }: Props) {
  const [form, setForm] = useState<ServiceInput>(() => ({
    name: initialData?.name || '',
    type: initialData?.type || 'Service',
    category: initialData?.category || categories[0] || '',
    description: initialData?.description || '',
    deliverables: initialData?.deliverables || [],
    pricingModel: initialData?.pricingModel || 'Fixed',
    rate: initialData?.rate ?? 0,
    currency: initialData?.currency || 'INR',
    gstRate: initialData?.gstRate ?? 18,
    taxIncluded: initialData?.taxIncluded ?? false,
    unitLabel: initialData?.unitLabel || '',
    turnaroundDays: initialData?.turnaroundDays,
    requiresBrief: initialData?.requiresBrief ?? true,
    internalCost: initialData?.internalCost,
    notesInternal: initialData?.notesInternal || '',
    tags: initialData?.tags || [],
    status: initialData?.status || 'Active',
    isArchived: initialData?.isArchived ?? false,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCategory, setNewCategory] = useState('');

  const deliverablesValue = useMemo(() => {
    if (Array.isArray(form.deliverables)) {
      return form.deliverables.join('\n');
    }
    return '';
  }, [form.deliverables]);

  const tagsValue = useMemo(() => {
    if (Array.isArray(form.tags)) return form.tags.join(', ');
    return '';
  }, [form.tags]);

  const handleChange = (key: keyof ServiceInput, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const parsed = serviceSchema.parse({ ...form });
      await onSubmit(parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const path = issue.path.join('.') || 'form';
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  useEffect(() => {
    if (!form.category && categories.length) {
      setForm((prev) => ({ ...prev, category: categories[0] }));
    }
  }, [categories, form.category]);

  const categoryOptions = useMemo(() => {
    if (form.category && !categories.includes(form.category)) {
      return [...categories, form.category];
    }
    return categories;
  }, [categories, form.category]);

  const handleSaveCategory = async () => {
    if (!newCategory.trim()) return;
    const trimmed = newCategory.trim();
    handleChange('category', trimmed);
    setNewCategory('');
    await onAddCategory?.(trimmed);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-brandCharcoal">
            {mode === 'create' ? 'Add Service' : 'Edit Service'}
          </p>
          <p className="text-sm text-gray-500">Capture details for your catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brandPrimary px-5 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700">
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
          {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Type
          <select
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700 space-y-1">
          <div className="flex items-center justify-between">
            <span>Category</span>
          </div>
          <select
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-3 py-2"
          >
            <option value="">Select a category</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-rose-600">{errors.category}</p>}
          {!categories.length && <p className="text-xs text-gray-500">No categories yet—add one below.</p>}
          <div className="flex flex-col gap-2 rounded-2xl bg-brandMuted/60 p-3">
            <p className="text-xs font-semibold text-gray-600">Add a new category</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="E.g. Consulting"
                className="w-full rounded-2xl border border-gray-200 px-3 py-2"
              />
              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={!newCategory.trim() || submitting}
                className="rounded-full bg-brandPrimary px-4 py-2 text-xs font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save & select
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              New categories are saved for reuse and automatically selected for this service.
            </p>
          </div>
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Status
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700">
          Pricing model
          <select
            value={form.pricingModel}
            onChange={(e) => handleChange('pricingModel', e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          >
            {pricingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.pricingModel && <p className="text-xs text-rose-600">{errors.pricingModel}</p>}
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Unit label
          <input
            type="text"
            value={form.unitLabel}
            onChange={(e) => handleChange('unitLabel', e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
          {errors.unitLabel && <p className="text-xs text-rose-600">{errors.unitLabel}</p>}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-sm font-semibold text-gray-700 md:col-span-2">
          Rate
          <input
            type="number"
            value={form.rate}
            onChange={(e) => handleChange('rate', Number(e.target.value))}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
          {errors.rate && <p className="text-xs text-rose-600">{errors.rate}</p>}
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Currency
          <input
            type="text"
            value={form.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          GST Rate (%)
          <input
            type="number"
            value={form.gstRate}
            onChange={(e) => handleChange('gstRate', Number(e.target.value))}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
          {errors.gstRate && <p className="text-xs text-rose-600">{errors.gstRate}</p>}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={form.taxIncluded}
            onChange={(e) => handleChange('taxIncluded', e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-brandPrimary focus:ring-brandPrimary"
          />
          Tax included in rate
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={form.requiresBrief}
            onChange={(e) => handleChange('requiresBrief', e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-brandPrimary focus:ring-brandPrimary"
          />
          Requires brief
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Turnaround (days)
          <input
            type="number"
            value={form.turnaroundDays ?? ''}
            onChange={(e) => handleChange('turnaroundDays', e.target.value === '' ? undefined : Number(e.target.value))}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
          {errors.turnaroundDays && <p className="text-xs text-rose-600">{errors.turnaroundDays}</p>}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700">
          Description
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Deliverables (one per line)
          <textarea
            value={deliverablesValue}
            onChange={(e) => handleChange('deliverables', e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700">
          Tags (comma separated)
          <input
            type="text"
            value={tagsValue}
            onChange={(e) => handleChange('tags', e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Internal cost
          <input
            type="number"
            value={form.internalCost ?? ''}
            onChange={(e) => handleChange('internalCost', e.target.value === '' ? undefined : Number(e.target.value))}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
          {errors.internalCost && <p className="text-xs text-rose-600">{errors.internalCost}</p>}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700">
          Notes (internal)
          <textarea
            value={form.notesInternal}
            onChange={(e) => handleChange('notesInternal', e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">
            Archived
            <select
              value={form.isArchived ? 'Yes' : 'No'}
              onChange={(e) => handleChange('isArchived', e.target.value === 'Yes')}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </label>
          <div className="rounded-2xl border border-gray-200 bg-brandMuted px-4 py-3 text-sm text-gray-600">
            <p className="font-semibold text-brandCharcoal">Defaults</p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Currency defaults to INR</li>
              <li>GST defaults to 18%</li>
              <li>Services require brief by default</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
