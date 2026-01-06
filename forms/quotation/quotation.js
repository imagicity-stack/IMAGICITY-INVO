import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { collection, doc, getDoc, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

let downloadedFileName = "quotation.pdf";

function showStatus(message, type = "info") {
  const el = document.getElementById("status");
  if (!el) return;

  el.textContent = message;
  el.classList.remove("status--hidden", "status--info", "status--error");
  el.classList.add(type === "error" ? "status--error" : "status--info");

  if (!message) {
    el.classList.add("status--hidden");
  }
}

function parseFirebaseConfig() {
  const configNode = document.getElementById("firebase-config");
  if (!configNode) {
    throw new Error("Missing Firebase configuration block (firebase-config)");
  }

  try {
    const parsed = JSON.parse(configNode.textContent || "{}");
    if (!parsed.projectId) {
      throw new Error("Firebase config must include at least a projectId");
    }
    return parsed;
  } catch (err) {
    throw new Error("Invalid Firebase configuration JSON");
  }
}

function resolveQuotationId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || document.body.dataset.quotationId || null;
}

function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "—";
  const date = value.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function buildAddress(address) {
  if (!address) return "";
  const parts = [address.line1, address.line2, address.city, address.state, address.pincode, address.country].filter(Boolean);
  return parts.join(", ");
}

async function fetchQuotation(db, quotationId) {
  const quotationRef = doc(db, "quotations", quotationId);
  const snapshot = await getDoc(quotationRef);

  if (!snapshot.exists()) {
    throw new Error("Quotation not found. Double-check the ID and access rules.");
  }

  const data = snapshot.data();
  const itemsSnapshot = await getDocs(collection(db, "quotations", quotationId, "items"));
  const items = itemsSnapshot.docs.map((itemSnap) => itemSnap.data());

  const subtotalFromItems = items.reduce((sum, item) => sum + (item.lineSubTotal ?? item.quantity * (item.rateSnapshot || 0)), 0);
  const taxFromItems = items.reduce((sum, item) => sum + (item.lineTax || 0), 0);
  const totalFromItems = subtotalFromItems + taxFromItems;

  const currency = data.currency || "USD";

  return {
    client: {
      name: data.clientSnapshot?.brandName || data.clientSnapshot?.legalName || "Client",
      address: buildAddress(data.clientSnapshot?.billingAddress),
      email: data.clientSnapshot?.email || "",
      phone: data.clientSnapshot?.phone || "",
    },
    quotation: {
      number: data.quoteNumber || data.quoteId || quotationId,
      issueDate: data.issueDate,
      dueDate: data.validUntil,
      preparedBy: data.createdByName || "Sales Team",
      currency,
    },
    contact: {
      phone: data.clientSnapshot?.phone || data.clientSnapshot?.billingAddress?.phone || "",
      email: data.clientSnapshot?.email || "",
      address: buildAddress(data.clientSnapshot?.billingAddress),
    },
    terms: data.terms || "",
    items,
    totals: {
      subtotal: data.subTotal ?? subtotalFromItems,
      tax: data.taxTotal ?? taxFromItems,
      total: data.grandTotal ?? totalFromItems,
    },
  };
}

function renderQuotation(data) {
  const { client, quotation, contact, terms, items, totals } = data;

  document.getElementById("client-name").textContent = client.name;
  document.getElementById("client-address").textContent = client.address;
  document.getElementById("client-email").textContent = client.email;

  document.getElementById("quotation-date").textContent = `Issued: ${formatDate(quotation.issueDate)}`;
  document.getElementById("invoice-number").textContent = quotation.number;
  document.getElementById("due-date").textContent = formatDate(quotation.dueDate);
  document.getElementById("prepared-by").textContent = quotation.preparedBy;

  document.getElementById("contact-phone").textContent = contact.phone || "—";
  document.getElementById("contact-email").textContent = contact.email || "—";
  document.getElementById("contact-address").textContent = contact.address || "—";

  const termsList = document.getElementById("terms-list");
  termsList.innerHTML = "";
  const normalizedTerms = Array.isArray(terms)
    ? terms
    : String(terms)
        .split(/\r?\n/)
        .map((term) => term.trim())
        .filter(Boolean);

  normalizedTerms.forEach((term) => {
    const li = document.createElement("li");
    li.textContent = term;
    termsList.appendChild(li);
  });

  const itemsBody = document.getElementById("items-body");
  itemsBody.innerHTML = "";
  items.forEach((item) => {
    const lineSubtotal = item.lineSubTotal ?? item.quantity * (item.rateSnapshot || 0);
    const amount = item.lineTotal ?? lineSubtotal + (item.lineTax || 0);
    const row = document.createElement("div");
    row.className = "table__row table__row--body";
    row.innerHTML = `
      <div>
        <div>${item.nameSnapshot}</div>
        ${item.descriptionSnapshot ? `<p class="muted">${item.descriptionSnapshot}</p>` : ""}
      </div>
      <div>${item.quantity}</div>
      <div>${formatCurrency(item.rateSnapshot, quotation.currency)}</div>
      <div>${formatCurrency(amount, quotation.currency)}</div>
    `;
    itemsBody.appendChild(row);
  });

  document.getElementById("subtotal").textContent = formatCurrency(totals.subtotal, quotation.currency);
  document.getElementById("tax").textContent = formatCurrency(totals.tax, quotation.currency);
  document.getElementById("total").textContent = formatCurrency(totals.total, quotation.currency);

  downloadedFileName = `${quotation.number}.pdf`;
}

function downloadPDF() {
  const element = document.querySelector(".page");
  const options = {
    filename: downloadedFileName,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
    margin: 10,
  };

  html2pdf().from(element).set(options).save();
}

async function bootstrap() {
  try {
    showStatus("Connecting to Firebase and loading quotation…", "info");
    const config = parseFirebaseConfig();
    const quotationId = resolveQuotationId();
    if (!quotationId) {
      throw new Error("Missing quotation id. Provide it via ?id= or data-quotation-id.");
    }

    const app = initializeApp(config);
    const db = getFirestore(app);
    const quotation = await fetchQuotation(db, quotationId);
    renderQuotation(quotation);
    showStatus("", "info");
  } catch (err) {
    console.error(err);
    showStatus(err.message || "Unable to load quotation data", "error");
  }

  document.getElementById("download-btn").addEventListener("click", downloadPDF);
}

window.addEventListener("DOMContentLoaded", bootstrap);
