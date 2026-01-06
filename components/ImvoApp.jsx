'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';

import ClientDetail from './clients/ClientDetail';
import ClientForm from './clients/ClientForm';
import ClientTable from './clients/ClientTable';
import { archiveClient, deleteClient, fetchClients, restoreClient } from '../lib/clients/clientService';
import { app } from '../lib/firebase';

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

const forecastSeries = [62, 78, 70, 88, 95, 90, 102];
const advancedMetrics = [
  { label: 'Win rate', value: '68%', delta: '+6.2% vs last month' },
  { label: 'Average payment time', value: '12.4 days', delta: '-1.1 days vs target' },
  { label: 'Recurring retention', value: '92%', delta: '+3.4% stabilized' },
];
const channelBreakdown = [
  { label: 'Services', value: 52, tone: 'red' },
  { label: 'Invoices', value: 32, tone: 'yellow' },
  { label: 'Quotations', value: 16, tone: 'muted' },
];

const learningTracks = [
  {
    title: 'Design Branding',
    meta: '6 modules',
    progress: 80,
    tone: 'from-[#fef3c7] via-white to-[#fde68a]',
  },
  {
    title: 'Digital Marketing',
    meta: '8 modules',
    progress: 45,
    tone: 'from-[#e0f2fe] via-white to-[#bfdbfe]',
  },
  {
    title: 'Basic HTML & CSS',
    meta: '12 modules',
    progress: 95,
    tone: 'from-[#ede9fe] via-white to-[#ddd6fe]',
  },
];

const leaderboardEntries = [
  { name: 'John Andrew', handle: '@johnandrew', points: 320 },
  { name: 'Ariana Faye', handle: '@arianafaye', points: 292 },
  { name: 'Oliver Stone', handle: '@oliverstone', points: 265 },
];

const scheduleItems = [
  { time: '09:00 am', title: 'Begin writing Landing Page', subtitle: 'Design System Revamp' },
  { time: '11:00 am', title: 'Draw Wireframe', subtitle: 'Homepage v3' },
  { time: '02:00 pm', title: 'UX Presentation', subtitle: 'Sprint 12' },
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

function LearningCard({ track }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br ${track.tone} p-5 shadow-sm`}>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-500">{track.meta}</p>
          <p className="text-lg font-bold text-brandCharcoal">{track.title}</p>
        </div>
        <span className="badge bg-white/70 text-brandCharcoal">Live</span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/70">
        <div className="h-full rounded-full bg-brandRed" style={{ width: `${track.progress}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-gray-600">{track.progress}% completed</p>
    </div>
  );
}

