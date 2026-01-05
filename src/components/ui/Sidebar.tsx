"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightOnRectangleIcon, DocumentTextIcon, HomeIcon } from "@heroicons/react/24/outline";

interface Props {
  email: string;
  onLogout: () => Promise<void>;
}

const links = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/records", label: "Invoices & Quotes", icon: DocumentTextIcon }
];

export function Sidebar({ email, onLogout }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-surface-border shadow-card flex flex-col justify-between">
      <div>
        <div className="px-6 py-6 border-b border-surface-border">
          <div className="text-lg font-bold text-brand-red">Imagicity Invoicing</div>
          <p className="text-xs text-text-secondary mt-1">Marketing Operations Control</p>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition border border-transparent ${
                  active ? "bg-brand-yellow/40 text-brand-red border-brand-yellow" : "hover:bg-surface-muted"
                }`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-4 py-4 border-t border-surface-border">
        <p className="text-xs text-text-secondary mb-2">Signed in as</p>
        <p className="text-sm font-semibold text-text-primary">{email}</p>
        <button
          onClick={onLogout}
          className="mt-4 flex items-center gap-2 text-brand-red font-semibold text-sm"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
