import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { collection, doc, getDoc, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const defaultOrg = {
  address: "Hazaribagh, Jharkhand",
  email: "connect@imagicity.in",
  phone: "9122289578",
  website: "www.imagicity.in",
  tagline: "Smart Experiences, Thoughtful Solutions",
};

let downloadedFileName = "quotation.pdf";
let quotationLoaded = false;

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

  const subtotalFromItems = items.reduce(
    (sum, item) => sum + (item.lineSubTotal ?? (item.quantity || 0) * (item.rateSnapshot || 0)),
    0
  );
  const gstFromItems = items.reduce((sum, item) => sum + (item.lineTax || item.tax || 0), 0);
  const discountFromItems = items.reduce((sum, item) => sum + (item.discountSnapshot || item.discountAmount || 0), 0);

  const currency = data.currency || "USD";
  const discount = data.discountTotal ?? data.discountValue ?? data.discount ?? discountFromItems;
  const subtotal = data.subTotal ?? subtotalFromItems;
  const gst = data.gstTotal ?? data.taxTotal ?? gstFromItems;
  const total = data.grandTotal ?? data.total ?? subtotal - discount + gst;

  return {
    org: {
      ...defaultOrg,
    },
    client: {
      name: data.clientSnapshot?.brandName || data.clientSnapshot?.legalName || "Client",
      address: buildAddress(data.clientSnapshot?.billingAddress),
      email: data.clientSnapshot?.email || "",
      phone: data.clientSnapshot?.phone || data.clientSnapshot?.billingAddress?.phone || "",
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
    notes: data.notes || data.note || "Thank you for considering Imagicity.",
    items,
    totals: {
      subtotal,
      discount,
      gst,
      total,
    },
  };
}

function renderList(listEl, value) {
  listEl.innerHTML = "";
  const normalized = Array.isArray(value)
    ? value
    : String(value)
        .split(/\r?\n/)
        .map((term) => term.trim())
        .filter(Boolean);

  normalized.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    listEl.appendChild(li);
  });
}

function renderQuotation(data) {
  const { org, client, quotation, contact, terms, notes, items, totals } = data;

  document.getElementById("org-tagline").textContent = org.tagline;
  document.getElementById("org-address").textContent = org.address;
  document.getElementById("org-email").textContent = org.email;
  document.getElementById("org-phone").textContent = `+91 ${org.phone}`;
  document.getElementById("org-website").textContent = org.website;

  document.getElementById("client-name").textContent = client.name;
  document.getElementById("client-address").textContent = client.address || "—";
  document.getElementById("client-email").textContent = client.email || "—";
  document.getElementById("client-phone").textContent = client.phone || "—";

  document.getElementById("quotation-date").textContent = formatDate(quotation.issueDate);
  document.getElementById("invoice-number").textContent = quotation.number;
  document.getElementById("due-date").textContent = formatDate(quotation.dueDate);
  document.getElementById("prepared-by").textContent = quotation.preparedBy;

  document.getElementById("contact-phone").textContent = contact.phone || "—";
  document.getElementById("contact-email").textContent = contact.email || "—";
  document.getElementById("contact-address").textContent = contact.address || "—";

  document.getElementById("notes-preview").textContent = Array.isArray(notes)
    ? notes[0] || ""
    : String(notes).split(/\r?\n/)[0] || "";

  renderList(document.getElementById("terms-list"), terms || "");
  renderList(document.getElementById("notes-list"), notes || "");

  const itemsBody = document.getElementById("items-body");
  itemsBody.innerHTML = "";
  items.forEach((item) => {
    const lineSubtotal = item.lineSubTotal ?? (item.quantity || 0) * (item.rateSnapshot || 0);
    const discountValue = item.discountSnapshot || item.discountAmount || 0;
    const gstValue = item.lineTax || item.tax || 0;
    const amount = item.lineTotal ?? lineSubtotal - discountValue + gstValue;

    const row = document.createElement("div");
    row.className = "table__row table__row--body";
    row.innerHTML = `
      <div>
        <h4>${item.nameSnapshot}</h4>
        ${item.descriptionSnapshot ? `<p class="muted">${item.descriptionSnapshot}</p>` : ""}
      </div>
      <div>${item.quantity}</div>
      <div>${formatCurrency(item.rateSnapshot, quotation.currency)}</div>
      <div>${discountValue ? formatCurrency(discountValue, quotation.currency) : "—"}</div>
      <div>${gstValue ? formatCurrency(gstValue, quotation.currency) : "—"}</div>
      <div>${formatCurrency(amount, quotation.currency)}</div>
    `;
    itemsBody.appendChild(row);
  });

  document.getElementById("subtotal").textContent = formatCurrency(totals.subtotal, quotation.currency);
  document.getElementById("discount").textContent = formatCurrency(totals.discount, quotation.currency);
  document.getElementById("gst").textContent = formatCurrency(totals.gst, quotation.currency);
  document.getElementById("total").textContent = formatCurrency(totals.total, quotation.currency);

  downloadedFileName = `${quotation.number}.pdf`;
  quotationLoaded = true;

  const downloadBtn = document.getElementById("download-btn");
  if (downloadBtn) {
    downloadBtn.disabled = false;
    downloadBtn.textContent = "Download PDF";
  }
}

function downloadPDF() {
  if (!quotationLoaded) {
    showStatus("Please wait for the quotation data to finish loading before downloading.", "error");
    return;
  }

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
  const downloadBtn = document.getElementById("download-btn");
  if (downloadBtn) {
    downloadBtn.disabled = true;
    downloadBtn.textContent = "Preparing PDF…";
  }

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
    if (downloadBtn) {
      downloadBtn.textContent = "Load failed";
    }
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadPDF);
  }
}

window.addEventListener("DOMContentLoaded", bootstrap);
