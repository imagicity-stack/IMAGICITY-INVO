# IMAGICITY OS

Internal CRM + ERP for IMAGICITY built with Next.js App Router, TypeScript, Tailwind, RHF + Zod, TanStack Table, Zustand, and a swappable repository layer.

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Run dev server
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

## Data storage
- Local persistent mode uses `localStorage` via a repository-style hook in `src/data/repos/local/store.ts` with seed data on first load.
- Data shape is defined in `src/domain/types` and validated via `src/domain/schemas`.

## Switching to Firestore (later)
- Implement Firestore repositories under `src/data/repos/firestore_placeholder` following interfaces in `src/data/repos/interfaces` (to be expanded).
- Swap the provider hook to use Firestore implementations while keeping domain and UI untouched.

## Future Auth Plan
- Add Firebase Auth with roles: Admin, Sales, Accounts, PM, Viewer.
- Introduce workspace collections to support multi-tenant mode.
- Guard server actions/routes based on role metadata.

## Constraints
- SVG-only branding in `/public/svg`.
- No auth in current build; Dev Mode banner indicates “No Auth Mode”.
