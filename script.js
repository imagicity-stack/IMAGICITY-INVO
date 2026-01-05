const invoiceItemsContainer = document.getElementById('invoice-items');
const invoicePreview = document.getElementById('invoice-preview');
const invoiceForm = document.getElementById('invoice-form');
const invoicePdfBtn = document.getElementById('invoice-pdf');
const addInvoiceItemBtn = document.getElementById('add-invoice-item');

const quoteItemsContainer = document.getElementById('quote-items');
const quotePreview = document.getElementById('quote-preview');
const quoteForm = document.getElementById('quotation-form');
const quotePdfBtn = document.getElementById('quote-pdf');
const addQuoteItemBtn = document.getElementById('add-quote-item');

const templatesContainer = document.getElementById('templates');
const clientListContainer = document.getElementById('client-list');
const printDashboardBtn = document.getElementById('print-dashboard');
const kpiCards = document.getElementById('kpi-cards');
const recentInvoicesTable = document.querySelector('#recent-invoices tbody');
const dateFilter = document.getElementById('date-filter');
const clientsTableBody = document.querySelector('#clients-table tbody');
const clientMeta = document.getElementById('client-meta');
const servicesTableBody = document.querySelector('#services-table tbody');
const quotationTableBody = document.querySelector('#quotation-table tbody');
const invoiceTableBody = document.querySelector('#invoice-table tbody');
const paymentsTableBody = document.querySelector('#payments-table tbody');
const receiptMeta = document.getElementById('receipt-meta');
const reportSales = document.getElementById('report-sales');
const reportOutstanding = document.getElementById('report-outstanding');
const reportClientRevenue = document.getElementById('report-client-revenue');
const reportGst = document.getElementById('report-gst');

const invoiceItems = [];
const quoteItems = [];

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

const defaultTemplates = [
  { name: 'Ad Campaign Sprint', badge: 'amber' },
  { name: 'Performance Retainer', badge: 'green' },
  { name: 'Brand Launch + PR', badge: 'amber' },
  { name: 'Content + SEO', badge: 'green' },
];

const defaultClients = [
  { name: 'Acme Brands', gstin: '27ABCDE1234F1Z5', city: 'Mumbai', outstanding: 0, notes: 'Prefers UPI; 15-day terms' },
  { name: 'Northlight Foods', gstin: '29PQRSX5678L1Z7', city: 'Bengaluru', outstanding: 42000, notes: 'PO required; 30-day terms' },
  { name: 'Helios Mobility', gstin: '07HELIO1234K1Z2', city: 'New Delhi', outstanding: 18000, notes: 'Add L2 approval in emails' },
];

const services = [
  { name: 'Performance marketing retainer', unit: 'month', rate: 85000, gst: 18, description: 'Meta + Google ads, CRO' },
  { name: 'SEO + content stack', unit: 'month', rate: 60000, gst: 18, description: 'Technical SEO, 6 articles' },
  { name: 'Brand launch sprint', unit: 'project', rate: 140000, gst: 18, description: 'Positioning, creative, PR kit' },
];

const invoicesData = [
  { id: 'IMV-2024-015', client: 'Acme Brands', status: 'Paid', total: 125000, due: '-', outstanding: 0, paid: 125000, month: 'this-month' },
  { id: 'IMV-2024-014', client: 'Northlight Foods', status: 'Overdue', total: 42000, due: '5 days', outstanding: 42000, paid: 0, month: 'this-month' },
  { id: 'IMV-2024-013', client: 'Helios Mobility', status: 'Partially paid', total: 52000, due: '10 days', outstanding: 18000, paid: 34000, month: 'last-month' },
];

const quotationsData = [
  { id: 'QTN-2024-009', client: 'Acme Brands', status: 'Approved', total: 95000, action: 'Convert to invoice' },
  { id: 'QTN-2024-008', client: 'Northlight Foods', status: 'Sent', total: 68000, action: 'Duplicate' },
  { id: 'QTN-2024-007', client: 'Helios Mobility', status: 'Draft', total: 74000, action: 'Send' },
];

