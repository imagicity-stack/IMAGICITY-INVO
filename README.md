# Imagicity Billing Platform

Industrial-grade invoicing and quotation cockpit for Imagicity (marketing agency) built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Firebase (Auth + Firestore + Storage)**. It enforces admin-only access through Firestore roles, supports Indian GST Rule 46 fields, and offers server-side PDF exports.

## Features
- Email/Password login via Firebase Auth; access is role-gated using Firestore `users/{uid}` docs (no hardcoded UIDs).
- Full document lifecycle: **draft → open/finalized → paid**, with void actions that keep a paper trail.
- Supports invoices and quotations with GST toggles, place of supply capture, SAC/HSN and tax rates per line, and optional reverse-charge flagging.
- Storage-backed brand assets (upload logo) to stamp generated PDFs.
- Server-side PDF generation endpoint `/api/documents/[id]/pdf` that validates the caller's Firebase ID token before exporting.
- Red/yellow/white UI theme with micro animations and responsive layout.
- Ready for Vercel deployment.

## Project structure
- `app/` – App Router pages, including login and API route for PDFs.
- `components/` – UI elements, billing forms, navigation, and providers.
- `lib/` – Firebase client/admin setup, shared types, and calculation helpers.
- `public/` – SVG assets (no `.ico` files included by design).

## Environment variables
Create an `.env.local` file (not committed) with both client and server credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
```
> Note: keep the `\\n` escapes in `FIREBASE_PRIVATE_KEY` for multi-line keys.

## Firebase setup (step-by-step)
1. **Create a Firebase project** named `imagicity-billing` (or any name) and enable **Email/Password** in **Authentication → Sign-in method**.
2. **Create the admin user** under Authentication with the chosen email/password.
3. **Add Firestore** in production mode and create the following documents:
   - `users/{adminUid}` with `{ "role": "admin", "email": "<admin email>" }`.
   - Optionally, `settings/branding` will be written automatically after a logo upload.
4. **Enable Cloud Storage**; note the storage bucket URL for the env variables.
5. **Generate a service account**: go to **Project settings → Service accounts → Firebase Admin SDK → Generate new private key**. Use the `project_id`, `client_email`, and `private_key` values in the server env vars above.
6. **(Optional) Firestore security rules** example aligning with the UI:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /documents/{docId} {
         allow read, write: if request.auth != null && exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
       match /settings/{docId} {
         allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```
7. **Client config**: from **Project settings → General → Your apps**, add a Web app to get the `NEXT_PUBLIC_FIREBASE_*` values.

## Running locally
```bash
npm install
npm run dev
```
The dashboard lives at `http://localhost:3000`. Unauthenticated users are redirected to `/login`.

## Generating PDFs
Call `/api/documents/{id}/pdf` with an `Authorization: Bearer <Firebase ID token>` header from an authenticated admin. The endpoint verifies the token, checks the Firestore role, fetches the document, and streams a PDF that includes GST totals and (if uploaded) the branding URL.

## Deployment on Vercel
1. Push this repository to your Vercel-connected Git provider.
2. In the Vercel project settings, add all environment variables from the **Environment variables** section (both client and server values).
3. Deploy; no extra build steps are required. The App Router + serverless PDF endpoint will work in Vercel's serverless runtime.
4. After deployment, set the **Authentication Authorized domains** in Firebase to include your Vercel domain.

## Operational notes
- Status changes are enforced via UI buttons; finalized documents flip to `open` and should not be edited directly.
- GST toggles are per-document to support clients without GST needs.
- Storage uploads place files at `brand/{uid}/...` and persist the URL in Firestore for reuse in PDFs.

## Testing checklist
- Create an admin user → set Firestore role → sign in at `/login`.
- Draft an invoice → finalize (open) → mark as paid → void to observe the audit trail.
- Toggle GST off/on and verify totals update.
- Upload a logo to Storage and regenerate a PDF with the branding reference.
