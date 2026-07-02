import React from 'react';
import connectDB from '@/lib/db';
import Application from '@/models/Application.model';
import ApplicationCard from '@/components/seeker/ApplicationCard';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SeekerApplicationsPage() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'seeker') redirect('/login');

  let applications = [];

  try {
    applications = await Application.find({ applicant: decoded.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        select: 'title slug salary workType location',
        populate: { path: 'company', select: 'name logo slug' }
      })
      .lean();

    // Serialize object IDs for client components
    applications = applications.map(app => ({
      ...app,
      _id: app._id.toString(),
      applicant: app.applicant.toString(),
      company: app.company.toString(),
      createdAt: app.createdAt ? app.createdAt.toISOString() : null,
      updatedAt: app.updatedAt ? app.updatedAt.toISOString() : null,
      withdrawnAt: app.withdrawnAt ? app.withdrawnAt.toISOString() : null,
      job: app.job ? {
        ...app.job,
        _id: app.job._id.toString(),
        company: app.job.company ? {
          ...app.job.company,
          _id: app.job.company._id.toString()
        } : null
      } : null,
      answers: app.answers ? app.answers.map(ans => ({
        ...ans,
        _id: ans._id ? ans._id.toString() : null
      })) : [],
      statusHistory: app.statusHistory ? app.statusHistory.map(h => ({
        ...h,
        _id: h._id ? h._id.toString() : null,
        changedAt: h.changedAt ? h.changedAt.toISOString() : null
      })) : []
    }));

  } catch (error) {
    console.error('Error fetching candidate applications:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
          My Applications
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Monitor your real-time application pipelines, status logs, and updates from employers.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-canvas/20 border border-border/60 rounded-lg p-6">
          <p className="text-sm font-semibold text-ink-2">No job applications submitted yet.</p>
          <p className="text-xs text-ink-3 mt-1">Your submitted job listings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app._id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