const paymentsData = [
  { id: 'PMT-1021', invoice: 'IMV-2024-015', client: 'Acme Brands', amount: 125000, date: '2024-06-18', mode: 'NEFT' },
  { id: 'PMT-1020', invoice: 'IMV-2024-013', client: 'Helios Mobility', amount: 34000, date: '2024-05-30', mode: 'UPI' },
];

function renderTemplates() {
  templatesContainer.innerHTML = '';
  defaultTemplates.forEach((template) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = template.name;
    chip.dataset.badge = template.badge;
    templatesContainer.appendChild(chip);
  });
}

function renderClients() {
  clientListContainer.innerHTML = '';
  defaultClients.forEach((client) => {
    const row = document.createElement('div');
    row.className = 'client-card';
    row.innerHTML = `<div><strong>${client.name}</strong><br/><span>${client.city}</span></div><span class="badge amber">GSTIN ${client.gstin}</span>`;
    row.addEventListener('click', () => {
      invoiceForm.clientName.value = client.name;
      invoiceForm.clientGstin.value = client.gstin;
      invoiceForm.placeOfSupply.value = client.city;
      quoteForm.quoteClient.value = `${client.name} (${client.city})`;
      highlightClientDetail(client);
    });
    clientListContainer.appendChild(row);
  });
}

function renderKpis(range) {
  const filteredInvoices = invoicesData.filter((inv) => range === 'custom' ? true : inv.month === range || range === 'this-month');
  const billed = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const collected = paymentsData.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = filteredInvoices.reduce((sum, inv) => sum + inv.outstanding, 0);
  const overdueCount = filteredInvoices.filter((inv) => inv.status === 'Overdue').length;

  const kpiList = [
    { label: 'Total billed', value: formatINR(billed) },
    { label: 'Total collected', value: formatINR(collected) },
    { label: 'Outstanding', value: formatINR(outstanding) },
    { label: 'Overdue count', value: overdueCount },
  ];

  kpiCards.innerHTML = '';
  kpiList.forEach((kpi) => {
    const card = document.createElement('div');
    card.className = 'kpi';
    card.innerHTML = `<p class="eyebrow">${kpi.label}</p><strong>${kpi.value}</strong>`;
    kpiCards.appendChild(card);
  });
}

function renderRecentInvoices(range) {
  const filtered = invoicesData.filter((inv) => range === 'custom' ? true : inv.month === range || range === 'this-month');
  recentInvoicesTable.innerHTML = '';
  filtered.forEach((inv) => {
    const tr = document.createElement('tr');
    const statusClass = inv.status === 'Paid' ? 'green' : inv.status === 'Overdue' ? 'red' : 'amber';
    tr.innerHTML = `
      <td>${inv.id}</td>
      <td>${inv.client}</td>
      <td><span class="status badge ${statusClass}"><span class="status-dot"></span>${inv.status}</span></td>
      <td>${formatINR(inv.total)}</td>
      <td>${inv.due}</td>
    `;
    recentInvoicesTable.appendChild(tr);
  });
}

function highlightClientDetail(client) {
  clientMeta.innerHTML = '';
  const invoicesForClient = invoicesData.filter((inv) => inv.client === client.name);
  const billed = invoicesForClient.reduce((sum, inv) => sum + inv.total, 0);
  const paid = invoicesForClient.reduce((sum, inv) => sum + inv.paid, 0);
  const outstanding = billed - paid;
  const detail = document.createElement('div');
  detail.className = 'stack';
  detail.innerHTML = `
    <strong>${client.name}</strong>
    <p class="eyebrow">GSTIN: ${client.gstin} • City: ${client.city}</p>
    <p>Total billed: ${formatINR(billed)}</p>
    <p>Total paid: ${formatINR(paid)}</p>
    <p>Outstanding: ${formatINR(outstanding)}</p>
    <p class="lede">Notes: ${client.notes}</p>
  `;
  clientMeta.appendChild(detail);
}

