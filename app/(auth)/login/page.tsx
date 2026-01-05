"use client";

import { FormEvent, useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { signIn, user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!loading && user && role === "admin") {
    redirect("/");
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await signIn(email, password);
    } catch {
      setError("Login failed. Confirm Firebase admin user and password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-yellow-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white/90 p-8 shadow-2xl shadow-red-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[var(--primary)]">Imagicity Billing Login</h1>
          <p className="text-sm text-gray-600">Restricted admin access via Firebase Email/Password.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-red-100 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-red-100 px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        <p className="mt-4 text-xs text-gray-500">
          Tip: Create the admin user in Firebase Auth and attach a Firestore user doc with role value set to admin.
        </p>
      </div>
    </div>
  );
}
