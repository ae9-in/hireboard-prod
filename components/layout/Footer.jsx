'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Send } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { cn } from '@/utils/cn';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

export default function Footer() {
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
        setStatus({ type: 'success', message: 'Thank you for subscribing!' });
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
    <footer className="w-full bg-grey-900 border-t border-grey-800 text-grey-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Logo textColor="light" iconClassName="h-9 w-9 text-accent" textClassName="text-lg font-extrabold tracking-tight text-white" />
            <p className="text-sm text-grey-400 max-w-sm">
              India's transparent, spam-free job board. Full salary visibility, moderated postings, and direct applications. We match top talent with elite firms.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-grey-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-grey-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-grey-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <LinkedinIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-grey-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <GithubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">For Candidates</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/jobs" className="text-sm hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/dashboard" className="text-sm hover:text-white transition-colors">Seeker Dashboard</Link></li>
                <li><Link href="/dashboard/applications" className="text-sm hover:text-white transition-colors">My Applications</Link></li>
                <li><Link href="/dashboard/saved-jobs" className="text-sm hover:text-white transition-colors">Saved Jobs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">For Employers</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/for-employers" className="text-sm hover:text-white transition-colors">Employer Overview</Link></li>
                <li><Link href="/employer/post-job" className="text-sm hover:text-white transition-colors">Post an Opening</Link></li>
                <li><Link href="/employer" className="text-sm hover:text-white transition-colors">Employer Portal</Link></li>
                <li><Link href="/companies" className="text-sm hover:text-white transition-colors">Company Directory</Link></li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Stay Updated</h3>
              <p className="mt-4 text-sm text-grey-400">
                Get the latest jobs and career insights sent straight to your inbox weekly.
              </p>
              <form onSubmit={handleSubscribe} className="mt-4 flex max-w-md gap-2">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  type="email"
                  id="newsletter-email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-w-0 rounded-md border-0 bg-white/5 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-white/10 placeholder:text-grey-500 focus:ring-2 focus:ring-accent focus:bg-white/10 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md bg-accent p-2 text-white shadow-sm hover:bg-accent-dark transition-all disabled:opacity-50"
                >
                  {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
              {status.message && (
                <p className={cn(
                  "mt-2 text-xs font-semibold",
                  status.type === 'success' ? "text-success" : "text-danger"
                )}>
                  {status.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Banner */}
        <div className="mt-12 border-t border-grey-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-grey-500">
            &copy; {new Date().getFullYear()} HireBoard. Designed for visual excellence & Google indexability. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-grey-500">
            <Link href="#" className="hover:text-grey-400">Privacy Policy</Link>
            <Link href="#" className="hover:text-grey-400">Terms of Service</Link>
            <Link href="#" className="hover:text-grey-400">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
