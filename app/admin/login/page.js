'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import Logo from '@/components/layout/Logo';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 800);
      } else {
        setError(data.error || 'Access Denied');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-surface border border-border rounded-xl p-8 shadow-md relative z-10 animate-in zoom-in-95 duration-200">
      
      {/* Admin Logo & Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-danger-bg text-danger border border-danger/10">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-ink tracking-tight">
          Admin Console Login
        </h2>
        <p className="text-xs text-ink-3">
          Authorized personnel only. Access is monitored.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-bg border border-danger/10 p-3 flex items-start gap-2.5 text-xs font-semibold text-danger">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Admin Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              required
              placeholder="admin@hireboard.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center rounded-lg bg-grey-900 py-2.5 text-sm font-bold text-white hover:bg-black shadow-sm transition-all disabled:opacity-50 mt-2 cursor-pointer"
        >
          {submitting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Log In to Admin'}
        </button>

      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background blur decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-danger/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-grey-900/5 blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-md flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-ink-3" />
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
