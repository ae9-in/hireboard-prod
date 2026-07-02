import React from 'react';
import Link from 'next/link';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Application from '@/models/Application.model';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ClipboardCheck, Heart, UserCheck, ArrowRight, Calendar, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

// Ensure this page runs dynamically to fetch current user data
export const dynamic = 'force-dynamic';

export default async function SeekerDashboard() {
  await connectDB();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');
  
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'seeker') redirect('/login');

  let user = null;
  let applications = [];
  let savedJobsCount = 0;

  try {
    user = await User.findById(decoded.id).select('name email seekerProfile').lean();
    if (!user) redirect('/login');

    savedJobsCount = user.seekerProfile?.savedJobs?.length || 0;

    // Fetch applications populated with jobs and company details
    applications = await Application.find({ applicant: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        select: 'title slug salary workType location',
        populate: { path: 'company', select: 'name logo' }
      })
      .limit(5)
      .lean();

  } catch (error) {
    console.error('Error loading seeker dashboard:', error);
  }

  // Calculate profile completion percentage based on core profile fields filled
  let profileCompletion = 20; // 20% base for registration
  if (user?.seekerProfile) {
    const prof = user.seekerProfile;
    if (prof.headline) profileCompletion += 15;
    if (prof.resumeUrl) profileCompletion += 25;
    if (prof.skills && prof.skills.length > 0) profileCompletion += 15;
    if (prof.experience !== undefined) profileCompletion += 10;
    if (prof.location) profileCompletion += 10;
    if (prof.education && prof.education.length > 0) profileCompletion += 5;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink tracking-tight">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Here is what is happening with your job applications and saved openings today.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="border border-border rounded-lg p-5 bg-canvas/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider block">Applications Sent</span>
            <span className="text-2xl font-extrabold text-ink font-mono block">{applications.length}</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <ClipboardCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="border border-border rounded-lg p-5 bg-canvas/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider block">Saved Jobs</span>
            <span className="text-2xl font-extrabold text-ink font-mono block">{savedJobsCount}</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-danger-bg text-danger flex items-center justify-center shrink-0">
            <Heart className="h-5 w-5 fill-danger/10" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="border border-border rounded-lg p-5 bg-canvas/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider block">Profile Completed</span>
            <span className="text-2xl font-extrabold text-ink font-mono block">{profileCompletion}%</span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Recent Applications Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border/60">
          <h2 className="text-base font-bold text-ink">Recent Applications</h2>
          <Link 
            href="/dashboard/applications" 
            className="group inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
          >
            All applications
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-10 bg-canvas/20 rounded-lg border border-border/40 p-4">
            <p className="text-sm font-semibold text-ink-2">You haven't applied to any jobs yet.</p>
            <p className="text-xs text-ink-3 mt-1">Browse open listings and find your next role today.</p>
            <Link 
              href="/jobs" 
              className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-dark transition-all"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {applications.map((app) => {
              const job = app.job;
              const company = job?.company;
              if (!job) return null;
              
              const appliedDate = app.createdAt
                ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })
                : 'Recently';

              return (
                <div key={app._id.toString()} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-grey-100 border border-border text-ink-2 font-bold shrink-0">
                      {company?.name ? company.name.substring(0, 2).toUpperCase() : 'HW'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink hover:text-accent truncate">
                        <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                      </h3>
                      <p className="text-xs text-ink-3 flex items-center gap-1 mt-0.5 font-medium">
                        <Building className="h-3 w-3 shrink-0" />
                        {company?.name} · {job.location?.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-ink-2 font-mono font-bold">
                        {job.salary ? `₹${job.salary.min}–${job.salary.max} LPA` : ''}
                      </p>
                      <p className="text-[10px] text-ink-3 flex items-center gap-1 justify-end mt-0.5 font-medium">
                        <Calendar className="h-3 w-3" />
                        Applied {appliedDate}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className={cn(
                      "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold capitalize select-none",
                      app.status === 'applied' && "bg-accent-light text-accent",
                      app.status === 'viewed' && "bg-warning-bg text-warning",
                      app.status === 'shortlisted' && "bg-indigo-50 text-indigo-600 border border-indigo-100",
                      app.status === 'interview_scheduled' && "bg-premium-bg text-premium",
                      app.status === 'offer' && "bg-success-bg text-success",
                      app.status === 'rejected' && "bg-danger-bg text-danger",
                      app.status === 'withdrawn' && "bg-grey-100 text-grey-600"
                    )}>
                      {app.status === 'interview_scheduled' ? 'interview' : app.status}
                    </span>
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
