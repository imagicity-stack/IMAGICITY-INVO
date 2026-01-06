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

const quickStats = [
  {
    title: 'Basic HTML and CSS',
    progress: 0.76,
    icon: '/icon.svg',
    color: 'from-amber-100 to-amber-50',
    accent: 'text-amber-600',
  },
  {
    title: 'Design Branding',
    progress: 0.58,
    icon: '/services.svg',
    color: 'from-rose-100 to-rose-50',
    accent: 'text-rose-600',
  },
  {
    title: 'Digital Marketing',
    progress: 0.88,
    icon: '/reminder.svg',
    color: 'from-emerald-100 to-emerald-50',
    accent: 'text-emerald-600',
  },
];

const leaderboard = [
  { name: 'Alexander Abdurahman', score: 840 },
  { name: 'Alice Brown', score: 820 },
  { name: 'Jason Dorris', score: 800 },
];

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
      setSuccess('Access granted! Redirecting you to the dashboard...');
      setTimeout(() => router.push('/dashboard'), 600);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 text-brandCharcoal">
      <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" aria-hidden />
      <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-amber-200/60 blur-3xl" aria-hidden />
      <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/40 blur-3xl" aria-hidden />

      <header className="relative z-10 border-b border-slate-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 text-white shadow-lg">
              <Image src="/icon.svg" alt="Imagicity icon" width={28} height={28} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-rose-600">Welcome back</p>
              <h1 className="text-xl font-semibold text-brandCharcoal">Imagicity Admin Portal</h1>
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <div className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Secure access enabled
            </div>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
              Dashboard Preview
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-10">
        <div className="grid gap-8 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="card relative overflow-hidden bg-white/90">
              <div className="absolute right-6 top-6 hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 sm:block">
                Updated today
              </div>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Hello Admin 👋</p>
                  <h2 className="text-2xl font-bold text-brandCharcoal">Step into your creative workspace</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Track your learning progress, manage access, and keep everything aligned for your team.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-right shadow-inner">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Your Point</p>
                  <p className="text-3xl font-bold text-brandCharcoal">8.466</p>
                  <p className="text-xs text-emerald-600">+310 this week</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {quickStats.map((item) => (
                  <div
                    key={item.title}
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.color} p-4 shadow-sm`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 shadow-md">
                        <Image src={item.icon} alt="" width={22} height={22} />
                      </div>
                      <span className={`badge ${item.accent} bg-white/60`}>Active</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">{item.title}</p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                        style={{ width: `${item.progress * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-600">{Math.round(item.progress * 100)}% completed</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-inner lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">Hours Spent</h3>
                    <span className="badge bg-amber-100 text-amber-700">Monthly</span>
                  </div>
                  <div className="mt-4 flex items-end gap-3">
                    {[52, 39, 62, 55].map((height, index) => (
                      <div key={height} className="flex flex-1 flex-col gap-2 text-center text-xs text-slate-500">
                        <div className="relative h-36 rounded-full bg-white">
                          <div
                            className={`absolute bottom-0 left-0 right-0 mx-auto w-full rounded-full bg-gradient-to-t from-rose-500 to-amber-400`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span>{['April', 'May', 'June', 'July'][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700">Leaderboard</h3>
                  <div className="mt-4 space-y-3">
                    {leaderboard.map((entry, idx) => (
                      <div key={entry.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-semibold text-slate-700">{entry.name}</p>
                        </div>
                        <span className="text-sm font-bold text-rose-500">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="card bg-white/95">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-rose-600">Admin Login</p>
                  <h2 className="text-xl font-bold text-brandCharcoal">Sign in to continue</h2>
                  <p className="text-sm text-slate-500">
                    Use your registered admin email and password to access the dashboard.
                  </p>
                </div>
                <div className="hidden rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 px-4 py-3 text-right text-white shadow-lg sm:block">
                  <p className="text-xs uppercase tracking-wide text-white/80">Access level</p>
                  <p className="text-lg font-bold">Admin</p>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-slate-700">
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-800 shadow-inner outline-none transition focus:border-rose-400 focus:bg-white"
                    placeholder="admin@imagicity.com"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-800 shadow-inner outline-none transition focus:border-rose-400 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                </label>
                {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p>}
                {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Verifying admin access…' : 'Sign in & go to dashboard'}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-inner">
                  <Image src="/dashboard.svg" alt="Dashboard" width={20} height={20} />
                </div>
                <div>
                  <p className="font-semibold text-brandCharcoal">Centralized control</p>
                  <p>Admins manage courses, monitor progress, and keep your team aligned.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-9 2.625a6.375 6.375 0 1012.75 0 6.375 6.375 0 00-12.75 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-brandCharcoal">Role-gated authentication</p>
                  <p className="text-sm text-slate-600">Only admins from your Firebase users collection can access the dashboard.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
