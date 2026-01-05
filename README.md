# Imagicity Invoicing Suite

Industrial-grade Next.js + TypeScript + Tailwind CSS workspace for Imagicity Marketing Agency. It supports secure Firebase Authentication, Firestore role-gating, Storage-backed attachments, and GST-friendly invoices/quotations.

## Tech
- Next.js App Router + TypeScript + Tailwind CSS
- Firebase Auth (email/password), Firestore (role and data), Storage (asset uploads)
- Framer Motion + Headless UI + Heroicons

## Run locally
1. Copy `.env.example` to `.env.local` and fill Firebase values (see setup below).
2. Install dependencies with your preferred package manager (npm, pnpm, or yarn).
3. Run `npm run dev` and open `http://localhost:3000`.

## Firebase setup (admin-only login)
Follow these steps from the Firebase console:
1. **Create project**: New Firebase project named `imagicity-invo` (or any name) without Google Analytics.
2. **Register web app**: In *Build ➜ Authentication* click *Get started*, then *Add app ➜ Web* and register. Copy the config to `.env.local` using the keys in `.env.example`.
3. **Enable Email/Password**: In *Authentication ➜ Sign-in method* enable *Email/Password*.
4. **Create admin user**: In *Users* add the single account `admin` (email of your choice) with a strong password.
5. **Firestore database**: Create Firestore in *Production mode*. Add a `users/{uid}` document for the admin user containing:
   ```json
   {
     "email": "<admin-email>",
     "role": "admin",
     "active": true,
     "displayName": "Imagicity Admin"
   }
   ```
6. **Storage bucket**: Enable Cloud Storage. Default rules can be development mode while testing. The UI uploads files to `assets/<uid>/...` and records them in the `assets` collection.
7. **Security rules (starter)**: tighten later; basic starting points:
   - Firestore: allow read/write only if `request.auth != null` and user doc `role == 'admin'` and `active == true`.
   - Storage: allow upload/read if authenticated and matching `request.auth.uid`.
8. **Optional GST defaults**: Add a Firestore document `settings/app` with fields like `defaultPlaceOfSupply`, `defaultGstRate`, and `companyGstin` if you want to prefill values in the UI.

## App behavior
- **Role gate**: Auth state is checked, then a Firestore user profile must be `active` and `role: 'admin'`. Others are redirected to `/login`.
- **Invoices & quotations**: Create GST or non-GST documents with document number, dates, customer selection, place of supply, HSN/SAC, discounts, additional charges, round-off, notes, and terms (Rule 46 friendly fields).
- **Customers**: Create GST-ready customer masters with addresses and GSTINs.
- **Storage uploads**: Upload purchase orders, creatives, and proofs to Firebase Storage and index metadata in Firestore.
- **Styling**: Red, yellow, and white palette with clean industrial cards—no gradients or icons using `.ico`.

## Production checklist
- Replace dev Firestore/Storage rules with least-privilege admin-only rules.
- Configure invoice numbering sequence in Firestore (e.g., `settings/sequences`).
- Set up CI to run `npm run lint` and `npm run build`.
- Host on Vercel with environment variables configured.
