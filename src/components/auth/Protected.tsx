"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "./AuthProvider";

export function Protected({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !profile || profile.role !== "admin")) {
      router.push("/login");
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading secure area…</div>;
  }

  return <>{children}</>;
}
