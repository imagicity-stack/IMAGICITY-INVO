"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAuth } from "@/components/layout/AuthProvider";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { user, role } = useAuth();
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-sm lg:px-8">
      <div className="flex items-center gap-2">
        <button className="lg:hidden rounded-lg p-2 hover:bg-brand-yellow/40" onClick={onMenu} aria-label="Toggle menu">
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>
        <div>
          <p className="text-xs uppercase text-gray-500">Imagicity</p>
          <p className="text-lg font-semibold text-gray-900">Invoicing</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{user?.email ?? "Admin"}</p>
          <p className="text-xs text-gray-500">Role: {role ?? "loading"}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-brand-red text-white flex items-center justify-center font-semibold uppercase">
          {(user?.email ?? "IM").substring(0, 2)}
        </div>
      </div>
    </header>
  );
}
