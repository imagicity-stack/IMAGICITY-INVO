import { Invoice, InvoiceItem, InvoicePayment } from '../../lib/invoices/invoiceTypes';
import { splitGst } from '../../lib/invoices/math';
import { COMPANY_STATE_CODE } from '../../lib/invoices/invoiceService';

export function renderInvoiceHtml(invoice: Invoice, items: InvoiceItem[], payments: InvoicePayment[] = []) {
  const totals = splitGst(invoice.placeOfSupplyStateCode, COMPANY_STATE_CODE, invoice.taxTotal);
  const paymentHistory = payments
    .map((payment) => `
      <tr>
        <td>${payment.mode}</td>
        <td>${payment.paymentDate.toDate ? payment.paymentDate.toDate().toLocaleDateString() : ''}</td>
        <td style="text-align:right">${payment.amount.toFixed(2)}</td>
      </tr>
    `)
    .join('');

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 24px; color: #1f2937; }
          h1 { margin: 0; font-size: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          .summary { margin-top: 16px; width: 100%; }
          .pill { display: inline-block; background: #eef2ff; padding: 4px 8px; border-radius: 999px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <h1>Invoice ${invoice.invoiceNumber}</h1>
            <p>Issue: ${invoice.issueDate ? (invoice.issueDate as any).toDate?.().toLocaleDateString?.() || '' : ''}</p>
            <p>Due: ${invoice.dueDate ? (invoice.dueDate as any).toDate?.().toLocaleDateString?.() || '' : ''}</p>
            <span class="pill">${invoice.status}</span>
          </div>
          <div>
            <p style="font-weight:600;">${invoice.clientSnapshot.legalName}</p>
            <p style="max-width:260px;">${invoice.clientSnapshot.billingAddress?.line1 || ''}</p>
            <p>Place of supply: ${invoice.placeOfSupplyStateCode}</p>
          </div>
        </div>

        <table style="margin-top:24px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th align="left">Item</th>
              <th align="left">Qty</th>
              <th align="right">Rate</th>
              <th align="right">Tax</th>
              <th align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                  <tr>
                    <td>${item.nameSnapshot}</td>
                    <td>${item.quantity}</td>
                    <td align="right">${item.rateSnapshot.toFixed(2)}</td>
                    <td align="right">${item.lineTax.toFixed(2)}</td>
                    <td align="right">${item.lineTotal.toFixed(2)}</td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>

        <table class="summary">
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td style="text-align:right">${invoice.subTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>IGST</td>
              <td style="text-align:right">${totals.igst.toFixed(2)}</td>
            </tr>
            <tr>
              <td>CGST + SGST</td>
              <td style="text-align:right">${(totals.cgst + totals.sgst).toFixed(2)}</td>
            </tr>
            <tr style="font-weight:700;">
              <td>Grand total</td>
              <td style="text-align:right">${invoice.grandTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Amount paid</td>
              <td style="text-align:right">${invoice.amountPaid.toFixed(2)}</td>
            </tr>
            <tr style="font-weight:700;">
              <td>Balance due</td>
              <td style="text-align:right">${invoice.balanceDue.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        ${payments.length > 0 ? `<h3 style="margin-top:24px;">Payments</h3><table>${paymentHistory}</table>` : ''}

        ${invoice.notes ? `<p style="margin-top:16px;font-size:12px;">Notes: ${invoice.notes}</p>` : ''}
        ${invoice.terms ? `<p style="margin-top:8px;font-size:12px;">Terms: ${invoice.terms}</p>` : ''}
      </body>
    </html>
  `;
}

export default renderInvoiceHtml;
