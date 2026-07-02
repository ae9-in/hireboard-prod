import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Job from '@/models/Job.model';
import JobsTable from '@/components/employer/JobsTable';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmployerJobsPage() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || !['employer', 'admin'].includes(decoded.role)) redirect('/login');

  let jobs = [];

  try {
    const isAdmin = decoded.role === 'admin';
    let query = {};

    if (!isAdmin) {
      const user = await User.findById(decoded.id).select('employerProfile').lean();
      if (!user || !user.employerProfile?.company) redirect('/employer/company-profile');
      query = { company: user.employerProfile.company };
    }

    const queryResult = await Job.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Serialize object IDs
    jobs = JSON.parse(JSON.stringify(queryResult));

  } catch (error) {
    console.error('Error loading employer jobs page:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
            Manage Openings
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            Activate, pause, or close your corporate job listings.
          </p>
        </div>
        <Link 
          href="/employer/post-job"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>

      {/* Render interactive table */}
      <JobsTable initialJobs={jobs} />

    </div>
  );
}
