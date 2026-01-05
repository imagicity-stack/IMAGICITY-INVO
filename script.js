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
  { name: 'Acme Brands', gstin: '27ABCDE1234F1Z5', city: 'Mumbai' },
  { name: 'Northlight Foods', gstin: '29PQRSX5678L1Z7', city: 'Bengaluru' },
  { name: 'Helios Mobility', gstin: '07HELIO1234K1Z2', city: 'New Delhi' },
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
    });
    clientListContainer.appendChild(row);
  });
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
  addItemRow(invoiceItemsContainer, invoiceItems, document.getElementById('item-hsn').value);
  addItemRow(quoteItemsContainer, quoteItems, document.getElementById('quote-hsn').value);
  updateInvoicePreview();
  updateQuotePreview();
}

hydrateDefaults();