function renderClientsTable() {
  clientsTableBody.innerHTML = '';
  defaultClients.forEach((client) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${client.name}</td>
      <td>${client.gstin}</td>
      <td>${client.city}</td>
      <td>${formatINR(client.outstanding)}</td>
    `;
    tr.addEventListener('click', () => highlightClientDetail(client));
    clientsTableBody.appendChild(tr);
  });
}

function renderServices() {
  servicesTableBody.innerHTML = '';
  services.forEach((service) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${service.name}</td>
      <td>${service.unit}</td>
      <td>${formatINR(service.rate)}</td>
      <td>${service.gst}%</td>
      <td>${service.description}</td>
    `;
    servicesTableBody.appendChild(tr);
  });
}

function renderQuotations() {
  quotationTableBody.innerHTML = '';
  quotationsData.forEach((quote) => {
    const statusClass = quote.status === 'Approved' ? 'green' : quote.status === 'Draft' ? 'amber' : 'red';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${quote.id}</td>
      <td>${quote.client}</td>
      <td><span class="status badge ${statusClass}"><span class="status-dot"></span>${quote.status}</span></td>
      <td>${formatINR(quote.total)}</td>
      <td>${quote.action}</td>
    `;
    quotationTableBody.appendChild(tr);
  });
}

function renderInvoicesTable() {
  invoiceTableBody.innerHTML = '';
  invoicesData.forEach((inv) => {
    const statusClass = inv.status === 'Paid' ? 'green' : inv.status === 'Overdue' ? 'red' : 'amber';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${inv.id}</td>
      <td>${inv.client}</td>
      <td><span class="status badge ${statusClass}"><span class="status-dot"></span>${inv.status}</span></td>
      <td>${formatINR(inv.total)}</td>
      <td>${inv.due}</td>
    `;
    invoiceTableBody.appendChild(tr);
  });
}

