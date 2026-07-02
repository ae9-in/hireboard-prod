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
    appObj = {
      ...app,
      _id: app._id.toString(),
      company: app.company.toString(),
      createdAt: app.createdAt ? app.createdAt.toISOString() : null,
      updatedAt: app.updatedAt ? app.updatedAt.toISOString() : null,
      withdrawnAt: app.withdrawnAt ? app.withdrawnAt.toISOString() : null,
      job: app.job ? {
        ...app.job,
        _id: app.job._id.toString()
      } : null,
      applicant: app.applicant ? {
        ...app.applicant,
        _id: app.applicant._id.toString(),
        createdAt: app.applicant.createdAt ? app.applicant.createdAt.toISOString() : null,
        seekerProfile: app.applicant.seekerProfile ? {
          ...app.applicant.seekerProfile,
          experience_detail: app.applicant.seekerProfile.experience_detail ? app.applicant.seekerProfile.experience_detail.map(e => ({
            ...e,
            _id: e._id ? e._id.toString() : null,
            startDate: e.startDate ? e.startDate.toISOString() : null,
            endDate: e.endDate ? e.endDate.toISOString() : null,
          })) : []
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
    };

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
