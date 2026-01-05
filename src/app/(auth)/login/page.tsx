"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && role === "admin") {
      router.replace("/dashboard");
    }
  }, [user, role, loading, router]);

  const handleLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch {
      setError("Authentication failed. Confirm Firebase credentials and Firestore role.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-6 py-12">
      <div className="card-surface w-full max-w-xl rounded-3xl p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Imagicity</p>
        <h1 className="mt-2 text-3xl font-black text-[color:var(--brand-red)]">Industrial invoicing cockpit</h1>
        <p className="text-sm text-neutral-700">Secure access with Firebase email/password. Admin role is enforced through Firestore user docs.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700">Admin email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-[color:var(--brand-red)] focus:outline-none"
              placeholder="admin@imagicity.in"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-[color:var(--brand-red)] focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={busy}
            className="w-full rounded-2xl bg-[color:var(--brand-red)] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60"
          >
            {busy ? "Authenticating..." : "Enter workspace"}
          </button>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <div className="rounded-xl bg-[color:var(--card)] p-4 text-xs text-neutral-700">
            <p className="font-semibold text-neutral-900">Role gating</p>
            <p>Only users with role &quot;admin&quot; in Firestore (users/{"<uid>"}) can enter. There is no hardcoded UID.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
