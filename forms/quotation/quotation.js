(function () {
  const sampleQuotation = {
    company: {
      name: 'IMAGICITY',
      address: 'Remote First, India',
      gstin: '20ABCDE1234F1Z5',
      email: 'billing@imagicity.in',
      phone: '+91 90000 00000',
    },
    quoteNumber: 'Q-2026-0007',
    issueDate: '06 Jan 2026',
    validUntil: '20 Jan 2026',
    currency: 'INR',
    clientSnapshot: {
      legalName: 'Arihant Agencies',
      brandName: 'Arihant',
      email: 'accounts@arihant.example',
      phone: '+91 98765 43210',
      billingAddress: {
        line1: 'Near Main Market Road',
        line2: 'Opp. City Tower',
        city: 'Hazaribagh',
        state: 'Jharkhand',
        country: 'India',
        pincode: '825301',
        stateCode: '20',
      },
      gstRegistered: true,
      gstin: '20ABCDE1234F1Z5',
    },
    items: Array.from({ length: 5 }).map((_, i) => ({
      nameSnapshot: `Service Item ${i + 1}`,
      descriptionSnapshot: 'Short description for this service item. This can be longer and will wrap cleanly.',
      unitLabelSnapshot: 'project',
      quantity: 1,
      rateSnapshot: 1200 + i * 50,
      gstRateSnapshot: 18,
      taxIncludedSnapshot: false,
    })),
    discountType: 'Percent',
    discountValue: 10,
    notes: 'Scope is limited to items listed above. Any additional revisions or new deliverables will be billed separately.',
    terms: [
      'Prices are valid until the Valid Until date mentioned.',
      '50% advance to start work, remaining before final delivery.',
      'Timeline starts after advance payment and final content approval.',
      'Taxes will be applied as per GST rules.',
    ],
  };

  const quotation = window.quotationData || sampleQuotation;

  function formatINR(value) {
    const n = Number(value || 0);
    return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  function amountInWordsINR(n) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    function toWords(num) {
      num = Math.floor(num);
      if (num === 0) return 'zero';
      if (num < 20) return ones[num];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
      if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + toWords(num % 100) : '');
      if (num < 100000) return toWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + toWords(num % 1000) : '');
      if (num < 10000000) return toWords(Math.floor(num / 100000)) + ' lakh' + (num % 100000 ? ' ' + toWords(num % 100000) : '');
      return toWords(Math.floor(num / 10000000)) + ' crore' + (num % 10000000 ? ' ' + toWords(num % 10000000) : '');
    }
    const rupees = Math.round(Number(n || 0));
    const words = toWords(rupees);
    return 'Amount in words: ' + words.charAt(0).toUpperCase() + words.slice(1) + ' rupees only.';
  }

  function calcLine(item) {
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

  function calcTotals(q) {
    let subTotal = 0;
    let taxTotal = 0;

    (q.items || []).forEach((it) => {
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

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value ?? '';
  }

  function render() {
    setText('companyName', quotation.company.name);
    setText(
      'companyMeta',
      `${quotation.company.address}\nGSTIN: ${quotation.company.gstin}\n${quotation.company.email} | ${quotation.company.phone}`
    );
    setText('signCompany', quotation.company.name);
    setText('footerContact', `${quotation.company.email} | ${quotation.company.phone}`);

    setText('quoteNumber', quotation.quoteNumber);
    setText('issueDate', quotation.issueDate);
    setText('validUntil', quotation.validUntil);
    setText('currency', quotation.currency);

    setText('clientName', quotation.clientSnapshot.legalName);
    setText('clientBrand', quotation.clientSnapshot.brandName ? quotation.clientSnapshot.brandName : '');

    const a = quotation.clientSnapshot.billingAddress;
    const addr = [a.line1, a.line2 ? a.line2 : null, `${a.city}, ${a.state} ${a.pincode}`, a.country].filter(Boolean).join('\n');
    setText('clientAddress', addr);

    setText('clientEmail', quotation.clientSnapshot.email || 'NA');
    setText('clientPhone', quotation.clientSnapshot.phone || 'NA');

    const gstReg = quotation.clientSnapshot.gstRegistered ? 'GST Registered: Yes' : 'GST Registered: No';
    setText('gstRegisteredPill', gstReg);
    setText('stateCodePill', `State Code: ${a.stateCode}`);

    const gstinText = quotation.clientSnapshot.gstRegistered ? quotation.clientSnapshot.gstin || 'NA' : 'Not Applicable';
    setText('clientGstin', gstinText);

    const totals = calcTotals(quotation);
    setText('subTotal', formatINR(totals.subTotal));
    setText('taxTotal', formatINR(totals.taxTotal));
    setText('grandTotal', formatINR(totals.grandTotal));
    setText('amountWords', amountInWordsINR(totals.grandTotal));

    const discountLine = document.getElementById('discountLine');
    if (quotation.discountType === 'None' || totals.discountAmt <= 0) {
      discountLine.style.display = 'none';
    } else {
      discountLine.style.display = 'flex';
      const label = quotation.discountType === 'Percent' ? `Discount (${quotation.discountValue}%)` : 'Discount (Flat)';
      setText('discountLabel', label);
      setText('discountValue', '-' + formatINR(totals.discountAmt));
    }

    const tbody = document.getElementById('itemsBody');
    tbody.innerHTML = '';

    (quotation.items || []).forEach((it, idx) => {
      const line = calcLine(it);

      const tr = document.createElement('tr');

      const tdSno = document.createElement('td');
      tdSno.className = 'col-sno';
      tdSno.textContent = String(idx + 1);

      const tdDesc = document.createElement('td');
      const name = document.createElement('div');
      name.className = 'itemName';
      name.textContent = it.nameSnapshot;

      const desc = document.createElement('div');
      desc.className = 'itemDesc';
      desc.textContent = it.descriptionSnapshot || '';

      tdDesc.appendChild(name);
      if (it.descriptionSnapshot) tdDesc.appendChild(desc);

      const tdUnit = document.createElement('td');
      tdUnit.className = 'col-unit';
      tdUnit.textContent = it.unitLabelSnapshot;

      const tdQty = document.createElement('td');
      tdQty.className = 'col-qty mono';
      tdQty.textContent = String(it.quantity);

      const tdRate = document.createElement('td');
      tdRate.className = 'col-rate mono';
      tdRate.textContent = formatINR(it.rateSnapshot);

      const tdTax = document.createElement('td');
      tdTax.className = 'col-tax mono';
      tdTax.textContent = `${Number(it.gstRateSnapshot || 0)}%`;

      const tdAmt = document.createElement('td');
      tdAmt.className = 'col-amt mono';
      tdAmt.textContent = formatINR(line.lineTotal);

      tr.appendChild(tdSno);
      tr.appendChild(tdDesc);
      tr.appendChild(tdUnit);
      tr.appendChild(tdQty);
      tr.appendChild(tdRate);
      tr.appendChild(tdTax);
      tr.appendChild(tdAmt);

      tbody.appendChild(tr);
    });

    setText('notes', quotation.notes || 'NA');

    const termsEl = document.getElementById('terms');
    termsEl.innerHTML = '';
    (quotation.terms || []).forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      termsEl.appendChild(li);
    });
  }

  render();
})();
