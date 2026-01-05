'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import ClientDetail from './clients/ClientDetail';
import ClientTable from './clients/ClientTable';
import { archiveClient, fetchClients, restoreClient } from '../lib/clients/clientService';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '/dashboard.svg' },
  { key: 'invoice', label: 'Invoice', icon: '/invoice.svg' },
  { key: 'quotation', label: 'Quotation', icon: '/quotation.svg' },
  { key: 'clients', label: 'Clients', icon: '/clients.svg' },
  { key: 'services', label: 'Services', icon: '/services.svg' },
];

const seededServices = [
  { title: 'Brand Identity Sprint', price: 2800, cycle: 'one-time', description: 'Logo suite, typography, color and launch kit.' },
  { title: 'Paid Media Retainer', price: 3600, cycle: 'monthly', description: 'Performance ads, landing CRO, weekly reporting.' },
  { title: 'Content + Social', price: 2400, cycle: 'monthly', description: 'Short-form video, copy, scheduling, and community.' },
];

function SectionHeader({ icon, title, actions }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="section-title">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brandRed/10">
          <Image src={icon} alt="" width={20} height={20} />
        </span>
        <span>{title}</span>
      </div>
      {actions}
    </div>
  );
}

function StatCard({ title, value, delta, pill }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500">{title}</p>
        {pill && <span className="badge bg-brandRed/10 text-brandRed">{pill}</span>}
      </div>
      <p className="mt-4 text-3xl font-bold text-brandCharcoal">{value}</p>
      {delta && <p className="mt-2 text-sm text-green-600">{delta}</p>}
    </div>
  );
}

function Pill({ children, tone = 'muted' }) {
  const map = {
    muted: 'bg-gray-100 text-gray-700',
    red: 'bg-brandRed/10 text-brandRed',
    yellow: 'bg-brandYellow/20 text-brandCharcoal',
    green: 'bg-emerald-100 text-emerald-700',
  };
  return <span className={`badge ${map[tone]}`}>{children}</span>;
}

