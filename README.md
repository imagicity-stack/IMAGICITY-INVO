# Imagicity Invoicing Suite

Industrial-grade invoicing and quotation app for Imagicity (marketing agency). Built with Next.js App Router, TypeScript, Tailwind, Firebase Auth/Firestore/Storage, and GST-ready workflows.

## Tech stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Firebase Auth (email/password), Firestore, and Storage
- Role gating driven by Firestore user documents
- Invoice lifecycle: **draft → final → paid → void** with immutable finals and void audit trail
- GST (Rule 46) ready: GSTIN, place of supply, HSN/SAC, tax splits, optional GST toggles
- Red, yellow, white theme with motion/hover states

## Local development
1. Ensure Node 18+.
2. Install dependencies (proxy-aware if needed): `npm install`
3. Start dev server: `npm run dev`
4. Lint: `npm run lint`

## Environment variables (`.env.local`)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Firebase setup (step-by-step)
1. **Create project**: In Firebase console create project "Imagicity Invo" and enable Google Analytics if desired.
2. **Add web app**: Register a web app, copy config values into `.env.local` as shown above.
3. **Authentication**:
   - Enable **Email/Password** sign-in.
   - Create the single admin user (`admin@yourdomain`) via the Auth Users tab.
4. **Firestore**:
   - Create database in production mode (or test) with a regional location close to India.
   - Seed a `users` collection: add document with ID = admin UID and fields `{ role: "admin", active: true, displayName: "Admin" }`.
   - Rules (restrict dashboard to active admins):
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{uid} {
           allow read, write: if request.auth != null && request.auth.uid == uid;
         }
         match /{col}/{id} {
           allow read, write: if
             request.auth != null &&
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.active == true &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
         }
       }
     }
     ```
   - Collections used: `users`, `invoices`, `quotations`.
5. **Storage**:
   - Create default bucket. Optional rule to restrict uploads to admins:
     ```
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /{allPaths=**} {
           allow read, write: if
             request.auth != null &&
             exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
             get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == "admin" &&
             get(/databases/(default)/documents/users/$(request.auth.uid)).data.active == true;
         }
       }
     }
     ```
6. **Quotas and security**: Enable audit logs, set up email alerts for sign-in anomalies, and enforce HTTPS only.

## GST (Rule 46) support
- Line items support HSN/SAC, GST rate, and GSTIN capture.
- Place of supply and due date fields included.
- GST can be toggled per form (quotation disables by default; invoices enable by default).
- Void action keeps a paper trail with reasons.

## Role gating
- Dashboard routes are wrapped with `RequireAuth`, allowing only Firestore users with `role: "admin"` and `active: true`.
- Non-admin or inactive users are redirected to login and signed out.

## Invoice lifecycle
- Draft: editable, can be voided.
- Finalized: locked; only transitions to paid or void.
- Paid: only void allowed (keeps timestamps).
- Void: retains audit log and reason.

## Screens
- Landing page (`/`): Imagicity-branded overview.
- Login (`/login`): Firebase email/password entry.
- Dashboard (`/dashboard`): Metrics and recent invoices.
- Invoices (`/invoices`): Draft creation, GST totals, lifecycle board.
- Quotations (`/quotes`): Quote drafts and board, GST optional.
- Clients (`/clients`): CRM snapshot.
- Settings (`/settings`): GST and role-gating notes.

## Notes
- No `.ico` assets are created or referenced; SVG icon lives at `src/app/icon.svg`.
- Animations are Tailwind-powered (hover lifts, fade-in, shadows) without gradients beyond the theme overlays.
