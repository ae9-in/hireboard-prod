import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Application from '@/models/Application.model';
import Job from '@/models/Job.model';
import ApplicationReviewClient from '@/components/employer/ApplicationReviewClient';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ApplicationDetailPage({ params }) {
  const { id } = await params;
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || !['employer', 'admin'].includes(decoded.role)) redirect('/login');

  let appObj = null;

  try {
    const isAdmin = decoded.role === 'admin';
    let companyId = null;

    if (!isAdmin) {
      const user = await User.findById(decoded.id).select('employerProfile').lean();
      if (!user || !user.employerProfile?.company) redirect('/employer/company-profile');
      companyId = user.employerProfile.company;
    }

    const app = await Application.findById(id)
      .populate('job', 'title slug')
      .populate('applicant', 'name email seekerProfile phone')
      .lean();

    if (!app) {
      notFound();
    }

    // Verify ownership for recruiters
    if (!isAdmin && app.company.toString() !== companyId.toString()) {
      redirect('/employer/applications');
    }

    // Serialize MongoDB records
    appObj = JSON.parse(JSON.stringify(app));

  } catch (error) {
    console.error('Error fetching application detail:', error);
    notFound();
  }

  return (
    <div className="animate-in fade-in duration-200">
      <ApplicationReviewClient app={appObj} />
    </div>
  );
}
