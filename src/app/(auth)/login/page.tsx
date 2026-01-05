"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { user, signIn, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please use the registered admin account.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted">
      <div className="card max-w-xl w-full p-10 space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">Imagicity Marketing Agency</p>
          <h1 className="text-3xl font-bold text-text-primary">Secure Invoicing Workspace</h1>
          <p className="text-text-secondary text-sm">
            Sign in with the admin email configured in Firebase Authentication. Access is role-gated via Firestore.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-surface-border bg-surface-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Password</label>
              <input
                className="mt-1 w-full rounded-xl border border-surface-border bg-surface-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <motion.p
              className="text-sm text-brand-red"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-red text-white font-semibold hover:bg-opacity-90 transition focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-white"
          >
            {loading ? "Authorizing..." : "Sign in as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
