"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Sidebar } from "@/components/ui/Sidebar";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      if (user && !profile) router.replace("/login");
    }
  }, [loading, profile, router, user]);

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-muted">
        <div className="card p-8 text-center">
          <p className="text-lg font-semibold text-text-primary">
            {loading ? "Securing your workspace..." : "You do not have access."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted text-text-primary">
      <Sidebar email={profile.email} onLogout={logout} />
      <main className="pl-72 py-10 px-8">{children}</main>
    </div>
  );
}
