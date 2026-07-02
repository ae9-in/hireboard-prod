import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import JobCard from '@/components/jobs/JobCard';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SeekerSavedJobsPage() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'seeker') redirect('/login');

  let savedJobs = [];

  try {
    const user = await User.findById(decoded.id)
      .populate({
        path: 'seekerProfile.savedJobs',
        populate: { path: 'company', select: 'name logo slug isVerified industry' }
      })
      .lean();

    if (!user) redirect('/login');

    const rawList = user.seekerProfile?.savedJobs || [];

    // Serialize MongoDB objects for hydration safety
    savedJobs = rawList.map(job => ({
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
    console.error('Error loading saved jobs:', error);
  }

  // Pre-propulate saved list array so the heart components display active states
  const savedJobsIds = savedJobs.map(j => j._id);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
          Saved Job Openings
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Keep track of positions you have bookmarked. Salary and application details are stored here.
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="text-center py-16 bg-canvas/20 border border-border/60 rounded-lg p-6">
          <p className="text-sm font-semibold text-ink-2">No saved jobs yet.</p>
          <p className="text-xs text-ink-3 mt-1">
            Click the heart icon on job listings to bookmark them for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => (
            <JobCard 
              key={job._id} 
              job={job} 
              initialSaved={savedJobsIds.includes(job._id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