function renderPayments() {
  paymentsTableBody.innerHTML = '';
  paymentsData.forEach((pay) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pay.id}</td>
      <td>${pay.invoice}</td>
      <td>${pay.client}</td>
      <td>${formatINR(pay.amount)}</td>
      <td>${pay.date}</td>
    `;
    paymentsTableBody.appendChild(tr);
  });

  const latest = paymentsData[0];
  receiptMeta.innerHTML = latest
    ? `<p><strong>${latest.id}</strong> for ${latest.invoice}</p><p class="eyebrow">${latest.client}</p><p>Amount: ${formatINR(latest.amount)} via ${latest.mode}</p><p>Date: ${latest.date}</p>`
    : '<p>No payments yet.</p>';
}

function renderReports() {
  const billed = invoicesData.reduce((sum, inv) => sum + inv.total, 0);
  const outstanding = invoicesData.reduce((sum, inv) => sum + inv.outstanding, 0);
  const collected = paymentsData.reduce((sum, p) => sum + p.amount, 0);
  const gst = invoicesData.reduce((sum, inv) => sum + inv.total * 0.18, 0);

  reportSales.textContent = formatINR(billed);
  reportOutstanding.textContent = formatINR(outstanding);
  reportClientRevenue.textContent = formatINR(billed - outstanding);
  reportGst.textContent = formatINR(gst);
}

function addItemRow(container, items, defaultHsn = '') {
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `
    <input placeholder="Description" required />
    <input placeholder="HSN / SAC" />
    <input placeholder="Qty" type="number" min="1" step="1" value="1" />
    <input placeholder="Rate" type="number" min="0" step="0.01" value="0" />
    <input placeholder="Taxable" type="number" min="0" step="0.01" value="0" />
    <button type="button" class="secondary">✕</button>
  `;
  container.appendChild(row);
  items.push(row);

   const hsnInput = row.querySelectorAll('input')[1];
   hsnInput.value = defaultHsn;

  const removeBtn = row.querySelector('button');
  removeBtn.addEventListener('click', () => {
    container.removeChild(row);
    const index = items.indexOf(row);
    if (index > -1) items.splice(index, 1);
    updateInvoicePreview();
    updateQuotePreview();
  });

  row.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
      updateInvoicePreview();
      updateQuotePreview();
    });
  });
}

function buildTableData(items, taxRate) {
  let subtotal = 0;
  const tableRows = items.map((row, idx) => {
    const [desc, hsn, qty, rate, taxableInput] = row.querySelectorAll('input');
    const qtyVal = parseFloat(qty.value) || 0;
    const rateVal = parseFloat(rate.value) || 0;
    const manualTaxable = parseFloat(taxableInput.value);
    const taxable = isNaN(manualTaxable) || manualTaxable === 0 ? qtyVal * rateVal : manualTaxable;
    subtotal += taxable;
    return [idx + 1, desc.value || 'Line item', hsn.value || '-', qtyVal, rateVal, taxable];
  });
  const taxAmount = +(subtotal * (taxRate / 100)).toFixed(2);
  return { tableRows, subtotal: +subtotal.toFixed(2), taxAmount };
}

function renderPreview(target, data) {
  const { header, items, taxRate, interstate, notes } = data;
  const { tableRows, subtotal, taxAmount } = buildTableData(items, taxRate);
  const taxSplitLabel = interstate === 'yes' ? 'IGST' : 'CGST + SGST';
  const split = interstate === 'yes' ? [{ label: 'IGST', value: taxAmount }] : [
    { label: 'CGST', value: +(taxAmount / 2).toFixed(2) },
    { label: 'SGST', value: +(taxAmount / 2).toFixed(2) },
  ];
  const total = subtotal + taxAmount;

  const rowsHtml = tableRows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${formatINR(row[4])}</td><td>${formatINR(row[5])}</td></tr>`).join('');
  const taxRows = split.map((t) => `<tr><td colspan="5">${t.label} (${taxRate}%)</td><td>${formatINR(t.value)}</td></tr>`).join('');
  target.innerHTML = `
    <h4>${header}</h4>
    <p class="eyebrow">${taxSplitLabel} • HSN/SAC captured • GSTIN required</p>
    <table>
      <thead><tr><th>#</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>Taxable</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
      <tfoot>
        <tr><td colspan="5">Subtotal</td><td>${formatINR(subtotal)}</td></tr>
        ${taxRows}
        <tr><td colspan="5">Grand total</td><td>${formatINR(total)}</td></tr>
      </tfoot>
    </table>
    ${notes ? `<p class="eyebrow">Notes: ${notes}</p>` : ''}
  `;
}

function updateInvoicePreview() {
  const taxRate = parseFloat(document.getElementById('item-tax').value) || 0;
  const interstate = invoiceForm.interstate.value;
  renderPreview(invoicePreview, {
    header: `Invoice preview — ${invoiceForm.invoiceNumber.value || 'Draft'}`,
    items: invoiceItems,
    taxRate,
    interstate,
    notes: invoiceForm.notes.value,
  });
}

function updateQuotePreview() {
  const taxRate = parseFloat(document.getElementById('quote-tax').value) || 0;
  renderPreview(quotePreview, {
    header: `Quotation preview — ${quoteForm.quoteNumber.value || 'Draft'}`,
    items: quoteItems,
    taxRate,
    interstate: 'yes',
    notes: quoteForm.quoteSummary.value,
  });
}

