export type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

export type Client = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  gstin?: string;
  billingAddress: Address;
  shippingAddress?: Address;
  defaultPaymentTermsDays: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lifetimeBilled?: number;
  lifetimePaid?: number;
  outstanding?: number;
};

export type Lead = {
  id: string;
  name: string;
  source: 'Instagram' | 'Website' | 'Referral' | 'WhatsApp' | 'Other';
  contactEmail?: string;
  contactPhone?: string;
  interestNotes?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
  ownerName: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type DealStage = 'Discovery' | 'ProposalSent' | 'Negotiation' | 'Won' | 'Lost';

export type DealServiceSnapshot = {
  serviceId?: string;
  title: string;
  qty: number;
  rate: number;
};

export type Deal = {
  id: string;
  dealName: string;
  clientId?: string;
  leadId?: string;
  stage: DealStage;
  expectedCloseAt?: string;
  valueExpected: number;
  probabilityPercent: number;
  servicesPlanned: DealServiceSnapshot[];
  notes?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  linkedType: 'Lead' | 'Deal' | 'Client' | 'Project' | 'Invoice';
  linkedId: string;
  dueAt: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Done';
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: string;
  type: 'Note' | 'Call' | 'Message' | 'Email';
  linkedType: Task['linkedType'];
  linkedId: string;
  content: string;
  createdAt: string;
};

export type Service = {
  id: string;
  name: string;
  unitType: 'Project' | 'Month' | 'Hour' | 'Quantity';
  defaultRate: number;
  gstRatePercent?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type QuoteItem = {
  serviceId?: string;
  title: string;
  description?: string;
  qty: number;
  unitRate: number;
  discountPercent?: number;
  gstRatePercent: number;
};

export type ProposalStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired';

export type Proposal = {
  id: string;
  quoteNumber: string;
  clientId: string;
  dealId?: string;
  status: ProposalStatus;
  issueDate: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  termsText?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectStatus = 'Planning' | 'InProgress' | 'Review' | 'Completed' | 'OnHold';

export type ProjectMilestone = {
  title: string;
  dueAt: string;
  status: 'Open' | 'Done';
};

export type Project = {
  id: string;
  projectCode: string;
  name: string;
  clientId: string;
  dealId?: string;
  status: ProjectStatus;
  startDate: string;
  targetEndDate?: string;
  budgetRevenue?: number;
  budgetCost?: number;
  milestones: ProjectMilestone[];
  assignedPeople: string[];
  createdAt: string;
  updatedAt: string;
};

export type InvoiceStatus = 'Draft' | 'Sent' | 'PartiallyPaid' | 'Paid' | 'Overdue' | 'Cancelled';

export type InvoiceItem = QuoteItem;

export type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  quoteId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  termsText?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMode = 'UPI' | 'BankTransfer' | 'Cash' | 'Card' | 'Other';

export type Payment = {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  mode: PaymentMode;
  referenceId?: string;
  paidAt: string;
  notes?: string;
  createdAt: string;
};

export type Receipt = {
  id: string;
  receiptNumber: string;
  paymentId: string;
  invoiceId: string;
  generatedAt: string;
};

export type Vendor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  id: string;
  vendorId?: string;
  projectId?: string;
  category: 'Software' | 'Freelance' | 'Travel' | 'Ads' | 'Print' | 'Other';
  amount: number;
  expenseDate: string;
  status: 'Unpaid' | 'Paid';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Ticket = {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
};

export type Retainer = {
  id: string;
  clientId: string;
  serviceBundleText: string;
  monthlyFee: number;
  startDate: string;
  endDate?: string;
  billingDayOfMonth: number;
  status: 'Active' | 'Paused' | 'Ended';
  nextInvoiceDate: string;
};

export type Settings = {
  id: 'default';
  companyName: string;
  logoUrl?: string;
  address?: string;
  gstin?: string;
  pan?: string;
  bankDetails?: {
    accountName?: string;
    accountNo?: string;
    ifsc?: string;
    bankName?: string;
  };
  upiId?: string;
  invoicePrefix: string;
  quotePrefix: string;
  receiptPrefix: string;
  fiscalYearMode: 'Apr-Mar';
  numberingNext: {
    invoice: number;
    quote: number;
    receipt: number;
    project: number;
    payment: number;
  };
  defaultGstRatePercent?: number;
  defaultTermsText?: string;
  defaultNotesText?: string;
};

export type StoredData = {
  clients: Client[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  services: Service[];
  proposals: Proposal[];
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
  receipts: Receipt[];
  vendors: Vendor[];
  expenses: Expense[];
  tickets: Ticket[];
  retainers: Retainer[];
  settings: Settings;
};
