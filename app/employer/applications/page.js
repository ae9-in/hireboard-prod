import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Job from '@/models/Job.model';
import Application from '@/models/Application.model';
import ApplicantsTable from '@/components/employer/ApplicantsTable';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EmployerApplicationsPage({ searchParams }) {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || !['employer', 'admin'].includes(decoded.role)) redirect('/login');

  let jobsList = [];
  let applications = [];

  try {
    const isAdmin = decoded.role === 'admin';
    let query = {};

    if (!isAdmin) {
      const user = await User.findById(decoded.id).select('employerProfile').lean();
      if (!user || !user.employerProfile?.company) redirect('/employer/company-profile');
      query = { company: user.employerProfile.company };
    }

    // 1. Fetch jobs for filters dropdown
    const jobs = await Job.find(query)
      .select('title')
      .sort({ title: 1 })
      .lean();
    
    jobsList = jobs.map(j => ({ _id: j._id.toString(), title: j.title }));

    // 2. Fetch all applications
    const apps = await Application.find(query)
      .sort({ createdAt: -1 })
      .populate('job', 'title')
      .populate('applicant', 'name email seekerProfile')
      .lean();

    // Serialize MongoDB records
    applications = JSON.parse(JSON.stringify(apps));

  } catch (error) {
    console.error('Error loading recruiter applications page:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
          Manage Applicants
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Review candidates, inspect resumes, and update application pipelines.
        </p>
      </div>

      {/* Render Table */}
      <ApplicantsTable initialApps={applications} jobsList={jobsList} />

    </div>
  );
}
