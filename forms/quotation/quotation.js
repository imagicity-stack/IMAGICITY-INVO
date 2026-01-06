const quotationData = {
  client: {
    name: "Diarny Karina Tya",
    address: "123 Main Street, Apt. 4B, New York, NY 10001",
    email: "diarny.karina@example.com",
  },
  quotation: {
    number: "QTN-2024-0915",
    date: "Sep 15, 2024",
    dueDate: "Oct 15, 2024",
    preparedBy: "Paulo Roberto",
    taxRate: 0.075,
  },
  contact: {
    phone: "+62 812 6789 1234",
    email: "info@imagicity.com",
    address: "Jakarta, Indonesia",
  },
  terms: [
    "Work is billed within 30 days of completion.",
    "To protect customer privacy, all information is kept confidential.",
    "Quotes are valid for 45 days from the date shown above.",
  ],
  items: [
    { description: "Design mockup & concept", quantity: 1, unitPrice: 250 },
    { description: "Frontend development", quantity: 1, unitPrice: 620 },
    { description: "Content strategy", quantity: 1, unitPrice: 120 },
  ],
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function renderQuotation(data) {
  document.getElementById("client-name").textContent = data.client.name;
  document.getElementById("client-address").textContent = data.client.address;
  document.getElementById("client-email").textContent = data.client.email;

  document.getElementById("quotation-date").textContent = `Issued: ${data.quotation.date}`;
  document.getElementById("invoice-number").textContent = data.quotation.number;
  document.getElementById("due-date").textContent = data.quotation.dueDate;
  document.getElementById("prepared-by").textContent = data.quotation.preparedBy;

  document.getElementById("contact-phone").textContent = data.contact.phone;
  document.getElementById("contact-email").textContent = data.contact.email;
  document.getElementById("contact-address").textContent = data.contact.address;

  const termsList = document.getElementById("terms-list");
  termsList.innerHTML = "";
  data.terms.forEach((term) => {
    const li = document.createElement("li");
    li.textContent = term;
    termsList.appendChild(li);
  });

  const itemsBody = document.getElementById("items-body");
  itemsBody.innerHTML = "";
  let subtotal = 0;

  data.items.forEach((item) => {
    const amount = item.quantity * item.unitPrice;
    subtotal += amount;

    const row = document.createElement("div");
    row.className = "table__row table__row--body";
    row.innerHTML = `
      <div>${item.description}</div>
      <div>${item.quantity}</div>
      <div>${formatCurrency(item.unitPrice)}</div>
      <div>${formatCurrency(amount)}</div>
    `;
    itemsBody.appendChild(row);
  });

  const taxAmount = subtotal * data.quotation.taxRate;
  const total = subtotal + taxAmount;

  document.getElementById("subtotal").textContent = formatCurrency(subtotal);
  document.getElementById("tax").textContent = formatCurrency(taxAmount);
  document.getElementById("total").textContent = formatCurrency(total);
}

function downloadPDF() {
  const element = document.querySelector(".page");
  const options = {
    filename: `${quotationData.quotation.number}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
    margin: 10,
  };

  html2pdf().from(element).set(options).save();
}

window.addEventListener("DOMContentLoaded", () => {
  renderQuotation(quotationData);
  document.getElementById("download-btn").addEventListener("click", downloadPDF);
});
