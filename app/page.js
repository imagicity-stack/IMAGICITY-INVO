'use client';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f6faff] via-white to-[#eef2ff] px-4 py-12 text-brandCharcoal">
      <div className="w-full max-w-xl space-y-5">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.35em] text-brandPrimary">INVO - CRM for imagicity</p>
        <div className="relative mx-auto aspect-square min-h-[440px] w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-xl shadow-brandPrimary/10 backdrop-blur">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.12),transparent_35%)]" aria-hidden />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brandPrimary text-lg font-bold text-white shadow-lg shadow-brandPrimary/30">
                IM
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brandPrimary">Admin Login</p>
                <h1 className="text-2xl font-bold text-brandCharcoal">Access your workspace</h1>
                <p className="text-sm text-gray-500">Sign in with your Firebase admin credentials</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-gray-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-brandCharcoal shadow-inner shadow-gray-100 outline-none transition focus:border-brandPrimary focus:ring-2 focus:ring-brandPrimary/15"
                  placeholder="admin@imagicity.com"
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-brandCharcoal shadow-inner shadow-gray-100 outline-none transition focus:border-brandPrimary focus:ring-2 focus:ring-brandPrimary/15"
                  placeholder="••••••••"
                  required
                />
              </label>

              {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>}
              {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brandPrimary via-brandSecondary to-brandAccent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brandPrimary/25 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brandPrimary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Verifying admin access…' : 'Sign in and enter dashboard'}
              </button>
            </form>

            <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-brandPrimary" aria-hidden />
                Admins only
              </span>
              <span>Firebase secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
