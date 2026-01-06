import { Timestamp } from 'firebase/firestore';
import { Quotation, QuotationItem } from './quotationTypes';

function formatDate(value: Timestamp | Date | string | null | undefined) {
  if (!value) return '';
  const parsed = (value as any)?.toDate ? (value as any).toDate() : new Date(value as any);
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(value: number, currency?: string) {
  const safeCurrency = currency && currency.length === 3 ? currency : 'INR';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch (error) {
    return `${safeCurrency} ${Number(value || 0).toFixed(2)}`;
  }
}

function amountInWordsINR(n: number) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function toWords(num: number): string {
    const whole = Math.floor(num);
    if (whole === 0) return 'zero';
    if (whole < 20) return ones[whole];
    if (whole < 100) return `${tens[Math.floor(whole / 10)]}${whole % 10 ? ` ${ones[whole % 10]}` : ''}`;
    if (whole < 1000) return `${ones[Math.floor(whole / 100)]} hundred${whole % 100 ? ` ${toWords(whole % 100)}` : ''}`;
    if (whole < 100000) return `${toWords(Math.floor(whole / 1000))} thousand${whole % 1000 ? ` ${toWords(whole % 1000)}` : ''}`;
    if (whole < 10000000) return `${toWords(Math.floor(whole / 100000))} lakh${whole % 100000 ? ` ${toWords(whole % 100000)}` : ''}`;
    return `${toWords(Math.floor(whole / 10000000))} crore${whole % 10000000 ? ` ${toWords(whole % 10000000)}` : ''}`;
  }

  const rupees = Math.round(Number(n || 0));
  const words = toWords(rupees);
  const sentence = `${words.charAt(0).toUpperCase()}${words.slice(1)} rupees only.`;
  return `Amount in words: ${sentence}`;
}

function calcLine(item: QuotationItem) {
  const qty = Number(item.quantity || 0);
  const rate = Number(item.rateSnapshot || 0);
  const gst = Number(item.gstRateSnapshot || 0);
  const base = qty * rate;

  if (item.taxIncludedSnapshot) {
    const divisor = 1 + gst / 100;
    const sub = base / divisor;
    const tax = base - sub;
    return { lineSubTotal: sub, lineTax: tax, lineTotal: base };
  }

  const tax = base * (gst / 100);
  return { lineSubTotal: base, lineTax: tax, lineTotal: base + tax };
}

function calcTotals(q: Quotation, items: QuotationItem[]) {
  let subTotal = 0;
  let taxTotal = 0;

  items.forEach((it) => {
    const line = calcLine(it);
    subTotal += line.lineSubTotal;
    taxTotal += line.lineTax;
  });

  let discountAmt = 0;
  if (q.discountType === 'Percent') discountAmt = (subTotal * Number(q.discountValue || 0)) / 100;
  else if (q.discountType === 'Flat') discountAmt = Number(q.discountValue || 0);

  const subAfterDiscount = Math.max(0, subTotal - discountAmt);
  const taxRatio = subTotal > 0 ? taxTotal / subTotal : 0;
  const taxAfterDiscount = subAfterDiscount * taxRatio;
  const grand = subAfterDiscount + taxAfterDiscount;

  return { subTotal, taxTotal: taxAfterDiscount, grandTotal: grand, discountAmt };
}

const quotationStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
:root{
  --bg: #0b0f17;
  --panel: rgba(255,255,255,0.06);
  --panel2: rgba(255,255,255,0.08);
  --text: rgba(255,255,255,0.92);
  --muted: rgba(255,255,255,0.65);
  --line: rgba(255,255,255,0.12);
  --paper: #ffffff;
  --paperText: #0f172a;
  --paperMuted: #475569;
  --accent: #8c191b;
  --shadow: 0 20px 60px rgba(0,0,0,0.45);
}
*{ box-sizing: border-box; }
body, .quoteApp { margin: 0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
.quoteApp{ min-height: 100%; display:flex; flex-direction:column; background: var(--bg); color: var(--text); }
.stage{ padding: 10px 0 20px; display:flex; justify-content:center; }
.paperWrap{ width: min(980px, 100%); display:flex; justify-content:center; }
.paper{ width: 210mm; min-height: 297mm; background: var(--paper); color: var(--paperText); box-shadow: var(--shadow); border-radius: 14px; overflow: hidden; position: relative; }
.paperInner{ padding: 18mm 16mm 16mm; }
@page{ size: A4; margin: 10mm; }
.avoid-break{ break-inside: avoid; page-break-inside: avoid; }
.paperHeader{ display:flex; justify-content:space-between; gap: 18px; align-items:flex-start; }
.logoBox{ display:flex; gap:14px; align-items:center; }
.logoGlyph{ width: 46px; height: 46px; border-radius: 12px; background: linear-gradient(135deg, var(--accent), #c81e1e); display:grid; place-items:center; }
.logoGlyphInner{ width:22px; height:22px; border-radius: 8px; background: rgba(255,255,255,0.85); display:block; }
.companyName{ font-weight: 800; letter-spacing: 0.4px; font-size: 16px; }
.companyMeta{ font-size: 12px; color: var(--paperMuted); margin-top: 4px; line-height: 1.35; white-space: pre-line; }
.docMeta{ text-align:right; min-width: 270px; }
.docTitle{ font-size: 20px; font-weight: 800; letter-spacing: 1px; }
.metaGrid{ margin-top: 10px; display:grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; }
.metaItem{ background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 10px; border-radius: 10px; }
.metaLabel{ font-size: 11px; color: var(--paperMuted); }
.metaValue{ font-size: 13px; font-weight: 700; margin-top: 4px; }
.divider{ height:1px; background:#e2e8f0; margin: 12px 0; }
.divider.soft{ margin: 12px 0; background: #e5e7eb; }
.card{ border: 1px solid #e2e8f0; background: #ffffff; border-radius: 14px; padding: 14px 14px 12px; }
.card-accent{ background: linear-gradient(180deg, #fff6f7, #ffffff); border-color: rgba(140,25,27,0.18); }
.cardTitle{ font-size: 12px; font-weight: 800; letter-spacing: 0.6px; color: #111827; text-transform: uppercase; }
.clientBlock{ margin-top: 6px; }
.clientName{ font-size: 16px; font-weight: 800; margin-top: 8px; }
.muted{ color: var(--paperMuted); font-size: 12px; }
.addr{ margin-top: 10px; color: #0f172a; font-size: 12px; line-height: 1.45; white-space: pre-line; }
.pillRow{ display:flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.pill{ font-size: 11px; border-radius: 999px; padding: 6px 10px; background: rgba(140,25,27,0.10); color: #7f1d1d; border: 1px solid rgba(140,25,27,0.20); font-weight: 700; }
.pill-soft{ background: #f1f5f9; color: #0f172a; border-color: #e2e8f0; }
.kvRow{ margin-top: 12px; display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.kv{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; }
.kvLabel{ font-size: 11px; color: var(--paperMuted); }
.kvValue{ margin-top: 4px; font-size: 12px; font-weight: 700; }
.tableWrap{ margin-top: 16px; }
.itemsTable{ width:100%; border-collapse: collapse; border: 1px solid #e2e8f0; }
.itemsTable th{ text-align:left; background: #f8fafc; font-size: 11px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.4px; padding: 10px 10px; border-bottom: 1px solid #e2e8f0; }
.itemsTable td{ padding: 10px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
.itemsTable tr:nth-child(even) td{ background: #f8fafc; }
.col-sno{ width: 36px; text-align:center; color: #475569; }
.col-unit{ width: 80px; text-align:center; color: #475569; }
.col-qty{ width: 70px; text-align:center; }
.col-rate, .col-tax, .col-amt{ width: 90px; text-align:right; }
.mono{ font-variant-numeric: tabular-nums; font-family: 'Inter', 'SFMono-Regular', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
.summaryRow{ display:grid; grid-template-columns: 1fr 260px; gap: 16px; margin-top: 14px; }
.sumLine{ display:flex; justify-content:space-between; align-items:center; margin-top: 6px; font-size: 13px; }
.grand{ margin-top: 12px; display:flex; justify-content:space-between; align-items:center; padding: 10px 12px; background: #111827; color: #fff; border-radius: 10px; }
.grandLabel{ letter-spacing: 0.6px; text-transform: uppercase; font-size: 12px; }
.grandValue{ font-size: 18px; font-weight: 800; }
.amountWords{ margin-top: 10px; font-size: 12px; color: #7f1d1d; font-weight: 700; }
.noteCard{ border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background: #f8fafc; min-height: 120px; }
.noteTitle{ font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; }
.noteText{ margin-top: 8px; font-size: 12px; color: #0f172a; white-space: pre-line; }
.termsList{ margin: 8px 0 0 16px; padding: 0; color: #0f172a; font-size: 12px; }
.termsList li{ margin-bottom: 6px; }
.notesGrid{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
.paperFooter{ margin-top: 18px; display:flex; justify-content:space-between; align-items:flex-end; gap: 20px; }
.signBlock{ text-align:center; }
.signLine{ border-bottom: 1px solid #111827; margin: 40px 0 8px; }
.signFor{ font-size: 12px; color: #111827; }
.signMeta{ font-size: 11px; color: var(--paperMuted); }
.footerMeta{ text-align:right; font-size: 11px; color: var(--paperMuted); }
.footerBar{ height: 8px; background: linear-gradient(90deg, #8c191b, #c81e1e); border-radius: 0 0 10px 10px; }
`;

function sanitizeTerms(terms?: string) {
  if (!terms) return [] as string[];
  return terms
    .split(/\n|•|-|\u2022/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function buildQuotationPdfMarkup(quotation: Quotation, items: QuotationItem[]) {
  const company = {
    name: 'IMAGICITY',
    address: 'Remote First, India',
    gstin: '20ABCDE1234F1Z5',
    email: 'billing@imagicity.in',
    phone: '+91 90000 00000',
  };

  const totals = calcTotals(quotation, items);
  const address = quotation.clientSnapshot?.billingAddress;
  const addressText = [
    address?.line1,
    address?.line2,
    `${address?.city || ''}${address?.city ? ',' : ''} ${address?.state || ''} ${address?.pincode || ''}`.trim(),
    address?.country,
  ]
    .filter(Boolean)
    .join('\n');

  const itemRows = items
    .map((it, idx) => {
      const line = calcLine(it);
      return `
        <tr>
          <td class="col-sno">${idx + 1}</td>
          <td>
            <div class="itemName">${it.nameSnapshot}</div>
            ${it.descriptionSnapshot ? `<div class="itemDesc muted">${it.descriptionSnapshot}</div>` : ''}
          </td>
          <td class="col-unit">${it.unitLabelSnapshot}</td>
          <td class="col-qty mono">${it.quantity}</td>
          <td class="col-rate mono">${formatCurrency(it.rateSnapshot, quotation.currency)}</td>
          <td class="col-tax mono">${Number(it.gstRateSnapshot || 0)}%</td>
          <td class="col-amt mono">${formatCurrency(line.lineTotal, quotation.currency)}</td>
        </tr>`;
    })
    .join('');

  const termList = sanitizeTerms(quotation.terms);
  const discountLabel =
    quotation.discountType === 'Percent'
      ? `Discount (${quotation.discountValue}%)`
      : quotation.discountType === 'Flat'
        ? 'Discount (Flat)'
        : '';

  return `
    <div class="quoteApp">
      <style>${quotationStyles}</style>
      <main class="stage">
        <section class="paperWrap">
          <div class="paper" id="quoteRoot">
            <div class="paperInner">
              <div class="paperHeader avoid-break">
                <div class="company">
                  <div class="logoBox">
                    <div class="logoGlyph">
                      <span class="logoGlyphInner"></span>
                    </div>
                    <div class="companyText">
                      <div class="companyName">${company.name}</div>
                      <div class="companyMeta">${company.address}\nGSTIN: ${company.gstin}\n${company.email} | ${company.phone}</div>
                    </div>
                  </div>
                </div>
                <div class="docMeta">
                  <div class="docTitle">QUOTATION</div>
                  <div class="metaGrid">
                    <div class="metaItem">
                      <div class="metaLabel">Quotation No.</div>
                      <div class="metaValue mono">${quotation.quoteNumber}</div>
                    </div>
                    <div class="metaItem">
                      <div class="metaLabel">Issue Date</div>
                      <div class="metaValue">${formatDate(quotation.issueDate)}</div>
                    </div>
                    <div class="metaItem">
                      <div class="metaLabel">Valid Until</div>
                      <div class="metaValue">${formatDate(quotation.validUntil)}</div>
                    </div>
                    <div class="metaItem">
                      <div class="metaLabel">Currency</div>
                      <div class="metaValue">${quotation.currency}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <div class="clientBlock avoid-break">
                <div class="card">
                  <div class="cardTitle">Bill To</div>
                  <div class="clientName">${quotation.clientSnapshot?.legalName || ''}</div>
                  <div class="muted">${quotation.clientSnapshot?.brandName || ''}</div>
                  <div class="addr">${addressText}</div>
                  <div class="pillRow">
                    <span class="pill">${quotation.clientSnapshot?.gstRegistered ? 'GST Registered: Yes' : 'GST Registered: No'}</span>
                    ${address?.stateCode ? `<span class="pill pill-soft">State Code: ${address.stateCode}</span>` : ''}
                  </div>
                  <div class="kvRow">
                    <div class="kv">
                      <div class="kvLabel">Email</div>
                      <div class="kvValue">${quotation.clientSnapshot?.email || 'NA'}</div>
                    </div>
                    <div class="kv">
                      <div class="kvLabel">Phone</div>
                      <div class="kvValue">${quotation.clientSnapshot?.phone || 'NA'}</div>
                    </div>
                  </div>
                  <div class="kvRow">
                    <div class="kv">
                      <div class="kvLabel">GSTIN</div>
                      <div class="kvValue mono">${quotation.clientSnapshot?.gstRegistered ? quotation.clientSnapshot.gstin || 'NA' : 'Not Applicable'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="tableWrap">
                <table class="itemsTable">
                  <thead>
                    <tr>
                      <th class="col-sno">#</th>
                      <th>Description</th>
                      <th class="col-unit">Unit</th>
                      <th class="col-qty">Qty</th>
                      <th class="col-rate">Rate</th>
                      <th class="col-tax">GST</th>
                      <th class="col-amt">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemRows || '<tr><td colspan="7" style="text-align:center; padding:12px;">No items added</td></tr>'}
                  </tbody>
                </table>
              </div>

              <div class="summaryRow avoid-break">
                <div></div>
                <div class="card card-accent">
                  <div class="cardTitle">Summary</div>
                  <div class="sumLine">
                    <span class="muted">Subtotal</span>
                    <span class="mono">${formatCurrency(totals.subTotal, quotation.currency)}</span>
                  </div>
                  ${
                    quotation.discountType !== 'None' && totals.discountAmt > 0
                      ? `<div class="sumLine"><span class="muted">${discountLabel}</span><span class="mono">-${formatCurrency(totals.discountAmt, quotation.currency)}</span></div>`
                      : ''
                  }
                  <div class="sumLine">
                    <span class="muted">Tax</span>
                    <span class="mono">${formatCurrency(totals.taxTotal, quotation.currency)}</span>
                  </div>
                  <div class="divider soft"></div>
                  <div class="grand">
                    <div class="grandLabel">Grand Total</div>
                    <div class="grandValue mono">${formatCurrency(totals.grandTotal, quotation.currency)}</div>
                  </div>
                  <div class="amountWords">${amountInWordsINR(totals.grandTotal)}</div>
                </div>
              </div>

              <div class="notesGrid">
                <div class="noteCard avoid-break">
                  <div class="noteTitle">Notes</div>
                  <div class="noteText">${quotation.notes || 'NA'}</div>
                </div>
                <div class="noteCard avoid-break">
                  <div class="noteTitle">Terms</div>
                  ${termList.length
                    ? `<ul class="termsList">${termList.map((term) => `<li>${term}</li>`).join('')}</ul>`
                    : '<div class="noteText">No additional terms</div>'}
                </div>
              </div>

              <div class="paperFooter avoid-break">
                <div class="signBlock">
                  <div class="signFor">For <span>${company.name}</span></div>
                  <div class="signLine"></div>
                  <div class="signMeta">Authorized Signatory</div>
                </div>
                <div class="footerMeta">
                  <div class="footerLine">This is a system generated quotation.</div>
                  <div class="footerLine">${company.email} | ${company.phone}</div>
                </div>
              </div>
            </div>
            <div class="footerBar"></div>
          </div>
        </section>
      </main>
    </div>
  `;
}
