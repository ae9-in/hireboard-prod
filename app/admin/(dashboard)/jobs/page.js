import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Job from '@/models/Job.model';
import JobsModerator from '@/components/admin/JobsModerator';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminJobsPage() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') redirect('/login');

  let pendingJobs = [];

  try {
    const queryResult = await Job.find({ status: 'pending_review' })
      .sort({ createdAt: 1 }) // Older first (SLA priority)
      .populate('company', 'name logo slug')
      .lean();

    // Serialize object IDs
    pendingJobs = queryResult.map(job => ({
      ...job,
      _id: job._id.toString(),
      company: job.company ? {
        ...job.company,
        _id: job.company._id.toString()
      } : null,
      postedBy: job.postedBy.toString(),
      createdAt: job.createdAt ? job.createdAt.toISOString() : null,
      updatedAt: job.updatedAt ? job.updatedAt.toISOString() : null,
    }));

  } catch (error) {
    console.error('Error loading admin pending review jobs:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
            Moderate Job Openings
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            Evaluate newly submitted positions before they go live on the public feed.
          </p>
        </div>
        <Link 
          href="/employer/post-job"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark shadow-sm transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Post Job (As Company)
        </Link>
      </div>

      {/* Render Table */}
      <JobsModerator initialJobs={pendingJobs} />

    </div>
  );
}
