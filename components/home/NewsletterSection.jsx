'use client';

import React, { useState } from 'react';
import { Send, BellRing } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Subscribed successfully! Welcome to the loop.' });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to subscribe. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-surface border-b border-border/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-br from-accent/5 via-canvas to-premium/5 border border-border p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Blur circles */}
          <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-premium/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-accent mb-4">
              <BellRing className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              Never Miss a Job Alert
            </h2>
            <p className="mt-2 text-sm text-ink-2">
              Subscribe to get curated lists of high-paying jobs in software, data, product, and design sent straight to your inbox.
            </p>
          </div>

          <div className="relative z-10 w-full max-w-md flex flex-col gap-2">
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-md border border-border bg-white px-4 py-3 text-sm text-ink shadow-sm placeholder:text-ink-3 focus:border-accent focus:ring-2 focus:ring-accent-glow outline-none transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-dark transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Subscribe
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            {status.message && (
              <p className={cn(
                "text-xs font-semibold mt-1",
                status.type === 'success' ? "text-success" : "text-danger"
              )}>
                {status.message}
              </p>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
