# Imvo — Imagicity revenue office

Red-yellow-black branded Next.js + Tailwind CSS app for Imagicity to generate invoices, quotations, receipts, and PDF outputs that respect Indian GST standards. Data flows through Firebase (Auth, Firestore, Storage) with room for Cloud Functions that enforce numbering, IRN calls, or email dispatch.

## Getting started

### Prerequisites
- Node 18+ and npm
- Firebase project with billing-enabled Blaze tier for production PDF storage/Functions
- Optional: `firebase-tools` CLI for emulators and deploys

### Install dependencies
```bash
npm install
```

### Run the dev server
```bash
npm run dev
```
Then open http://localhost:3000.

## Firebase setup guide
Follow these steps in your Firebase console/CLI. Environment variables should be stored in `.env.local` (never commit secrets).

1. **Create a project**: New Firebase project named `imvo` (or reuse an existing Imagicity org project).
2. **Enable Authentication**:
   - Go to *Build → Authentication* and turn on Email/Password and, optionally, Google OAuth.
   - In Firestore security rules, plan to check custom claims `role` in tokens for `owner`, `finance`, or `sales`.
3. **Firestore database**:
   - Create Firestore in production mode.
   - Suggested multi-tenant structure:
     ```
     /accounts/{accountId}
       name, gstin, address, state, logoUrl
       /members/{uid}: role, email
       /clients/{clientId}: name, gstin, state, billingAddress, shippingAddress
       /catalog/{itemId}: description, hsn, sac, unit, gstRate, price
       /quotes/{quoteId}: number, status, validity, placeOfSupply, reverseCharge, currency, lineItems[], totals, pdfUrl
       /invoices/{invoiceId}: number, fiscalYear, status, placeOfSupply, irn, ewayBill, reverseCharge, lineItems[], taxSplit, totals, pdfUrl
       /receipts/{receiptId}: invoiceRef, amount, mode, utr, pdfUrl
     ```
   - Add composite indexes for `status+accountId` and `clientId+status` to power dashboards.
4. **Cloud Storage**:
   - Create bucket (default works) and folder structure `/pdfs/{invoiceId}.pdf` and `/quotes/{quoteId}.pdf`.
   - Enforce signed URL downloads in Cloud Storage rules and block public listing.
5. **Cloud Functions (optional but recommended)**:
   - Node 18 runtime.
   - Functions to: generate sequential invoice numbers per fiscal year, render PDFs (using headless Chromium), and trigger email dispatch via SendGrid/SES.
   - Consider a scheduled function to back up Firestore to Storage daily.
6. **Environment variables (`.env.local`)**:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
7. **Security rules sketch** (adapt before deploy):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isSignedIn() { return request.auth != null; }
       function hasRole(role) { return isSignedIn() && role in request.auth.token.role; }

       match /accounts/{accountId}/{collection}/{docId} {
         allow read, write: if isSignedIn() && request.auth.token.accountId == accountId && (hasRole('owner') || hasRole('finance'));
       }

       match /accounts/{accountId}/quotes/{quoteId} {
         allow create: if isSignedIn() && request.auth.token.accountId == accountId && (hasRole('owner') || hasRole('sales'));
         allow update, read: if isSignedIn() && request.auth.token.accountId == accountId;
       }
     }
   }
   ```
   Pair this with Storage rules that limit reads to signed-in users and writes to Cloud Functions service accounts.

## Design notes
- Tailwind theme uses Imagicity colors: `primary` red (#D81E1E), accent yellow (#F5C400), and deep black (#0F0F0F).
- Sections include GST compliance highlights, workflow cards for invoices/quotes/receipts, and Firebase-first architecture guidance.
- Components are server-rendered for performance; replace static data with Firestore queries when you connect the SDK in `app/firebase.ts`.

## Scripts
- `npm run dev` — start Next.js locally
- `npm run build` — production build
- `npm start` — run the compiled app
- `npm run lint` — lint with ESLint/Next config

## Static assets & hosting
- The `public/` directory ships with a branded `imvo-logo.svg` placeholder so static hosting providers that expect an output folder named `public` can succeed without extra configuration.
- Add favicons, Open Graph images, or PDF templates to `public/` to keep them available at build time.
