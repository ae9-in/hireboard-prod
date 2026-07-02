import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import RecruitersModerator from '@/components/admin/RecruitersModerator';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminRecruitersPage() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/admin/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') redirect('/admin/login');

  let recruiters = [];

  try {
    const queryResult = await User.find({ role: 'employer' })
      .sort({ createdAt: -1 })
      .select('name email role status isApproved rejectionReason employerProfile createdAt')
      .lean();

    // Serialize object IDs and dates
    recruiters = queryResult.map(r => ({
      ...r,
      _id: r._id.toString(),
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
      employerProfile: r.employerProfile ? {
        ...r.employerProfile,
        company: r.employerProfile.company ? r.employerProfile.company.toString() : null
      } : null
    }));

  } catch (error) {
    console.error('Error loading admin recruiters page:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-2 border-b border-border/60">
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
          Recruiter Request Management
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Review, approve, or reject registrations from corporate hiring managers.
        </p>
      </div>

      {/* Recruiter requests table */}
      <RecruitersModerator initialRecruiters={recruiters} />

    </div>
  );
}
