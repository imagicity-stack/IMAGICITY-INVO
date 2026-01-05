"use client";

import { ReactNode } from "react";
import { Protected } from "@/components/auth/Protected";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogoutButton } from "@/components/auth/LogoutButton";

const links = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/documents", label: "Documents" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/items", label: "Items" },
  { href: "/app/settings", label: "Settings" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <section className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-600">IMAGICITY</p>
              <p className="text-lg font-semibold text-slate-800">Invoicing Console</p>
            </div>
            <div className="flex items-center gap-3">
              <NavLinks />
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">{children}</div>
        </main>
      </section>
    </Protected>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden gap-4 text-sm font-medium text-slate-700 sm:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            "rounded-md px-3 py-2",
            pathname?.startsWith(link.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
