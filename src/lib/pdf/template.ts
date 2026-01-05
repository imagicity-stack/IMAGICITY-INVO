import { Document } from "../types";
import { formatDate } from "../utils/finance";

export function renderInvoiceHtml(doc: Document) {
  const taxRows = [
    doc.tax.mode === "CGST_SGST" && doc.tax.amounts.cgst
      ? `<p>CGST (${doc.tax.rates.cgst}%): ${doc.tax.amounts.cgst?.toFixed(2)}</p>`
      : "",
    doc.tax.mode === "CGST_SGST" && doc.tax.amounts.sgst
      ? `<p>SGST (${doc.tax.rates.sgst}%): ${doc.tax.amounts.sgst?.toFixed(2)}</p>`
      : "",
    doc.tax.mode === "IGST" && doc.tax.amounts.igst
      ? `<p>IGST (${doc.tax.rates.igst}%): ${doc.tax.amounts.igst?.toFixed(2)}</p>`
      : "",
  ].join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${doc.type} ${doc.number}</title>
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; }
    .tag { background: #eef2ff; color: #4338ca; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.02em; }
    .totals { margin-top: 16px; width: 280px; margin-left: auto; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <p class="tag">${doc.type.toUpperCase()}</p>
      <h1>${doc.sellerSnapshot.brandName || "IMAGICITY"}</h1>
      <p>${doc.sellerSnapshot.legalName}</p>
      ${doc.sellerSnapshot.gstin ? `<p>GSTIN: ${doc.sellerSnapshot.gstin}</p>` : ""}
      <p>${doc.sellerSnapshot.address?.line1 || ""}</p>
    </div>
    <div style="text-align:right">
      <h2>${doc.number || "Draft"}</h2>
      <p>Issue date: ${formatDate(doc.issueDate)}</p>
      ${doc.dueDate ? `<p>Due date: ${formatDate(doc.dueDate)}</p>` : ""}
      ${doc.tax.placeOfSupplyState ? `<p>Place of supply: ${doc.tax.placeOfSupplyState}</p>` : ""}
    </div>
  </div>
  <section style="margin-top:24px; display:flex; gap:24px;">
    <div style="flex:1">
      <h3>Bill to</h3>
      <p>${doc.clientSnapshot.name}</p>
      ${doc.clientSnapshot.gstin ? `<p>GSTIN: ${doc.clientSnapshot.gstin}</p>` : ""}
      <p>${doc.clientSnapshot.billingAddress?.line1 || ""}</p>
    </div>
    <div style="flex:1">
      <h3>Notes</h3>
      <p>${doc.notes || doc.terms || ""}</p>
    </div>
  </section>
  <table>
    <thead>
      <tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
    </thead>
    <tbody>
      ${doc.lineItems
        .map(
          (line, idx) =>
            `<tr><td>${idx + 1}</td><td>${line.title}</td><td>${line.qty}</td><td>${line.rate.toFixed(
              2
            )}</td><td>${(line.qty * line.rate).toFixed(2)}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>
  <div class="totals">
    <p style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>${doc.totals.subTotal.toFixed(2)}</span></p>
    <p style="display:flex;justify-content:space-between;"><span>Discount</span><span>${doc.totals.discountTotal.toFixed(
      2
    )}</span></p>
    ${taxRows}
    <p style="display:flex;justify-content:space-between;font-weight:700;"><span>Grand total</span><span>${doc.totals.grandTotal.toFixed(
      2
    )}</span></p>
    <p style="display:flex;justify-content:space-between;color:#059669;"><span>Paid</span><span>${doc.totals.amountPaid.toFixed(
      2
    )}</span></p>
    <p style="display:flex;justify-content:space-between;color:#b91c1c;"><span>Balance</span><span>${doc.totals.amountDue.toFixed(
      2
    )}</span></p>
  </div>
</body>
</html>`;
}
