# Imagicity Invoicing Cockpit

Industrial-grade billing, quotations, and GST-ready PDF exports for Imagicity. Built with Next.js App Router + TypeScript + Tailwind CSS, Firebase Auth/Firestore/Storage, and server-side Puppeteer.

## Features
- Firebase Email/Password auth with Firestore role gating (no hardcoded UID; only `role: "admin"` users gain access).
- Invoice lifecycle: draft → finalized/open → paid, with voided records maintaining the paper trail and blocking edits on finalized documents.
- Quotation support using the same data model and UI.
- GST-friendly fields (Rule 46): GSTIN, place of supply, HSN/SAC, per-line GST%, narration, and optional GST toggle.
- Firebase Storage-powered branding uploader for logos reused across invoices and PDFs.
- Server-side PDF generation through a Next.js route handler using `puppeteer-core` + `@sparticuz/chromium-min` (Vercel friendly).
- Red, yellow, and white theme without gradients; subtle animations and industrial, audit-focused UI.

## Project structure
- `src/app` – App Router pages (`page.tsx` landing, `/login`, `/dashboard`, API route for PDFs).
- `src/components` – Auth provider, layout, document form/list, and settings widgets.
- `src/lib` – Firebase client setup and document helpers.
- `src/types` – Shared TypeScript types for invoices/quotations.

## Environment variables
Copy `.env.example` to `.env.local` and fill with your Firebase project values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Firebase setup (step-by-step)
1. **Create a Firebase project** in the Firebase console and register a Web app. Copy the config into `.env.local`.
2. **Enable Authentication → Email/Password**. Create the single admin user (e.g., `admin@imagicity.in`).
3. **Create a Firestore database (production mode)** and add a document for the admin user:
   - Collection: `users`
   - Document ID: the admin user's UID
   - Fields: `{ role: "admin", email: "admin@imagicity.in" }`
4. **Optional Firestore security rules** to enforce role-based access on reads/writes:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAdmin() {
         return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
       match /documents/{docId} {
         allow read, write: if isAdmin();
       }
       match /branding/{docId} {
         allow read, write: if isAdmin();
       }
       match /users/{userId} {
         allow read, write: if isAdmin();
       }
     }
   }
   ```
5. **Create Firebase Storage bucket rules** so only authenticated users can upload/download branding assets:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
6. **(Optional) Seed sample data** by creating documents in the `documents` collection with the fields used in `src/types/documents.ts`.

## Local development
```
npm install
npm run dev
```
- Visit `http://localhost:3000` for the landing page and `/login` for the admin portal.
- The dashboard requires successful Firebase auth **and** `role: "admin"` in the Firestore user doc.
- PDFs are produced via `POST /api/documents/pdf` and download automatically from the UI.

## Deployment (Vercel)
1. Create a Vercel project from this repo. Ensure **Node.js runtime** is used (default).
2. Add the Firebase environment variables in Vercel → Project Settings → Environment Variables.
3. Deploy; the App Router API route uses `@sparticuz/chromium-min` + `puppeteer-core`, which works in Vercel serverless functions without additional flags.
4. Configure your production Firebase rules as above and create the admin user; no UID is hardcoded.

## Usage workflow
1. Login as the admin user (Email/Password via Firebase).
2. Create drafts in the “Invoice & quotation builder” (GST toggle available).
3. Finalize to lock edits (status: open), generate PDF from the server route, and share.
4. Mark paid or void as needed; void keeps the audit trail intact.
5. Upload a logo in Branding; it’s stored in Firebase Storage and reused in PDFs.

## Notes
- Theme strictly uses red (#c1121f), yellow (#fcbf49), and white. No gradients or `.ico` files are included.
- Finalized documents cannot be edited in the UI; the Void action preserves history while stopping billing.
