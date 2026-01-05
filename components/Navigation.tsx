"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "./ui/Button";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOutUser, user, role } = useAuth();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "#invoices", label: "Invoices" },
    { href: "#quotes", label: "Quotations" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-red-100/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-[var(--primary)] text-center text-xl font-black text-white shadow-lg shadow-red-200">
            I
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-red-600">Imagicity</p>
            <p className="text-sm font-semibold">Billing Control Center</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 transition ${
                pathname === link.href ? "bg-red-50 text-[var(--primary)]" : "text-gray-700 hover:text-[var(--primary)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Button
              variant="ghost"
              onClick={async () => {
                await signOutUser();
                router.push("/login");
              }}
            >
              Sign out ({role ?? "no role"})
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
