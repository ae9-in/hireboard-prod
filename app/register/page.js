'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, User, Mail, Lock, Loader2, AlertCircle, Building2, Globe, Sparkles, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import confetti from 'canvas-confetti';
import Logo from '@/components/layout/Logo';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState('seeker'); // 'seeker' | 'employer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Recruiter specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [designation, setDesignation] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companySize, setCompanySize] = useState('11-50');
  const [linkedin, setLinkedin] = useState('');
  const [gst, setGst] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (role === 'employer' && !companyName) {
      setError('Company Name is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        name,
        email,
        password,
        role,
        ...(role === 'employer' && {
          companyName,
          companyWebsite,
          industry,
          designation,
          companyEmail,
          companySize,
          linkedin,
          gst,
          contactNumber,
        })
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 }
        });

        if (role === 'employer') {
          setSuccessMessage(data.message || 'Your registration has been submitted successfully.');
        } else {
          // Seeker registers, redirect to seeker dashboard
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
        }
      } else {
        setError(data.error || 'Failed to register account.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-premium/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-6 bg-surface border border-border rounded-xl p-8 shadow-md relative z-10 text-center animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success border border-success/10">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-ink tracking-tight">
            Registration Submitted
          </h2>
          <p className="text-sm text-ink-2 leading-relaxed">
            {successMessage}
          </p>
          <div className="pt-4 border-t border-border/80">
            <Link 
              href="/login" 
              className="inline-flex w-full items-center justify-center rounded-lg bg-accent py-2.5 text-sm font-bold text-white hover:bg-accent-dark shadow-sm transition-all"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Blur decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-premium/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 bg-surface border border-border rounded-xl p-8 shadow-md relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Logo and header */}
        <div className="text-center space-y-4">
          <Logo iconClassName="h-9 w-9 text-accent" textClassName="text-lg font-extrabold tracking-tight text-ink" className="justify-center" />
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">
            Create your account
          </h2>
          <p className="text-xs text-ink-3">
            Register to search and apply, or post open roles.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-danger-bg border border-danger/10 p-3 flex items-start gap-2.5 text-xs font-semibold text-danger">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Role selector tabs */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Register As</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-canvas border border-border rounded-lg select-none">
              <button
                type="button"
                onClick={() => setRole('seeker')}
                className={cn(
                  "py-2 text-xs font-bold rounded-md transition-all text-center cursor-pointer",
                  role === 'seeker' ? "bg-white text-accent shadow-xs" : "text-ink-2 hover:text-accent"
                )}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={cn(
                  "py-2 text-xs font-bold rounded-md transition-all text-center cursor-pointer",
                  role === 'employer' ? "bg-white text-accent shadow-xs" : "text-ink-2 hover:text-accent"
                )}
              >
                Recruiter
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Full Name *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Email Address *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Password *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Must be at least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
              />
            </div>
          </div>

          {/* Recruiter-only Fields */}
          {role === 'employer' && (
            <div className="border-t border-border/80 pt-4 mt-4 space-y-4 animate-in fade-in duration-200">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider block">
                Company Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Company Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Company Website</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                      <Globe className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://acme.com"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Industry</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Fintech, SaaS"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Designation</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="HR Manager, Talent Acquisition"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Company Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="hr@acme.com"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Company Size</label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                  >
                    <option value="1-10">1–10 employees</option>
                    <option value="11-50">11–50 employees</option>
                    <option value="51-200">51–200 employees</option>
                    <option value="201-500">201–500 employees</option>
                    <option value="501-1000">501–1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">LinkedIn URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3 font-mono text-[10px]">
                      in
                    </span>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/company/..."
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">GST (Optional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="29AAAAA1111A1Z1"
                      value={gst}
                      onChange={(e) => setGst(e.target.value)}
                      className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-ink-3 uppercase tracking-wider">Recruiter Contact Number *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="+91 99999 99999"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full rounded-md border border-border pl-10 pr-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-accent py-2.5 text-sm font-bold text-white hover:bg-accent-dark shadow-sm transition-all disabled:opacity-50 mt-4 cursor-pointer"
          >
            {submitting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Register'}
          </button>

        </form>

        {/* Redirect */}
        <div className="text-center text-xs font-semibold text-ink-2 pt-2">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}
