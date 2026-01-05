# IMAGICITY Invoicing

Single-user, India GST-ready invoicing and quotation console built with Next.js App Router, Firebase Auth/Firestore/Storage, and server-side PDF generation via Puppeteer.

## Features
- Draft → finalized (open) → sent/paid/void/uncollectible lifecycle with audit logging.
- GST (Rule 46) aware documents with seller/client snapshots and place-of-supply controls.
- Atomic numbering per financial year (IMQ / IMI) generated via Firestore transactions.
- Role-gated Firebase Auth (Email/Password) with bootstrap that provisions the first login as admin if no admin exists.
- PDF generation in a Next.js route handler, uploaded to Storage with versioning (never overwriting previous PDFs).
- Payment recording with partial payments, amount due, and overdue highlighting in UI.

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` using the template below. Ensure the service account private key keeps newlines as `\n` sequences.
3. Enable Firebase products: Auth (Email/Password), Firestore, Storage. Add your Vercel domain to authorized domains.
4. Deploy Firestore and Storage security rules from the `firebase/` folder.
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```
5. Run locally:
   ```bash
   npm run dev
   ```
6. On first login, an admin profile is created. Subsequent logins require an existing admin user document.

## Env vars
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

## Deployment notes
- No favicon.ico is generated or referenced to meet compliance requirements.
- Deploy on Vercel with Node.js 18+ and ensure `puppeteer` can run in the serverless environment (Vercel automatically provides Chromium for headless mode).
- Storage PDFs are stored at `pdfs/<type>/<financialYear>/<number>_v<version>.pdf` with signed URL persistence on the document record.
