"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  DocumentDuplicateIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/components/layout/AuthProvider";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/solid";

const links = [
  { href: "/dashboard", label: "Overview", icon: Squares2X2Icon },
  { href: "/invoices", label: "Invoices", icon: CurrencyRupeeIcon },
  { href: "/quotes", label: "Quotations", icon: DocumentDuplicateIcon },
  { href: "/clients", label: "Clients", icon: ClipboardDocumentListIcon },
  { href: "/settings", label: "Settings", icon: ChartBarIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-brand-red text-white flex items-center justify-center font-bold">IM</div>
          <div>
            <p className="text-sm text-gray-500">Imagicity</p>
            <p className="text-lg font-semibold text-gray-900">Control Tower</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-brand-red text-white shadow" : "text-gray-700 hover:bg-brand-yellow/40"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={signOut} className="btn-secondary w-full justify-center">
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