function LeaderboardCard() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-brandCharcoal">Leaderboard</p>
        <span className="badge bg-brandRed/10 text-brandRed">Weekly</span>
      </div>
      <div className="space-y-3">
        {leaderboardEntries.map((entry, idx) => (
          <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-brandMuted px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-brandCharcoal shadow">
                {idx + 1}
              </span>
              <div>
                <p className="font-semibold text-brandCharcoal">{entry.name}</p>
                <p className="text-xs text-gray-500">{entry.handle}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-brandRed">{entry.points} pts</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileRail() {
  return (
    <div className="space-y-4">
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brandRed text-lg font-bold text-white">AI</div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Profile</p>
              <p className="text-lg font-bold text-brandCharcoal">Admin</p>
            </div>
          </div>
          <span className="badge bg-brandRed/10 text-brandRed">Pro</span>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-brandMuted px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Current level</p>
          <p className="text-xl font-bold text-brandCharcoal">Design Level 40</p>
          <p className="text-sm text-gray-600">Learning content strategy & visual excellence.</p>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-brandCharcoal">Schedule</p>
          <span className="badge bg-brandYellow/30 text-brandCharcoal">Today</span>
        </div>
        <div className="space-y-3">
          {scheduleItems.map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-brandMuted px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brandRed">{item.time}</p>
              <p className="font-semibold text-brandCharcoal">{item.title}</p>
              <p className="text-sm text-gray-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ImvoApp() {
  const router = useRouter();
  const [active, setActive] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetailOpen, setClientDetailOpen] = useState(false);
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
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(getAuth(app));
      router.push('/');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Sign out failed', error);
      setSigningOut(false);
    }
  };

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

  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [clientFormMode, setClientFormMode] = useState('create');
  const [clientFormInitial, setClientFormInitial] = useState(null);

  const loadClients = async (selectClientId) => {
    setClientsLoading(true);
    setClientsError('');
    try {
      const data = await fetchClients({ status: statusFilter || undefined, includeArchived, search });
      setClients(data);
      if (selectClientId) {
        const match = data.find((entry) => entry.id === selectClientId);
        if (match) {
          setSelectedClient(match);
        } else if (data.length) {
          setSelectedClient(data[0]);
        } else {
          setSelectedClient(null);
        }
      } else {
        if (data.length && !selectedClient) {
          setSelectedClient(data[0]);
        }
        if (!data.length) {
          setSelectedClient(null);
        }
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

  const openCreateClient = () => {
    setClientFormMode('create');
    setClientFormInitial(null);
    setClientFormOpen(true);
  };

  const openEditClient = (client) => {
    setClientFormMode('edit');
    setClientFormInitial(client);
    setClientDetailOpen(false);
    setClientFormOpen(true);
  };

  const handleClientSaved = (clientId) => {
    setClientFormOpen(false);
    loadClients(clientId);
    setClientDetailOpen(false);
  };

  const openClientDetail = (client) => {
    setSelectedClient(client);
    setClientDetailOpen(true);
  };

  const handleDeleteClient = async (client) => {
    await deleteClient(client.id);
    setClientDetailOpen(false);
    if (selectedClient?.id === client.id) {
      setSelectedClient(null);
    }
    await loadClients();
  };

  const gridCols = active === 'dashboard' ? 'lg:grid-cols-[230px_1fr_320px]' : 'lg:grid-cols-[230px_1fr]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f7fb] via-white to-[#eef2ff]">
      <div className="mx-auto max-w-[1500px] px-4 py-6">
        <div className={`grid gap-6 ${gridCols}`}>
          <aside className="lg:sticky lg:top-6">
            <div className="card space-y-6 border border-white/80 bg-white/90 shadow-xl shadow-brandRed/5">
              <div className="flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandRed text-lg font-bold text-white shadow-lg shadow-brandRed/25">IM</span>
              </div>
              <div className="grid gap-2">
                {navItems.map((item) => {
                  const isActive = active === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActive(item.key)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brandRed/10 ${
                        isActive ? 'border-brandRed bg-gradient-to-r from-brandRed to-brandYellow text-white shadow-brandRed/30' : 'border-gray-200 bg-white text-brandCharcoal'
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
                <p className="font-semibold text-brandRed">Get Premium now!</p>
                <p className="mt-1 text-gray-700">Subscribe to unlock deeper analytics and automated workflows.</p>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            {active === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-500">Hello, Admin 👋</p>
                    <h1 className="text-2xl font-bold text-brandCharcoal">Welcome back to your Imvo workspace</h1>
                    <p className="text-sm text-gray-600">Track performance, billing, and learning momentum at a glance.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden items-center gap-2 rounded-full bg-brandRed/10 px-3 py-1 text-xs font-semibold text-brandRed md:inline-flex">
                      <span className="inline-flex h-2 w-2 rounded-full bg-brandRed" aria-hidden />
                      Admin session
                    </span>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="flex items-center gap-2 rounded-full bg-brandCharcoal px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brandRed/20 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brandRed disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                      {signingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {learningTracks.map((track) => (
                    <LearningCard key={track.title} track={track} />
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="card relative overflow-hidden bg-white/90">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(199,15,44,0.05),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(247,201,72,0.08),transparent_35%)]" aria-hidden />
                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="section-title">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandRed/10 text-brandRed">⏱️</span>
                          <span>Hours spent</span>
                        </div>
                        <span className="badge bg-brandYellow/30 text-brandCharcoal">Weekly</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-500">This week</p>
                          <p className="text-3xl font-bold text-brandCharcoal">{(forecastSeries.reduce((a, b) => a + b, 0) / 10).toFixed(1)} hrs</p>
                          <p className="text-sm text-emerald-700">+12% vs last week</p>
                        </div>
                        <div className="rounded-2xl border border-dashed border-brandRed/30 bg-white/80 px-4 py-3 text-sm font-semibold text-brandCharcoal">
                          <p className="text-xs uppercase tracking-wide text-brandRed">Focus</p>
                          <p>Branding & automation</p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-end gap-2">
                        {forecastSeries.map((point, idx) => (
                          <div key={point} className="flex flex-1 flex-col items-center gap-2">
                            <div className="w-full rounded-full bg-gradient-to-t from-brandRed to-brandYellow" style={{ height: `${point / 1.2}%` }} />
                            <span className="text-[10px] font-semibold text-gray-500">D{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card space-y-4">
                    <div className="section-title">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandYellow/30 text-brandCharcoal">📈</span>
                      <span>Performance</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {advancedMetrics.map((metric) => (
                        <div key={metric.label} className="rounded-2xl border border-gray-100 bg-brandMuted px-4 py-3">
                          <p className="text-xs uppercase tracking-wide text-gray-500">{metric.label}</p>
                          <p className="text-xl font-bold text-brandCharcoal">{metric.value}</p>
                          <p className="text-sm text-emerald-700">{metric.delta}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                      <p className="text-sm font-semibold text-gray-600">Channel win rate</p>
                      <div className="mt-3 space-y-3">
                        {channelBreakdown.map((channel) => (
                          <div key={channel.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`badge ${channel.tone === 'red' ? 'bg-brandRed/10 text-brandRed' : channel.tone === 'yellow' ? 'bg-brandYellow/30 text-brandCharcoal' : 'bg-gray-100 text-gray-700'}`}>
                                {channel.label}
                              </span>
                              <span className="text-sm text-gray-500">Share of wins</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                                <div className={`h-full rounded-full ${channel.tone === 'red' ? 'bg-brandRed' : channel.tone === 'yellow' ? 'bg-brandYellow' : 'bg-gray-400'}`} style={{ width: `${channel.value}%` }} />
                              </div>
                              <p className="text-sm font-semibold text-brandCharcoal">{channel.value}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div className="section-title">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandYellow/30 text-brandCharcoal">💎</span>
                        <span>Your point</span>
                      </div>
                      <span className="badge bg-brandRed/10 text-brandRed">Live</span>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-brandMuted px-4 py-3">
                        <p className="text-sm font-semibold text-gray-500">Points</p>
                        <p className="text-3xl font-bold text-brandCharcoal">{(totals.paid + totals.outstanding).toLocaleString()}</p>
                        <p className="text-sm text-emerald-700">Across invoices & services</p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                        <p className="text-sm font-semibold text-gray-500">On-time payments</p>
                        <p className="text-3xl font-bold text-brandCharcoal">{Math.round((totals.paid / (totals.paid + totals.outstanding || 1)) * 100)}%</p>
                        <p className="text-sm text-gray-600"> {invoices.length} invoices tracked</p>
                      </div>
                    </div>
                  </div>

                  <LeaderboardCard />
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
              </div>
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
                    onClick={openCreateClient}
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

            <div className="space-y-4">
              {clientsError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {clientsError}
                </div>
              )}
              <ClientTable
                clients={clients}
                loading={clientsLoading}
                onSelect={openClientDetail}
                onEdit={openEditClient}
                onArchive={handleArchiveClient}
                onRestore={handleRestoreClient}
              />
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

          {active === 'dashboard' && (
            <div className="hidden lg:block">
              <ProfileRail />
            </div>
          )}
        </div>
      </div>

      {clientFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="absolute right-4 top-4">
              <button
                type="button"
                aria-label="Close client form"
                onClick={() => setClientFormOpen(false)}
                className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-brandCharcoal shadow"
              >
                Close
              </button>
            </div>
            <div className="card bg-white shadow-2xl">
              <ClientForm
                mode={clientFormMode}
                initialClient={clientFormInitial || undefined}
                onSuccess={handleClientSaved}
                onCancel={() => setClientFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {clientDetailOpen && selectedClient && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="absolute right-4 top-4">
              <button
                type="button"
                aria-label="Close client detail"
                onClick={() => setClientDetailOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-lg font-semibold text-brandCharcoal shadow"
              >
                ×
              </button>
            </div>
            <div className="card bg-white shadow-2xl">
              <ClientDetail
                client={selectedClient}
                onEdit={() => openEditClient(selectedClient)}
                onArchive={() => handleArchiveClient(selectedClient)}
                onRestore={() => handleRestoreClient(selectedClient)}
                onDelete={() => handleDeleteClient(selectedClient)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
