"use client";

import { useAuth } from "@/components/layout/AuthProvider";
import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d" alt="Creative workspace" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red/70 via-brand-yellow/40 to-white" />
        <div className="absolute inset-0 flex items-end p-10 text-white">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide">Imagicity Marketing</p>
            <h1 className="text-4xl font-bold leading-tight">Red, yellow, white. Built for industrial-grade billing.</h1>
            <p className="max-w-lg text-white/80">
              GST-ready invoices, quotations, and storage-backed proofs with a strict draft → final → paid → void lifecycle.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red text-white font-bold">IM</div>
            <h2 className="text-2xl font-semibold text-gray-900">Admin console sign-in</h2>
            <p className="text-sm text-gray-600">Single admin account is provisioned in Firebase Auth.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? "Securing…" : "Sign in"}
            </button>
          </form>
          <div className="text-sm text-gray-500 text-center">
            Need access? Ensure your Firestore user document is set to <span className="font-semibold text-gray-800">role: admin</span>.
            <br />
            <Link className="text-brand-red font-semibold" href="/">Back to marketing site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
