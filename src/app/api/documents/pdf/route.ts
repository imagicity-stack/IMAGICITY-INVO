import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { DocumentRecord } from "@/types/documents";

export const runtime = "nodejs";

function renderHtml(record: DocumentRecord) {
  const rows = record.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.description}</td>
          <td>${item.hsnSac ?? "-"}</td>
          <td>${item.quantity}</td>
          <td>${item.rate.toFixed(2)}</td>
          <td>${item.gstRate ?? record.gst.taxRate ?? 0}%</td>
          <td>${(item.quantity * item.rate).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const totals = record.gst.enabled
    ? record.items.reduce((sum, item) => sum + (item.quantity * item.rate * (item.gstRate ?? record.gst.taxRate ?? 0)) / 100, 0)
    : 0;

  const subtotal = record.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const grand = subtotal + totals;

  return `
    <html>
      <head>
        <style>
          body { font-family: "Inter", Arial, sans-serif; padding: 32px; background: #fff7f5; color: #1f1b1b; }
          h1 { color: #c1121f; margin: 0 0 4px 0; }
          h2 { margin: 4px 0 12px 0; color: #7a0b13; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #f0c341; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #fcbf49; color: #1f1b1b; text-transform: uppercase; letter-spacing: 0.08em; }
          td { background: #ffffff; }
          .badge { padding: 6px 12px; border-radius: 12px; background: #fcbf49; color: #1f1b1b; font-weight: 700; display: inline-block; }
          .section { background: #fff; border: 1px solid #f6d365; border-radius: 12px; padding: 12px; margin-top: 12px; }
          .totals { text-align: right; font-size: 14px; font-weight: 700; }
          .footer { margin-top: 18px; font-size: 11px; color: #4a4036; }
        </style>
      </head>
      <body>
        <div style="display:flex; justify-content: space-between; align-items: center;">
          <div>
            <h1>${record.title}</h1>
            <div class="badge">${record.kind.toUpperCase()} · ${record.status.toUpperCase()}</div>
            <h2>${record.documentNumber}</h2>
            <p>Issue: ${record.issueDate} | Due: ${record.dueDate}</p>
          </div>
          ${record.brandLogoUrl ? `<img src="${record.brandLogoUrl}" style="height:72px; object-fit: contain;" />` : ""}
        </div>

        <div class="section">
          <strong>Issued by</strong><br/>
          ${record.issuer.name}<br/>
          ${record.issuer.address}<br/>
          GSTIN: ${record.issuer.gstin ?? "NA"} · State: ${record.issuer.state ?? ""}
        </div>
        <div class="section">
          <strong>Billed to</strong><br/>
          ${record.client.name}<br/>
          ${record.client.address}<br/>
          GSTIN: ${record.client.gstin ?? "NA"} · State: ${record.client.state ?? ""}
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>HSN/SAC</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>GST%</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="section">
          <div class="totals">Subtotal: ${subtotal.toFixed(2)}</div>
          <div class="totals">GST: ${totals.toFixed(2)} (Place of supply: ${record.gst.placeOfSupply ?? ""})</div>
          <div class="totals">Grand total: ${grand.toFixed(2)} ${record.currency}</div>
        </div>

        <div class="section footer">
          <div><strong>Rule 46 compliance</strong></div>
          <div>HSN/SAC captured per line. GSTIN + place of supply included. Tax computed per line with overall summary.</div>
          <div>${record.gst.narration ?? "Payment subject to agreed terms."}</div>
          <div>Status trail: Finalized at ${record.finalizedAt ?? "-"}, Paid at ${record.paidAt ?? "-"}, Voided at ${record.voidedAt ?? "-"}</div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as DocumentRecord;

  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.setContent(renderHtml(payload), { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${payload.documentNumber}.pdf"`,
    },
  });
}
