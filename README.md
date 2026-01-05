# IMVO — Imagicity invoicing & quotation UI

A modern red / yellow / white invoicing, quotation, and services console for Imagicity built with **Next.js** and **Tailwind CSS**. The experience keeps a white canvas with bold red/yellow accents and ships ready for Firebase wiring.

## Run locally
1. Install dependencies (requires Node 18+):
   ```bash
   npm install
   ```
2. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` to explore the dashboard, invoices, quotations, clients, and services sections. Navigation is handled client-side via the sidebar.

## Build & deploy
- Production build: `npm run build`
- Start production server: `npm start`
- Deploy on Vercel as a Next.js app. The `public/` directory already includes the SVG icons referenced across the UI; no `.ico` files are used.

## Firebase setup (manual steps)
Use the environment variables already configured in Vercel for Firebase. These steps assume Firestore, Authentication, and optional Storage.

1. **Create a Firebase project** (or reuse an existing one) and enable **Firestore** in *production mode*.
2. **Create a web app** inside the Firebase console and copy the config values (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId if needed).
3. **Map config to Vercel environment variables**: in your Vercel project, set the following vars to match the Firebase config values (update their values only):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional if Analytics is used)
4. **Initialize Firebase in the front-end**: create a client helper (e.g., `lib/firebase.js`) that uses `initializeApp` from `firebase/app` and exports Firestore helpers with the env vars above. Import that helper inside the form submit handlers in `components/ImvoApp.jsx` (rendered from `pages/[[...slug]].js`) to persist invoices, quotations, services, and analytics snapshots.
5. **Persist forms**: wire the Invoice, Quotation, and Service form submit handlers to `addDoc(collection(db, 'invoices'), data)` and similar collections using the helper.
6. **Deploy** on Vercel. Ensure the environment variables are populated in the project settings. No static export is needed.
7. **Security rules**: configure Firestore rules to protect data, for example allowing read/write only for authenticated users. Enable Firebase Authentication (Email/Password or OAuth) if you need access control.

## Assets
The sidebar uses SVG icons stored in `public/` (`dashboard.svg`, `invoice.svg`, `quotation.svg`, `clients.svg`, `services.svg`, `reminder.svg`). No `.ico` files are generated.

## Notes
- Tailwind powers the modern, creative layout while keeping the background white.
- The UI includes local state for invoices, quotations, services, and clients so you can test interactions before hooking up Firebase.
- The root route now renders through an optional catch-all in the Pages Router (`pages/[[...slug]].js`) so `/` and any unknown paths resolve to IMVO. A `/legacy` alias continues to render the same experience for existing links.

## Clients Module
- **Routes**: `/clients` (list + filters), `/clients/new` (create), `/clients/[id]` (detail), `/clients/[id]/edit` (update). The list page includes a primary “Add Client” button.
- **Firestore**: collection name `clients`. Each document stores `clientId`, `clientType`, `legalName`, `brandName`, `contactPerson`, `email`, `phone`, `status`, `billingAddress` (`line1`, `line2?`, `city`, `state`, `country`, `pincode`, `stateCode`), `gstRegistered`, `gstin?`, `pan?`, `currency`, `paymentTerms`, `preferredPaymentMode`, `creditLimit?`, `taxPreference`, `accountOwner?`, `clientSource`, `industryType?`, `tags?`, `notes?`, `autoSendInvoice`, `autoReminderEnabled`, `reminderFrequencyDays?`, `lateFeeApplicable`, `isArchived`, `createdAt`, `updatedAt`.
- **Archiving**: archive/restore never deletes documents. Archiving sets `isArchived=true` and marks status as `Inactive`. The list hides archived clients by default unless the toggle is enabled.
- **Usage**: the client form validates required fields (legal name, contact person, email, phone, billing address, GSTIN when registered) and disables submission while saving. Detail pages expose quick actions to edit or archive/restore.
- **Local dev**: reuse the existing Firebase client at `lib/firebase.js`; no new environment variables are required. Ensure Firestore rules allow unauthenticated reads/writes for development if auth is disabled.
- **Indexes**: current queries use equality filters only; no additional Firestore composite indexes are required.
- **Troubleshooting**: if saving fails locally, confirm Firestore is enabled for the configured project and that the Firestore rules permit the operations without authentication.
