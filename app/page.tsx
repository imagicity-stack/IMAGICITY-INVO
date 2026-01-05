import { ArrowRight, Check, Download, FileText, Shield, Sparkles } from "lucide-react";

const highlights = [
  {
    title: "GST-ready invoicing",
    description:
      "Indian GST layouts with HSN/SAC, reverse charge, and place-of-supply tagging for interstate and intrastate billing.",
    icon: <Shield className="h-6 w-6 text-primary" />,
  },
  {
    title: "Quotations to invoices",
    description: "Clone approved quotes into tax invoices with audit trails and payment collection steps.",
    icon: <FileText className="h-6 w-6 text-primary" />,
  },
  {
    title: "Instant PDFs",
    description: "Download GST-compliant PDFs with e-sign blocks, QR codes, and bilingual notes for vendors.",
    icon: <Download className="h-6 w-6 text-primary" />,
  },
];

const compliance = [
  "GSTIN validation with structure checks and PAN extraction",
  "Auto CGST/SGST split for intra-state and IGST for inter-state transactions",
  "HSN/SAC wise tax slabs, cess, and RCM toggles",
  "Invoice numbering with fiscal-year prefixes to avoid duplicates",
  "Place of supply, billing vs shipping state, and e-invoice IRN placeholders",
];

const features = [
  {
    title: "Smart templates",
    detail: "Red, yellow, and black layouts with logo lockup, signatures, QR for payments, and branded typography.",
  },
  {
    title: "Team workspaces",
    detail: "Role-based access for sales, finance, and delivery; Firebase Auth + Firestore rules baked in.",
  },
  {
    title: "Service catalog",
    detail: "SKU, HSN/SAC, unit of measure, and pre-set GST slab for repeatable line items.",
  },
  {
    title: "Approvals & audit",
    detail: "Quotation approvals, revision history, and immutable invoice timelines with change comments.",
  },
  {
    title: "Collections",
    detail: "Payment links, due-date nudges, TDS/TCS notes, and receipt issuance with PDF proof.",
  },
  {
    title: "Analytics",
    detail: "Monthly revenue, receivables ageing, GST liability, and client performance dashboards.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 py-12 md:px-8 md:py-16">
      <header className="flex flex-col gap-10 rounded-3xl border border-black/10 bg-white/80 p-8 shadow-glow backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-6 md:max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" /> Imagicity revenue office
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-accent-black md:text-5xl">
            Imvo: invoices, quotations, and collections in one red-hot workspace.
          </h1>
          <p className="text-lg text-accent-black/80">
            Built for Indian marketing agencies that need GST-compliant paperwork, rapid PDF sharing, and a branded
            experience clients remember.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-dark">
              Start with Firebase
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-yellow/20 px-4 py-2 text-sm font-semibold text-accent-black">
              <Check className="h-4 w-4" /> GST-ready layouts & PDF
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-accent-black/70">
            <span className="badge bg-primary/10 text-primary">Invoices & Debit Notes</span>
            <span className="badge bg-accent-yellow/20 text-accent-black">Quotations & Proposals</span>
            <span className="badge bg-accent-black text-white">Receipts & Credit Notes</span>
          </div>
        </div>
        <div className="gradient-border rounded-3xl">
          <div className="glass-card relative h-full rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent-black/70">Invoice</p>
                <p className="text-2xl font-bold text-primary">₹84,200</p>
                <p className="text-xs text-accent-black/60">Due in 7 days • IGST @18%</p>
              </div>
              <span className="badge bg-accent-black text-white">PDF ready</span>
            </div>
            <div className="mt-6 space-y-4 text-sm text-accent-black/80">
              <div className="flex justify-between border-b border-dashed border-accent-black/10 pb-2">
                <span>Creative Retainer</span>
                <span>₹45,000</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-accent-black/10 pb-2">
                <span>Performance Marketing</span>
                <span>₹25,000</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-accent-black/10 pb-2">
                <span>Production - HSN 99836</span>
                <span>₹10,000</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-accent-black/10 pb-2">
                <span>IGST 18%</span>
                <span>₹12,600</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹92,600</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-primary/5 px-4 py-3 text-sm text-accent-black/80">
              <Shield className="h-5 w-5 text-primary" />
              Reverse charge toggle, GSTIN validation, and invoice sequencing already configured.
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-8 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="glass-card rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">{item.icon}</div>
            <h3 className="mt-4 text-xl font-semibold text-accent-black">{item.title}</h3>
            <p className="mt-2 text-sm text-accent-black/70">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-glow">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-6">
            <p className="badge bg-primary/10 text-primary">For Indian GST workflows</p>
            <h2 className="section-heading text-accent-black">Compliance that keeps finance happy.</h2>
            <p className="text-base text-accent-black/80">
              Every invoice and quotation is structured to pass GST audits: tax splits, place of supply, invoice series,
              and optional e-invoice IRN/QR placeholders.
            </p>
            <ul className="space-y-3 text-sm text-accent-black/80">
              {compliance.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <span className="badge bg-accent-yellow/30 text-accent-black">HSN/SAC library</span>
              <span className="badge bg-primary/10 text-primary">Reverse charge</span>
              <span className="badge bg-accent-black text-white">IRN & e-waybill placeholders</span>
            </div>
          </div>
          <div className="glass-card flex max-w-xl flex-col gap-4 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-accent-black/60">Quote overview</p>
                <p className="text-xl font-bold text-accent-black">Imagicity x Urban Threads</p>
              </div>
              <span className="badge bg-primary text-white">IGST @18%</span>
            </div>
            <div className="space-y-3 text-sm text-accent-black/80">
              <div className="flex items-center justify-between rounded-xl bg-accent-yellow/10 px-4 py-3">
                <div>
                  <p className="font-semibold">Proposal value</p>
                  <p className="text-xs text-accent-black/60">₹12,50,000 • 45 day validity</p>
                </div>
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
                <div>
                  <p className="font-semibold">GST split</p>
                  <p className="text-xs text-accent-black/60">IGST auto-applied (KA → MH)</p>
                </div>
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                  <p className="text-accent-black/60">HSN/SAC</p>
                  <p className="font-semibold text-accent-black">998361</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                  <p className="text-accent-black/60">Reverse charge</p>
                  <p className="font-semibold text-accent-black">Disabled</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                  <p className="text-accent-black/60">Invoice series</p>
                  <p className="font-semibold text-accent-black">IMAG/24-25/203</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                  <p className="text-accent-black/60">E-invoice</p>
                  <p className="font-semibold text-accent-black">IRN pending</p>
                </div>
              </div>
            </div>
            <button className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent-black px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-black/30">
              Download GST-ready PDF <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3">
          <p className="badge bg-primary/10 text-primary">Workspace</p>
          <h2 className="section-heading text-accent-black">Run invoicing, quotes, and receipts together.</h2>
          <p className="max-w-3xl text-base text-accent-black/80">
            Imvo keeps all sales and finance documents on a single workspace. Build quotations, convert them into invoices,
            and issue receipts with PDF proof—all synced to Firebase.
          </p>
        </div>
        <div className="card-grid">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-accent-black">{feature.title}</h3>
              <p className="mt-2 text-sm text-accent-black/70">{feature.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 rounded-3xl border border-black/10 bg-white/80 p-8 shadow-glow md:grid-cols-2">
        <div className="space-y-4">
          <p className="badge bg-accent-yellow/30 text-accent-black">Firebase foundation</p>
          <h2 className="section-heading text-accent-black">Realtime data, secure auth, and backups.</h2>
          <p className="text-base text-accent-black/80">
            Imvo uses Firebase Authentication for user sign-in, Firestore for invoices/quotes, and Cloud Storage for PDF
            renders. Optional Cloud Functions handle invoice numbering and IRN API calls.
          </p>
          <ul className="space-y-3 text-sm text-accent-black/80">
            <li className="flex items-start gap-3">
              <Check className="mt-1 h-4 w-4 text-primary" />
              <span>Multi-tenant structure: /accounts/{"{accountId}"}/clients/{"{clientId}"}/invoices/{"{invoiceId}"}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="mt-1 h-4 w-4 text-primary" />
              <span>Security rules enforce role claims (owner, finance, sales) with audit timestamps.</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="mt-1 h-4 w-4 text-primary" />
              <span>Pre-rendered PDF storage at /pdfs/{"{invoiceId}"}.pdf with signed download URLs.</span>
            </li>
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-accent-black">Invoice creation flow</h3>
            <span className="badge bg-primary text-white">Live sync</span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-accent-black/80">
            {["Capture client & GSTIN", "Add line items with HSN/SAC", "Auto tax calculation", "Generate PDF", "Send & collect"].map(
              (step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-xl bg-accent-yellow/10 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ),
            )}
          </div>
          <div className="mt-4 rounded-xl bg-accent-black px-4 py-3 text-sm text-white">
            Example invoice JSON ready for Firestore:
            <pre className="mt-2 overflow-x-auto text-xs text-accent-yellow">
{`{
  accountId: "imagicity",
  client: { name: "Urban Threads", gstin: "29ABCDE1234F2Z5", state: "KA" },
  invoiceNo: "IMAG/24-25/203",
  invoiceDate: "2024-06-12",
  placeOfSupply: "KA",
  lineItems: [
    { description: "Performance marketing", hsn: "998361", qty: 1, price: 25000, gstRate: 18 },
    { description: "Creative retainer", hsn: "998365", qty: 1, price: 45000, gstRate: 18 }
  ],
  igst: 12600,
  total: 92600,
  reverseCharge: false,
  status: "pending",
}`}
            </pre>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-3xl bg-gradient-to-r from-primary via-accent-yellow to-accent-black p-[1px]">
        <div className="grid h-full grid-cols-1 gap-6 rounded-3xl bg-white/95 p-8 md:grid-cols-2">
          <div className="space-y-4">
            <p className="badge bg-primary/10 text-primary">PDF & brand</p>
            <h2 className="section-heading text-accent-black">Branded documents that clients trust.</h2>
            <p className="text-base text-accent-black/80">
              Beautiful invoice and quotation PDFs featuring your logo, signature blocks, QR codes, and payment terms in
              English and Hindi placeholders.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <span className="badge bg-accent-black text-white">Signature ready</span>
              <span className="badge bg-accent-yellow/20 text-accent-black">UPI/Bank QR support</span>
              <span className="badge bg-primary/10 text-primary">Auto mailing</span>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between text-sm text-accent-black/70">
              <span>Imvo PDF preview</span>
              <span className="badge bg-primary text-white">Brand colors</span>
            </div>
            <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-accent-black/10 bg-white p-5 text-sm text-accent-black/80">
              <div className="flex justify-between">
                <span>Bill to</span>
                <span className="font-semibold text-accent-black">Urban Threads</span>
              </div>
              <div className="flex justify-between">
                <span>Invoice #</span>
                <span className="font-semibold text-accent-black">IMAG/24-25/203</span>
              </div>
              <div className="flex justify-between">
                <span>Tax summary</span>
                <span className="font-semibold text-primary">IGST ₹12,600</span>
              </div>
              <div className="flex justify-between">
                <span>Payment terms</span>
                <span className="font-semibold text-accent-black">T+30 days, 1.5% late fee</span>
              </div>
              <div className="flex justify-between">
                <span>Signature</span>
                <span className="font-semibold text-accent-black">Authorized signatory</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
