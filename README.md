# IMVO — Imagicity billing workspace

A responsive, India-ready invoicing and quotation experience for the Imagicity marketing agency. The app provides GST-aware invoice creation, quotation drafting, PDF exports, and a Firebase-ready data model.

## Features
- **Invoices & quotations:** Capture GSTIN, place of supply, HSN/SAC, tax rate, and payment notes.
- **Indian GST defaults:** Interstate toggle (IGST vs CGST/SGST), SAC suggestions for marketing (99836/99837), and checklist reminders.
- **PDF generation:** Exports for invoices, quotations, and a dashboard print view via jsPDF + browser print.
- **Firebase ready:** Pre-wired configuration placeholders and a stubbed save helper to persist clients, invoices, and proposals.
- **Responsive UI:** Red, yellow, and black Imagicity theme with mobile-friendly layouts.

## Running locally
This is a static, client-side app. No build step is required.

```bash
# serve locally (use any static server)
npm install --global serve
serve .

# or open index.html directly in a browser
```

## Using the app
1. Fill invoice metadata (number, dates, GSTIN, place of supply, interstate toggle, notes).
2. Add line items with HSN/SAC and tax rate; taxable value is auto-calculated from qty × rate unless overridden.
3. Download PDFs via **Download invoice PDF** or **Download quotation PDF**. Use **Export dashboard PDF** to print the full page.
4. Click a saved client to prefill invoice and quotation fields.

## Firebase setup guide
The app includes `firebaseConfig` placeholders and a `saveDraftToFirebase` helper in `script.js`. Replace the placeholders with your project values and call the helper after form submission to persist data.

### 1) Create a project
- In the [Firebase console](https://console.firebase.google.com), create a new project named **imvo-imagicity** (or similar).
- Disable Google Analytics if not required for billing; you can enable later for remarketing insights.

### 2) Enable products
- **Authentication** (optional, but recommended): email/password or Google sign-in for agency teammates.
- **Cloud Firestore:** start in production mode and choose a regional location close to your clients (e.g., asia-south1).
- **Firebase Hosting:** if you want one-click deploys for the static site.

### 3) Add a web app
1. In Project Settings → "Your apps" → **Web**, register an app named `imvo-web`.
2. Copy the configuration snippet and replace the values in `firebaseConfig` inside `script.js`.
3. Install the SDK in the project folder:
   ```bash
   npm install firebase
   ```
4. In `script.js`, import and initialize Firestore (replace the stubbed section):
   ```js
   import { initializeApp } from "firebase/app";
   import { getFirestore, collection, addDoc } from "firebase/firestore";

   const app = initializeApp(firebaseConfig);
   const db = getFirestore(app);

   async function saveDraftToFirebase(collectionName, payload) {
     await addDoc(collection(db, collectionName), payload);
   }
   ```

### 4) Suggested Firestore schema
- **clients**: `{ name, gstin, city, contactEmail, contactPhone, createdAt }`
- **invoices**: `{ invoiceNumber, issueDate, dueDate, clientId, placeOfSupply, interstate, items: [{ description, qty, rate, hsn, taxRate, taxable }], notes, total, status }`
- **quotations**: `{ quoteNumber, validUntil, clientId, summary, items, taxRate, status }`

Include server timestamps (`serverTimestamp()`) for `createdAt/updatedAt`. Indexes are typically not needed initially, but you can add compound indexes for `clientId` + `status` if queries grow.

### 5) Security rules (starter)
Tighten access so only authenticated users can read/write:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
Add field validation and role-based checks as your team grows (e.g., restrict deletes to admins).

### 6) Hosting deployment (optional)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # select project, set public dir to .
firebase deploy --only hosting
```

## PDF + GST notes
- PDF generation uses [jsPDF](https://github.com/parallax/jsPDF) and `autoTable` for neat tables.
- Tax split logic: interstate → IGST; intrastate → half CGST + half SGST, both at the chosen rate.
- HSN/SAC fields are surfaced on both invoice and quotation forms for compliance.
- Use whole-number sequences (IMV-2024-001) and store them in Firestore to avoid duplicates.

## Accessibility & responsiveness
- Keyboard-friendly buttons, large tap targets, and stacked layouts for mobile.
- High-contrast red/yellow/black palette aligned with the Imagicity brand.

---
Built with ❤️ for Imagicity. For updates or automation (reminders, payment links), connect Firebase Cloud Functions to Razorpay/UPI gateways.
