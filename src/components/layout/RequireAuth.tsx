"use client";

import { useAuth } from "@/components/layout/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, role, loading, router, pathname]);

  if (loading || !user || role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse rounded-2xl bg-brand-red/10 px-6 py-4 text-brand-red">Securing console…</div>
      </div>
    );
  }

  return <>{children}</>;
}