function generatePdf({ title, formData, items, taxRate, interstate }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.text(`Client: ${formData.clientName || formData.quoteClient || ''}`, 14, 26);
  if (formData.clientGstin) doc.text(`Client GSTIN: ${formData.clientGstin}`, 14, 32);
  if (formData.placeOfSupply) doc.text(`Place of supply: ${formData.placeOfSupply}`, 14, 38);
  const headerDate = formData.issueDate || formData.validUntil;
  if (headerDate) doc.text(`Date: ${headerDate}`, 14, 44);

  const { tableRows, subtotal, taxAmount } = buildTableData(items, taxRate);
  const taxSplit = interstate === 'yes'
    ? [{ label: 'IGST', value: taxAmount }]
    : [ { label: 'CGST', value: +(taxAmount/2).toFixed(2) }, { label: 'SGST', value: +(taxAmount/2).toFixed(2) } ];

  doc.autoTable({
    head: [['#', 'Description', 'HSN/SAC', 'Qty', 'Rate', 'Taxable value']],
    body: tableRows.map((row) => [row[0], row[1], row[2], row[3], formatINR(row[4]), formatINR(row[5])]),
    startY: 52,
  });

  let y = doc.lastAutoTable.finalY + 6;
  doc.text(`Subtotal: ${formatINR(subtotal)}`, 14, y); y += 6;
  taxSplit.forEach((split) => { doc.text(`${split.label} @${taxRate}%: ${formatINR(split.value)}`, 14, y); y += 6; });
  doc.text(`Grand total: ${formatINR(subtotal + taxAmount)}`, 14, y);

  doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

addInvoiceItemBtn.addEventListener('click', () => {
  const defaultHsn = document.getElementById('item-hsn').value;
  addItemRow(invoiceItemsContainer, invoiceItems, defaultHsn);
  updateInvoicePreview();
});

addQuoteItemBtn.addEventListener('click', () => {
  const defaultHsn = document.getElementById('quote-hsn').value;
  addItemRow(quoteItemsContainer, quoteItems, defaultHsn);
  updateQuotePreview();
});

invoicePdfBtn.addEventListener('click', () => {
  generatePdf({
    title: invoiceForm.invoiceNumber.value || 'Invoice',
    formData: Object.fromEntries(new FormData(invoiceForm).entries()),
    items: invoiceItems,
    taxRate: parseFloat(document.getElementById('item-tax').value) || 0,
    interstate: invoiceForm.interstate.value,
  });
});

quotePdfBtn.addEventListener('click', () => {
  generatePdf({
    title: quoteForm.quoteNumber.value || 'Quotation',
    formData: Object.fromEntries(new FormData(quoteForm).entries()),
    items: quoteItems,
    taxRate: parseFloat(document.getElementById('quote-tax').value) || 0,
    interstate: 'yes',
  });
});

printDashboardBtn.addEventListener('click', () => window.print());

// Firebase-ready stubs
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_BUCKET',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

async function saveDraftToFirebase(collection, payload) {
  console.info(`TODO: Save to Firebase collection ${collection}`, payload);
  // Example with Firestore:
  // import { initializeApp } from 'firebase/app';
  // import { getFirestore, collection, addDoc } from 'firebase/firestore';
  // const app = initializeApp(firebaseConfig);
  // const db = getFirestore(app);
  // await addDoc(collection(db, collection), payload);
}

function hydrateDefaults() {
  renderTemplates();
  renderClients();
  renderClientsTable();
  renderServices();
  renderQuotations();
  renderInvoicesTable();
  renderPayments();
  renderReports();
  renderKpis('this-month');
  renderRecentInvoices('this-month');
  highlightClientDetail(defaultClients[0]);
  addItemRow(invoiceItemsContainer, invoiceItems, document.getElementById('item-hsn').value);
  addItemRow(quoteItemsContainer, quoteItems, document.getElementById('quote-hsn').value);
  updateInvoicePreview();
  updateQuotePreview();
}

hydrateDefaults();

dateFilter?.addEventListener('click', (event) => {
  if (event.target.tagName.toLowerCase() !== 'button') return;
  dateFilter.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'));
  event.target.classList.add('active');
  const range = event.target.dataset.range;
  renderKpis(range);
  renderRecentInvoices(range);
});
