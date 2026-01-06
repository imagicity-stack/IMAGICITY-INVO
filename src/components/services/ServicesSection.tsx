'use client';

import { useEffect, useMemo, useState } from 'react';
import ServiceDetailDrawer from './ServiceDetailDrawer';
import ServiceFormModal from './ServiceFormModal';
import {
  archiveService,
  createService,
  listServices,
  restoreService,
  updateService,
} from '../../lib/services/serviceService';
import { PricingModel, Service, ServiceCategory, ServiceFilters, ServiceStatus } from '../../lib/services/serviceTypes';
import { ServiceInput } from '../../lib/services/serviceSchema';
import { createCategory, listCategories } from '../../lib/services/categoryService';

interface ToastState {
  message: string;
  tone: 'success' | 'error';
}

function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  const color = toast.tone === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
  return (
    <div className={`fixed right-4 top-4 z-50 rounded-xl ${color} px-4 py-3 text-sm font-semibold text-white shadow-lg`}>
      {toast.message}
    </div>
  );
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ServiceFilters>({});
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formInitial, setFormInitial] = useState<Service | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);

  const activeServices = useMemo(() => services, [services]);
  const groupedServices = useMemo(() => {
    const map = new Map<string, Service[]>();
    activeServices.forEach((service) => {
      const category = service.category?.trim() || 'Uncategorized';
      const bucket = map.get(category) || [];
      bucket.push(service);
      map.set(category, bucket);
    });

    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [activeServices]);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listServices({ includeArchived, filters, search });
      setServices(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    listCategories()
      .then((data) => setCategories(data.map((entry) => entry.name)))
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeArchived, filters.category, filters.pricingModel, filters.status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const openCreateForm = () => {
    setFormMode('create');
    setFormInitial(undefined);
    setFormOpen(true);
  };

  const openEditForm = (service: Service) => {
    setFormMode('edit');
    setFormInitial(service);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: ServiceInput) => {
    setSubmitting(true);
    try {
      if (formMode === 'create') {
        await createService(payload);
        setToast({ message: 'Service added successfully', tone: 'success' });
      } else if (formInitial) {
        await updateService(formInitial.serviceId, payload);
        setToast({ message: 'Service updated successfully', tone: 'success' });
      }
      setFormOpen(false);
      await fetchServices();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to save service. Check required fields.', tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (service: Service) => {
    try {
      await archiveService(service.serviceId);
      setToast({ message: 'Service archived', tone: 'success' });
      await fetchServices();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to archive service', tone: 'error' });
    }
  };

  const handleRestore = async (service: Service) => {
    try {
      await restoreService(service.serviceId);
      setToast({ message: 'Service restored', tone: 'success' });
      await fetchServices();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to restore service', tone: 'error' });
    }
  };

  const handleSelect = (service: Service) => {
    setSelected(service);
    setDetailOpen(true);
  };

  const filteredCount = activeServices.length;

  const handleAddCategory = async (nameOverride?: string) => {
    const trimmed = (nameOverride ?? categoryInput).trim();
    if (!trimmed) return;
    setCategorySaving(true);
    try {
      await createCategory(trimmed);
      setCategoryInput('');
      const updated = await listCategories();
      setCategories(updated.map((entry) => entry.name));
      setToast({ message: 'Category added', tone: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Unable to add category', tone: 'error' });
    } finally {
      setCategorySaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <Toast toast={toast} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-brandCharcoal">Services</p>
          <p className="text-sm text-gray-500">Master catalog synced across invoices, quotations, and CRM.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-full bg-brandPrimary px-5 py-2 text-sm font-semibold text-white shadow"
        >
          Add Service
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-semibold text-gray-700">
              Search
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category, or tags"
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Category
              <select
                value={filters.category || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    category: e.target.value ? (e.target.value as ServiceCategory) : undefined,
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Pricing model
              <select
                value={filters.pricingModel || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    pricingModel: e.target.value ? (e.target.value as PricingModel) : undefined,
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
              >
                <option value="">All</option>
                <option value="Fixed">Fixed</option>
                <option value="Hourly">Hourly</option>
                <option value="Monthly">Monthly</option>
                <option value="Per Unit">Per Unit</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Status
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value ? (e.target.value as ServiceStatus) : undefined,
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2"
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-brandMuted px-4 py-3 text-sm font-semibold text-gray-700">
              Include archived
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-brandPrimary focus:ring-brandPrimary"
              />
            </label>
          </div>
          {error && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-brandCharcoal">Browse by category</p>
              <span className="badge bg-brandPrimary/10 text-brandPrimary">{filteredCount} visible</span>
            </div>
            {loading && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">Loading services...</div>
            )}
            {!loading && !groupedServices.length && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-brandMuted p-6 text-center text-sm text-gray-600">
                No services yet. Start by adding your first service to see it organized by category.
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {groupedServices.map((group) => (
                <div
                  key={group.category}
                  className="group rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-brandMuted p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-brandPrimary">{group.category}</p>
                      <p className="text-xs text-gray-500">{group.items.length} service{group.items.length > 1 ? 's' : ''}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          category: prev.category === group.category ? undefined : group.category,
                        }))
                      }
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brandCharcoal shadow"
                    >
                      {filters.category === group.category ? 'Clear filter' : 'Filter'}
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {group.items.map((service) => (
                      <div
                        key={service.serviceId}
                        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brandPrimary/50 hover:shadow-brandPrimary/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-brandCharcoal">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.description || 'No description yet.'}</p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              service.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {service.status}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <span className="rounded-full bg-brandSecondary/20 px-3 py-1 font-semibold text-brandCharcoal">
                            {service.pricingModel} · {service.currency || 'INR'} {service.rate.toLocaleString()} / {service.unitLabel}
                          </span>
                          {service.gstRate ? <span className="rounded-full bg-white px-3 py-1 font-semibold text-brandPrimary">GST {service.gstRate}%</span> : null}
                          {service.tags?.map((tag) => (
                            <span key={tag} className="rounded-full bg-white px-3 py-1 font-semibold text-brandCharcoal">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelect(service)}
                            className="rounded-full bg-brandPrimary px-4 py-2 text-xs font-semibold text-white shadow"
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(service)}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brandCharcoal shadow"
                          >
                            Edit
                          </button>
                          {service.isArchived ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(service)}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleArchive(service)}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card space-y-1">
            <p className="text-sm font-semibold text-gray-500">Category library</p>
            <div className="flex flex-wrap gap-2">
              {categories.length ? (
                categories.map((category) => (
                  <span key={category} className="badge bg-brandPrimary/10 text-brandPrimary">
                    {category}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No categories yet.</p>
              )}
            </div>
            <div className="mt-3 grid gap-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Add a new category"
                className="w-full rounded-2xl border border-gray-200 px-3 py-2"
              />
              <button
                type="button"
                disabled={categorySaving}
                onClick={() => handleAddCategory()}
                className="w-full rounded-full bg-brandPrimary px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-70"
              >
                {categorySaving ? 'Saving...' : 'Save category'}
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-300 bg-brandMuted p-4 text-sm text-gray-600">
            <p className="font-semibold text-brandCharcoal">Sync readiness</p>
            <p className="mt-1">
              Services are designed to sync with invoices, quotations, and deals. Use precise unit labels and pricing models to
              keep snapshots accurate.
            </p>
          </div>
        </div>
      </div>

      <ServiceFormModal
        open={formOpen}
        mode={formMode}
        initialData={formInitial}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        categories={categories}
        onAddCategory={async (name) => {
          await handleAddCategory(name);
        }}
      />

      <ServiceDetailDrawer
        open={detailOpen}
        service={selected}
        onClose={() => setDetailOpen(false)}
        onEdit={openEditForm}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />
    </section>
  );
}
