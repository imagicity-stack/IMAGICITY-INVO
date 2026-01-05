'use client';
import { useEffect, useState } from 'react';
import { StoredData, Client, Service, Invoice, Payment, Lead, Deal, Task, Activity, Proposal, Project, Expense, Ticket, Retainer, Settings } from '@/domain/types';
import { generateId, nowIso, fiscalYearLabel } from '@/utils';

const STORAGE_KEY = 'imagicity-os';

const defaultData = (): StoredData => ({
  clients: [],
  leads: [],
  deals: [],
  tasks: [],
  activities: [],
  services: [],
  proposals: [],
  projects: [],
  invoices: [],
  payments: [],
  receipts: [],
  vendors: [],
  expenses: [],
  tickets: [],
  retainers: [],
  settings: {
    id: 'default',
    companyName: 'IMAGICITY',
    invoicePrefix: 'IMC/INV',
    quotePrefix: 'IMC/QTN',
    receiptPrefix: 'IMC/RCPT',
    fiscalYearMode: 'Apr-Mar',
    numberingNext: { invoice: 1, quote: 1, receipt: 1, project: 1, payment: 1 },
    defaultGstRatePercent: 18,
    defaultTermsText: 'Payment due as per terms. Thank you for partnering with IMAGICITY.',
    defaultNotesText: 'Generated from IMAGICITY OS.',
    address: 'Mumbai, India',
    upiId: 'imagicity@upi'
  }
});