export default function ImvoApp() {
  const [active, setActive] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [search, setSearch] = useState('');

  const [services, setServices] = useState(seededServices);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const [invoiceForm, setInvoiceForm] = useState({
    client: '',
    service: seededServices[0].title,
    amount: 3600,
    due: '2024-08-15',
    status: 'Pending',
  });

  const [quoteForm, setQuoteForm] = useState({
    client: '',
    service: seededServices[1].title,
    amount: 2400,
    status: 'Draft',
  });

  const [serviceForm, setServiceForm] = useState({ title: '', price: '', cycle: 'monthly', description: '' });

  const router = useRouter();

  const handleArchiveClient = async (client) => {
    await archiveClient(client.id);
    await loadClients();
    setSelectedClient((prev) => (prev?.id === client.id ? { ...prev, isArchived: true } : prev));
  };

  const handleRestoreClient = async (client) => {
    await restoreClient(client.id);
    await loadClients();
    setSelectedClient((prev) => (prev?.id === client.id ? { ...prev, isArchived: false } : prev));
  };

  const handleEditClient = (client) => {
    router.push(`/clients/${client.id}/edit`);
  };

  const handleCreateClient = () => {
    router.push('/clients/new');
  };

  const loadClients = async () => {
    setClientsLoading(true);
    setClientsError('');
    try {
      const data = await fetchClients({ status: statusFilter || undefined, includeArchived, search });
      setClients(data);
      if (data.length && !selectedClient) {
        setSelectedClient(data[0]);
      }
      if (!data.length) {
        setSelectedClient(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load clients';
      setClientsError(message);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, includeArchived]);

  useEffect(() => {
    if (clients.length && !selectedClient) {
      setSelectedClient(clients[0]);
    }

    if (clients.length && !invoiceForm.client) {
      setInvoiceForm((prev) => ({ ...prev, client: clients[0].legalName }));
    }

    if (clients.length && !quoteForm.client) {
      setQuoteForm((prev) => ({ ...prev, client: clients[0].legalName }));
    }

    if (clients.length && invoices.length === 0) {
      const today = new Date();
      const seededFromClients = clients.slice(0, 3).map((client, idx) => {
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + (idx + 1) * 5);
        return {
          id: `INV-${1042 + idx}`,
          client: client.legalName,
          amount: 3200 + idx * 450,
          due: dueDate.toISOString().slice(0, 10),
          status: idx % 2 === 0 ? 'Pending' : 'Paid',
        };
      });
      setInvoices(seededFromClients);
    }

    if (clients.length && quotations.length === 0) {
      const seededQuotes = clients.slice(0, 2).map((client, idx) => ({
        id: `QTE-${2058 + idx}`,
        client: client.legalName,
        service: seededServices[idx]?.title || seededServices[0].title,
        amount: 2400 + idx * 200,
        status: idx % 2 === 0 ? 'Sent' : 'Draft',
      }));
      setQuotations(seededQuotes);
    }
  }, [clients, invoiceForm.client, quoteForm.client, invoices.length, quotations.length, selectedClient]);

  const totals = useMemo(() => {
    const paid = invoices.filter((item) => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);
    const outstanding = invoices.filter((item) => item.status !== 'Paid').reduce((sum, item) => sum + item.amount, 0);
    return { paid, outstanding };
  }, [invoices]);

  const handleInvoiceSubmit = (e) => {
    e.preventDefault();
    if (!invoiceForm.client) return;
    const nextId = `INV-${1045 + invoices.length}`;
    setInvoices([{ ...invoiceForm, id: nextId }, ...invoices]);
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!quoteForm.client) return;
    const nextId = `QTE-${2060 + quotations.length}`;
    setQuotations([{ ...quoteForm, id: nextId }, ...quotations]);
  };

  const handleServiceSubmit = (e) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.price) return;
    setServices([{ ...serviceForm, price: Number(serviceForm.price) }, ...services]);
    setServiceForm({ title: '', price: '', cycle: 'monthly', description: '' });
  };

  const SectionWrapper = ({ children }) => <div className="space-y-6">{children}</div>;

  return (
    <main className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 px-4 py-8 md:flex-row md:px-8">
      <aside className="md:w-1/4 lg:w-1/5">
        <div className="card sticky top-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandRed text-white text-xl font-bold shadow-lg shadow-brandRed/30">IM</span>
            <div>
              <p className="text-xl font-bold text-brandCharcoal">IMVO</p>
              <p className="text-sm text-gray-500">Imagicity invoicing suite</p>
            </div>
          </div>
          <div className="grid gap-2">
            {navItems.map((item) => {
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brandRed/10 border ${
                    isActive ? 'bg-brandRed text-white border-brandRed shadow-brandRed/30' : 'bg-white border-gray-200 text-brandCharcoal'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? 'bg-white/15' : 'bg-brandRed/10'}`}>
                    <Image src={item.icon} alt="" width={18} height={18} />
                  </span>
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="rounded-2xl border border-dashed border-brandRed/30 bg-brandRed/5 p-4 text-sm text-brandCharcoal">
            <p className="font-semibold text-brandRed">Firebase ready</p>
            <p className="mt-1 text-gray-700">Wire your Firestore collections to persist invoices, quotations, and services.</p>
          </div>
        </div>
      </aside>

      <section className="md:w-3/4 lg:w-4/5">
        {active === 'dashboard' && (
          <SectionWrapper>
            <SectionHeader icon="/dashboard.svg" title="Dashboard" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatCard title="Monthly revenue" value={`$${(totals.paid + totals.outstanding).toLocaleString()}`} delta="Up 12.4% vs last month" pill="Live" />
              <StatCard title="Outstanding" value={`$${totals.outstanding.toLocaleString()}`} delta="2 invoices waiting" />
              <StatCard title="Paid invoices" value={`$${totals.paid.toLocaleString()}`} delta="On-time: 92%" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card">
                <div className="section-title mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandYellow/30 text-brandCharcoal">💹</span>
                  <span>Pipeline snapshot</span>
                </div>
                <div className="space-y-4">
                  {quotations.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-brandMuted px-4 py-3">
                      <div>
                        <p className="font-semibold">{quote.client}</p>
                        <p className="text-sm text-gray-500">{quote.service}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Pill tone="yellow">{quote.status}</Pill>
                        <p className="font-semibold text-brandCharcoal">${quote.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="section-title mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandRed/10 text-brandRed">⏳</span>
                  <span>Upcoming due dates</span>
                </div>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                      <div>
                        <p className="font-semibold">{invoice.client}</p>
                        <p className="text-sm text-gray-500">Due {invoice.due}</p>
                      </div>
                      <div className="text-right">
                        <Pill tone={invoice.status === 'Paid' ? 'green' : 'red'}>{invoice.status}</Pill>
                        <p className="mt-1 font-semibold text-brandCharcoal">${invoice.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionWrapper>
        )}

        {active === 'invoice' && (
          <SectionWrapper>
            <SectionHeader icon="/invoice.svg" title="Invoices" />
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
              <form onSubmit={handleInvoiceSubmit} className="card space-y-4">
                <div className="flex items-start justify-between">
                  <p className="text-lg font-semibold">Generate invoice</p>
                  <Pill tone="red">Live preview</Pill>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Client
                    <select
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      disabled={!clients.length}
                      value={invoiceForm.client}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, client: e.target.value })}
                    >
                      {!clients.length && <option>No clients yet</option>}
                      {clients.map((client) => (
                        <option key={client.id || client.legalName}>{client.legalName}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-gray-600">
                    Service
                    <select
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      value={invoiceForm.service}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, service: e.target.value })}
                    >
                      {services.map((service) => (
                        <option key={service.title}>{service.title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-gray-600">
                    Amount (USD)
                    <input
                      type="number"
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-600">
                    Due date
                    <input
                      type="date"
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      value={invoiceForm.due}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, due: e.target.value })}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      id="status"
                      checked={invoiceForm.status === 'Paid'}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.checked ? 'Paid' : 'Pending' })}
                      className="h-4 w-4 rounded border-gray-300 text-brandRed focus:ring-brandRed"
                    />
                    <label htmlFor="status">Mark as paid</label>
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-brandRed px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brandRed/30 transition hover:-translate-y-0.5"
                  >
                    Save invoice
                  </button>
                </div>
              </form>

              <div className="card space-y-4 bg-gradient-to-br from-brandMuted to-white">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">Recent invoices</p>
                  <Pill tone="yellow">Auto-sync soon</Pill>
                </div>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3">
                      <div>
                        <p className="font-semibold">{invoice.id}</p>
                        <p className="text-sm text-gray-500">{invoice.client}</p>
                      </div>
                      <div className="text-right">
                        <Pill tone={invoice.status === 'Paid' ? 'green' : 'red'}>{invoice.status}</Pill>
                        <p className="mt-1 font-semibold text-brandCharcoal">${invoice.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionWrapper>
        )}

        {active === 'quotation' && (
          <SectionWrapper>
            <SectionHeader icon="/quotation.svg" title="Quotations" />
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
              <form onSubmit={handleQuoteSubmit} className="card space-y-4">
                <div className="flex items-start justify-between">
                  <p className="text-lg font-semibold">Send quotation</p>
                  <Pill tone="yellow">Shareable</Pill>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Client
                    <select
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      disabled={!clients.length}
                      value={quoteForm.client}
                      onChange={(e) => setQuoteForm({ ...quoteForm, client: e.target.value })}
                    >
                      {!clients.length && <option>No clients yet</option>}
                      {clients.map((client) => (
                        <option key={client.id || client.legalName}>{client.legalName}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-gray-600">
                    Service
                    <select
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      value={quoteForm.service}
                      onChange={(e) => setQuoteForm({ ...quoteForm, service: e.target.value })}
                    >
                      {services.map((service) => (
                        <option key={service.title}>{service.title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-gray-600">
                    Amount (USD)
                    <input
                      type="number"
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      value={quoteForm.amount}
                      onChange={(e) => setQuoteForm({ ...quoteForm, amount: Number(e.target.value) })}
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-600">
                    Status
                    <select
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      value={quoteForm.status}
                      onChange={(e) => setQuoteForm({ ...quoteForm, status: e.target.value })}
                    >
                      <option>Draft</option>
                      <option>Sent</option>
                      <option>Accepted</option>
                    </select>
                  </label>
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-brandYellow px-5 py-2 text-sm font-semibold text-brandCharcoal shadow-lg shadow-brandYellow/30 transition hover:-translate-y-0.5"
                >
                  Save quotation
                </button>
              </form>

              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">Quotes pipeline</p>
                  <Pill tone="muted">Preview</Pill>
                </div>
                <div className="space-y-3">
                  {quotations.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-brandMuted px-4 py-3">
                      <div>
                        <p className="font-semibold">{quote.id}</p>
                        <p className="text-sm text-gray-500">{quote.client}</p>
                      </div>
                      <div className="text-right">
                        <Pill tone="yellow">{quote.status}</Pill>
                        <p className="mt-1 font-semibold text-brandCharcoal">${quote.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionWrapper>
        )}

        {active === 'clients' && (
          <SectionWrapper>
            <SectionHeader
              icon="/clients.svg"
              title="Clients"
            />
            <div className="card space-y-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="text-lg font-semibold text-brandCharcoal">Live roster</p>
                  <p className="text-sm text-gray-600">Search, filter, and act on clients without leaving the home surface.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={loadClients}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    className="rounded-xl bg-brandRed px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brandRed/20 transition hover:-translate-y-0.5 hover:bg-red-700"
                  >
                    Add Client
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loadClients();
                  }}
                  className="relative"
                >
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by legal name, brand, email, or phone"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm focus:border-brandRed focus:ring-2 focus:ring-brandRed/20"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-brandRed px-3 py-1 text-xs font-semibold text-white"
                  >
                    Go
                  </button>
                </form>

                <label className="text-sm font-semibold text-gray-600">
                  Status
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                  >
                    <option value="">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </label>

                <label className="flex items-center justify-between gap-3 self-end rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700">
                  Show archived
                  <input
                    type="checkbox"
                    checked={includeArchived}
                    onChange={(e) => setIncludeArchived(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-brandRed focus:ring-brandRed"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
              <div className="space-y-4">
                {clientsError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {clientsError}
                  </div>
                )}
                <ClientTable
                  clients={clients}
                  loading={clientsLoading}
                  onSelect={setSelectedClient}
                  onEdit={handleEditClient}
                  onArchive={handleArchiveClient}
                  onRestore={handleRestoreClient}
                />
              </div>

              <div className="space-y-4">
                {selectedClient ? (
                  <ClientDetail
                    client={selectedClient}
                    onEdit={() => handleEditClient(selectedClient)}
                    onArchive={() => handleArchiveClient(selectedClient)}
                    onRestore={() => handleRestoreClient(selectedClient)}
                  />
                ) : (
                  <div className="card text-sm text-gray-600">Select a client to see details and quick actions.</div>
                )}
              </div>
            </div>
          </SectionWrapper>
        )}

        {active === 'services' && (
          <SectionWrapper>
            <SectionHeader icon="/services.svg" title="Services" />
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">Service catalog</p>
                  <Pill tone="yellow">Visible to sales</Pill>
                </div>
                <div className="space-y-3">
                  {services.map((service, idx) => (
                    <div key={`${service.title}-${idx}`} className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-brandMuted p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-brandCharcoal">{service.title}</p>
                        <Pill tone="red">{service.cycle}</Pill>
                      </div>
                      <p className="text-sm text-gray-500">{service.description || 'No description added yet.'}</p>
                      <p className="text-lg font-bold text-brandCharcoal">${service.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleServiceSubmit} className="card space-y-4">
                <div className="flex items-start justify-between">
                  <p className="text-lg font-semibold">Create service</p>
                  <Pill tone="red">New</Pill>
                </div>
                <label className="text-sm font-semibold text-gray-600">
                  Title
                  <input
                    type="text"
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Price (USD)
                    <input
                      type="number"
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-600">
                    Cycle
                    <select
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                      value={serviceForm.cycle}
                      onChange={(e) => setServiceForm({ ...serviceForm, cycle: e.target.value })}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="one-time">One time</option>
                    </select>
                  </label>
                </div>
                <label className="text-sm font-semibold text-gray-600">
                  Description
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2"
                    rows={3}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-brandRed px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brandRed/30 transition hover:-translate-y-0.5"
                >
                  Save service
                </button>
              </form>
            </div>
          </SectionWrapper>
        )}
      </section>
    </main>
  );
}
