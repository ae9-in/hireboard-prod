import React from 'react';
import Link from 'next/link';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Job from '@/models/Job.model';
import Application from '@/models/Application.model';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FileEdit, Users, FilePlus, ClipboardCheck, ArrowRight, Calendar, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

export const dynamic = 'force-dynamic';

export default async function EmployerDashboard() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || !['employer', 'admin'].includes(decoded.role)) redirect('/login');

  let user = null;
  let activeJobsCount = 0;
  let totalJobsCount = 0;
  let totalAppsCount = 0;
  let shortlistedCount = 0;
  let recentApplications = [];

  try {
    user = await User.findById(decoded.id).select('name email employerProfile').lean();
    if (!user) redirect('/login');

    const isAdmin = decoded.role === 'admin';

    // Force company profile setup first (recruiters only)
    if (!isAdmin && !user.employerProfile?.company) {
      redirect('/employer/company-profile');
    }

    const companyId = !isAdmin ? user.employerProfile.company : null;
    const query = !isAdmin ? { company: companyId } : {};

    // Fetch counts in parallel
    const [activeJobs, totalJobs, totalApps, shortlisted] = await Promise.all([
      Job.countDocuments({ ...query, status: 'active' }),
      Job.countDocuments(query),
      Application.countDocuments(query),
      Application.countDocuments({ ...query, status: { $in: ['shortlisted', 'interview_scheduled'] } })
    ]);

    activeJobsCount = activeJobs;
    totalJobsCount = totalJobs;
    totalAppsCount = totalApps;
    shortlistedCount = shortlisted;

    // Fetch recent applications
    const apps = await Application.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('job', 'title slug')
      .populate('applicant', 'name email seekerProfile')
      .lean();

    recentApplications = apps.map(app => ({
      ...app,
      _id: app._id.toString(),
      createdAt: app.createdAt ? app.createdAt.toISOString() : null,
      job: app.job ? {
        ...app.job,
        _id: app.job._id.toString()
      } : null,
      applicant: app.applicant ? {
        ...app.applicant,
        _id: app.applicant._id.toString()
      } : null
    }));

  } catch (error) {
    console.error('Error fetching recruiter dashboard:', error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header and Quick action CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink tracking-tight">
            Recruiter Workspace
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            Manage your corporate listings and evaluate applicants.
          </p>
        </div>
        <Link 
          href="/employer/post-job"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark shadow-sm transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Create New Opening
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="border border-border rounded-lg p-5 bg-canvas/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider block">Active Openings</span>
            <span className="text-2xl font-extrabold text-ink font-mono block">
              {activeJobsCount} <span className="text-xs font-normal text-ink-3">/ {totalJobsCount} total</span>
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <FilePlus className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="border border-border rounded-lg p-5 bg-canvas/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider block">Total Applications</span>
            <span className="text-2xl font-extrabold text-ink font-mono block">{totalAppsCount}</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="border border-border rounded-lg p-5 bg-canvas/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider block">Shortlisted Candidates</span>
            <span className="text-2xl font-extrabold text-ink font-mono block">{shortlistedCount}</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0">
            <ClipboardCheck className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border/60">
          <h2 className="text-base font-bold text-ink">Recent Candidates</h2>
          <Link 
            href="/employer/applications" 
            className="group inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
          >
            Review all applications
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="text-center py-10 bg-canvas/20 border border-border/40 rounded-lg p-4">
            <p className="text-sm font-semibold text-ink-2">No applications received yet.</p>
            <p className="text-xs text-ink-3 mt-1">Newly submitted resumes from seekers will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {recentApplications.map((app) => {
              const job = app.job;
              const applicant = app.applicant;
              if (!job || !applicant) return null;
              
              const appliedDate = app.createdAt
                ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })
                : 'Recently';

              return (
                <div key={app._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent font-bold shrink-0">
                      {applicant.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink hover:text-accent truncate">
                        <Link href={`/employer/applications/${app._id}`}>{applicant.name}</Link>
                      </h3>
                      <p className="text-xs text-ink-3 flex items-center gap-1 mt-0.5 font-medium">
                        Applied to <span className="font-semibold text-ink-2">{job.title}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-ink-2 font-mono">
                        {applicant.seekerProfile?.experience || 0} years YOE
                      </p>
                      <p className="text-[10px] text-ink-3 flex items-center gap-1 justify-end mt-0.5 font-medium">
                        <Calendar className="h-3 w-3" />
                        Submitted {appliedDate}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className={cn(
                      "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold capitalize border",
                      app.status === 'applied' && "bg-accent-light text-accent border-accent/10",
                      app.status === 'viewed' && "bg-warning-bg text-warning border-warning/10",
                      app.status === 'shortlisted' && "bg-indigo-50 text-indigo-600 border-indigo-100",
                      app.status === 'interview_scheduled' && "bg-premium-bg text-premium border-premium/10",
                      app.status === 'offer' && "bg-success-bg text-success border-success/10",
                      app.status === 'rejected' && "bg-danger-bg text-danger border-danger/10",
                      app.status === 'withdrawn' && "bg-grey-50 text-grey-500 border-border"
                    )}>
                      {app.status === 'interview_scheduled' ? 'interview' : app.status}
                    </span>

                    <Link 
                      href={`/employer/applications/${app._id}`}
                      className="inline-flex items-center justify-center rounded border border-border p-1.5 hover:bg-grey-50 text-ink-2"
                      title="Review Candidate"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
