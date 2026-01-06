'use client';

import { useEffect, useMemo, useState } from 'react';
import ServiceDetailDrawer from './ServiceDetailDrawer';
import ServiceFormModal from './ServiceFormModal';
import ServiceTable from './ServiceTable';
import {
  archiveService,
  createService,
  listServices,
  restoreService,
  updateService,
} from '../../lib/services/serviceService';
import { PricingModel, Service, ServiceCategory, ServiceFilters, ServiceStatus } from '../../lib/services/serviceTypes';
import { ServiceInput } from '../../lib/services/serviceSchema';

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

  const activeServices = useMemo(() => services, [services]);

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
                <option value="Branding">Branding</option>
                <option value="Web">Web</option>
                <option value="Marketing">Marketing</option>
                <option value="Ads">Ads</option>
                <option value="Content">Content</option>
                <option value="Design">Design</option>
                <option value="Other">Other</option>
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
          <div className="mt-4">
            <ServiceTable
              services={activeServices}
              loading={loading}
              onSelect={handleSelect}
              onEdit={openEditForm}
              onArchive={handleArchive}
              onRestore={handleRestore}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="card space-y-1">
            <p className="text-sm font-semibold text-gray-500">Catalog health</p>
            <p className="text-3xl font-bold text-brandCharcoal">{filteredCount}</p>
            <p className="text-sm text-gray-500">Services in view (filtered)</p>
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
