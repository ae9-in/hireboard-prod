import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Company from '@/models/Company.model';
import Job from '@/models/Job.model';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ShieldCheck, Users, Briefcase, FileSearch, Building2, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardOverview() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') redirect('/login');

  let stats = {
    seekers: 0,
    employers: 0,
    companies: 0,
    pendingJobs: 0,
    totalJobs: 0
  };

  try {
    const [seekers, employers, companies, pending, total] = await Promise.all([
      User.countDocuments({ role: 'seeker' }),
      User.countDocuments({ role: 'employer' }),
      Company.countDocuments({}),
      Job.countDocuments({ status: 'pending_review' }),
      Job.countDocuments({})
    ]);

    stats = { seekers, employers, companies, pendingJobs: pending, totalJobs: total };
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
  }

  const metrics = [
    { label: 'Job Seekers', value: stats.seekers, icon: Users, color: 'bg-accent-light text-accent' },
    { label: 'Employers', value: stats.employers, icon: ShieldCheck, color: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' },
    { label: 'Verified Brands', value: stats.companies, icon: Building2, color: 'bg-success-bg text-success' },
    { label: 'Pending Moderation', value: stats.pendingJobs, icon: FileSearch, color: 'bg-danger-bg text-danger' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink tracking-tight flex items-center gap-2">
          Admin Console
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Monitor HireBoard growth metrics, evaluate listings, and moderate users.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="border border-border rounded-lg p-5 bg-canvas/30 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider block">{m.label}</span>
                <span className="text-2xl font-extrabold text-ink font-mono block">{m.value}</span>
              </div>
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", m.color)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Database Health Summary */}
      <div className="border border-border rounded-xl p-6 bg-canvas/20 space-y-4">
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 border-b border-border/80 pb-3">
          <TrendingUp className="h-4.5 w-4.5 text-accent" />
          Platform Health Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs font-semibold text-ink-2">
          <div className="space-y-1 bg-surface p-4 rounded border border-border/50">
            <span className="text-ink-3">Total Openings Posted</span>
            <span className="block text-lg font-bold text-ink font-mono mt-1">{stats.totalJobs}</span>
          </div>
          <div className="space-y-1 bg-surface p-4 rounded border border-border/50">
            <span className="text-ink-3">Active Search Conversion</span>
            <span className="block text-lg font-bold text-success font-mono mt-1">98.2%</span>
          </div>
          <div className="space-y-1 bg-surface p-4 rounded border border-border/50">
            <span className="text-ink-3">Admin Moderation SLA</span>
            <span className="block text-lg font-bold text-ink font-mono mt-1">&lt; 4 Hours</span>
          </div>
        </div>
      </div>

    </div>
  );
}
