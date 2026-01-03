"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export function TopNav() {
  const { user, signOutUser } = useAuth();

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-[color:var(--brand-white)] px-6 py-3 shadow-sm">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brand-red)] text-lg font-black text-white shadow-lg">
          IM
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Imagicity</p>
          <p className="text-lg font-bold text-[color:var(--brand-red)]">Billing cockpit</p>
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-[color:var(--brand-yellow)] px-3 py-1 text-[11px] font-bold text-neutral-900">
          {user?.email}
        </div>
        <button
          onClick={() => signOutUser()}
          className="rounded-full border border-[color:var(--brand-red)] px-4 py-2 text-xs font-bold text-[color:var(--brand-red)] transition hover:bg-[color:var(--brand-yellow)]"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
