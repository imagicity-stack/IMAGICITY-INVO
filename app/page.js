'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { app, db } from '../lib/firebase';

async function authenticateAdmin(email, password) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Please enter both email and password.');
  }

  const auth = getAuth(app);

  try {
    const credential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    const user = credential.user;

    const profileRef = doc(db, 'users', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      throw new Error('No profile found for this account.');
    }

    const profile = { id: profileSnap.id, ...profileSnap.data() };

    if (profile.role !== 'admin') {
      await signOut(auth);
      throw new Error('You must be an admin to enter the dashboard.');
    }

    return profile;
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const code = error.code;
      if (code === 'auth/user-not-found') {
        throw new Error('No account found for that email.');
      }
      if (code === 'auth/wrong-password') {
        throw new Error('Password is incorrect.');
      }
      if (code === 'permission-denied') {
        throw new Error('Permission denied. Verify Firestore rules allow admins to read their profile.');
      }
    }

    throw new Error('Unable to sign in right now.');
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authenticateAdmin(email, password);
      setSuccess('Access granted! Redirecting to the dashboard...');
      setTimeout(() => router.push('/dashboard'), 600);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-slate-900/70 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 text-xl font-bold shadow-lg shadow-rose-400/30">
              IM
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-rose-200">INVO</p>
              <h1 className="text-lg font-semibold text-white">CRM for Imagicity</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-emerald-200 shadow-lg shadow-emerald-500/10 sm:flex">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            Secure admin access
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl space-y-6">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.5em] text-rose-200">
            INVO - CRM for imagicity
          </p>
          <div className="relative aspect-square min-h-[420px] overflow-hidden rounded-3xl border border-slate-900/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-2xl shadow-rose-500/20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.1),transparent_40%)]" aria-hidden />
            <div className="relative flex h-full flex-col justify-between">
              <div className="space-y-2 text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-rose-200">Admin Login</p>
                <h2 className="text-2xl font-semibold">Enter your credentials</h2>
                <p className="text-sm text-slate-300">Access is restricted to admins saved in your Firebase users collection.</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-slate-200">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white shadow-inner shadow-black/30 outline-none transition focus:border-rose-400"
                    placeholder="admin@imagicity.com"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-200">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white shadow-inner shadow-black/30 outline-none transition focus:border-rose-400"
                    placeholder="••••••••"
                    required
                  />
                </label>

                {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">{error}</p>}
                {success && <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-400/30 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Verifying admin access…' : 'Sign in and enter dashboard'}
                </button>
              </form>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Protected by Firebase Auth</span>
                <span className="text-rose-200">Role: admin required</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