const seedData = (existing: StoredData): StoredData => {
  if (existing.clients.length) return existing;
  const now = nowIso();
  const clients: Client[] = [
    { id: generateId(), name: 'Amit Sharma', companyName: 'Sharma Imports', email: 'amit@sharma.com', phone: '900000001', billingAddress: {}, defaultPaymentTermsDays: 15, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Nisha Rao', companyName: 'Rao Digital', email: 'nisha@rao.digital', phone: '900000002', billingAddress: {}, defaultPaymentTermsDays: 15, createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Vikram Patil', companyName: 'Patil Ventures', email: 'vikram@patil.co', phone: '900000003', billingAddress: {}, defaultPaymentTermsDays: 30, createdAt: now, updatedAt: now }
  ];

  const services: Service[] = [
    { id: generateId(), name: 'Brand Strategy', unitType: 'Project', defaultRate: 150000, gstRatePercent: 18, description: 'Brand playbook', createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Performance Marketing', unitType: 'Month', defaultRate: 80000, gstRatePercent: 18, description: 'Paid ads mgmt', createdAt: now, updatedAt: now },
    { id: generateId(), name: 'Website Revamp', unitType: 'Project', defaultRate: 200000, gstRatePercent: 18, description: 'Next.js build', createdAt: now, updatedAt: now }
  ];

  const leads: Lead[] = Array.from({ length: 5 }).map((_, idx) => ({
    id: generateId(),
    name: `Lead ${idx + 1}`,
    source: idx % 2 === 0 ? 'Website' : 'Instagram',
    contactEmail: `lead${idx + 1}@mail.com`,
    contactPhone: `90000${1000 + idx}`,
    interestNotes: 'Looking for integrated marketing.',
    status: 'New',
    ownerName: 'Unassigned',
    createdAt: now,
    updatedAt: now,
  }));

  const deals: Deal[] = [
    { id: generateId(), dealName: 'Rao Digital Retainer', clientId: clients[1].id, stage: 'Negotiation', expectedCloseAt: now, valueExpected: 400000, probabilityPercent: 60, servicesPlanned: [{ title: 'Performance Marketing', qty: 1, rate: 80000 }], notes: 'Needs quicker reporting', createdAt: now, updatedAt: now },
    { id: generateId(), dealName: 'Sharma Imports Rebrand', clientId: clients[0].id, stage: 'ProposalSent', expectedCloseAt: now, valueExpected: 250000, probabilityPercent: 50, servicesPlanned: [{ title: 'Brand Strategy', qty: 1, rate: 150000 }], createdAt: now, updatedAt: now },
    { id: generateId(), dealName: 'Patil Ventures Web', clientId: clients[2].id, stage: 'Discovery', expectedCloseAt: now, valueExpected: 300000, probabilityPercent: 30, servicesPlanned: [{ title: 'Website Revamp', qty: 1, rate: 200000 }], createdAt: now, updatedAt: now }
  ];

  const invoices: Invoice[] = [
    { id: generateId(), invoiceNumber: 'IMC/INV/' + fiscalYearLabel() + '/0001', clientId: clients[0].id, status: 'Sent', issueDate: now, dueDate: now, items: [{ title: 'Brand Strategy', qty: 1, unitRate: 150000, gstRatePercent: 18 }], subtotal: 150000, discountTotal: 0, taxTotal: 27000, grandTotal: 177000, amountPaid: 50000, balanceDue: 127000, termsText: 'Net 15', createdAt: now, updatedAt: now },
    { id: generateId(), invoiceNumber: 'IMC/INV/' + fiscalYearLabel() + '/0002', clientId: clients[1].id, status: 'Paid', issueDate: now, dueDate: now, items: [{ title: 'Performance Marketing', qty: 1, unitRate: 80000, gstRatePercent: 18 }], subtotal: 80000, discountTotal: 0, taxTotal: 14400, grandTotal: 94400, amountPaid: 94400, balanceDue: 0, termsText: 'Net 15', createdAt: now, updatedAt: now },
    { id: generateId(), invoiceNumber: 'IMC/INV/' + fiscalYearLabel() + '/0003', clientId: clients[2].id, status: 'Overdue', issueDate: now, dueDate: new Date(Date.now() - 7 * 86400000).toISOString(), items: [{ title: 'Website Revamp', qty: 1, unitRate: 200000, gstRatePercent: 18 }], subtotal: 200000, discountTotal: 0, taxTotal: 36000, grandTotal: 236000, amountPaid: 0, balanceDue: 236000, termsText: 'Net 15', createdAt: now, updatedAt: now }
  ];

  const payments: Payment[] = [
    { id: generateId(), paymentNumber: 'IMC/PMT/' + fiscalYearLabel() + '/0001', invoiceId: invoices[0].id, clientId: clients[0].id, amount: 50000, mode: 'UPI', paidAt: now, createdAt: now },
    { id: generateId(), paymentNumber: 'IMC/PMT/' + fiscalYearLabel() + '/0002', invoiceId: invoices[1].id, clientId: clients[1].id, amount: 94400, mode: 'BankTransfer', paidAt: now, createdAt: now }
  ];

  const tasks: Task[] = [
    { id: generateId(), title: 'Follow up - Rao Digital', description: 'Share new deck', linkedType: 'Deal', linkedId: deals[0].id, dueAt: now, priority: 'High', status: 'Open', createdAt: now, updatedAt: now },
  ];

  const activities: Activity[] = [
    { id: generateId(), type: 'Note', linkedType: 'Deal', linkedId: deals[0].id, content: 'Client asked for revised pricing.', createdAt: now },
  ];

  const proposals: Proposal[] = [];
  const projects: Project[] = [];
  const expenses: Expense[] = [];
  const tickets: Ticket[] = [];
  const retainers: Retainer[] = [];

  return { ...existing, clients, leads, deals, services, invoices, payments, tasks, activities, proposals, projects, expenses, tickets, retainers };
};

export const useDataStore = () => {
  const [data, setData] = useState<StoredData>(defaultData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const parsed = stored ? (JSON.parse(stored) as StoredData) : defaultData();
    const seeded = seedData(parsed);
    setData(seeded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const reset = () => {
    const seeded = seedData(defaultData());
    setData(seeded);
  };

  const upsertClient = (client: Partial<Client> & { id?: string }) => {
    const now = nowIso();
    const id = client.id ?? generateId();
    const existing = data.clients.find((c) => c.id === id);
    const entity: Client = {
      id,
      name: client.name || existing?.name || 'New Client',
      companyName: client.companyName || existing?.companyName || client.name || 'Company',
      email: client.email || existing?.email || '',
      phone: client.phone || existing?.phone || '',
      gstin: client.gstin ?? existing?.gstin,
      billingAddress: client.billingAddress || existing?.billingAddress || {},
      shippingAddress: client.shippingAddress || existing?.shippingAddress,
      defaultPaymentTermsDays: client.defaultPaymentTermsDays ?? existing?.defaultPaymentTermsDays ?? 15,
      notes: client.notes ?? existing?.notes,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      lifetimeBilled: existing?.lifetimeBilled ?? 0,
      lifetimePaid: existing?.lifetimePaid ?? 0,
      outstanding: existing?.outstanding ?? 0,
    };
    setData((d) => ({ ...d, clients: [...d.clients.filter((c) => c.id !== id), entity] }));
  };

  const upsertService = (service: Partial<Service> & { id?: string }) => {
    const now = nowIso();
    const id = service.id ?? generateId();
    const existing = data.services.find((s) => s.id === id);
    const entity: Service = {
      id,
      name: service.name || existing?.name || 'New Service',
      unitType: (service.unitType as Service['unitType']) || existing?.unitType || 'Project',
      defaultRate: service.defaultRate ?? existing?.defaultRate ?? 0,
      gstRatePercent: service.gstRatePercent ?? existing?.gstRatePercent ?? 18,
      description: service.description ?? existing?.description,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    setData((d) => ({ ...d, services: [...d.services.filter((s) => s.id !== id), entity] }));
  };

  return { data, setData, hydrated, reset, upsertClient, upsertService };
};
