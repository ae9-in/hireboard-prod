import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Company from '@/models/Company.model';
import CompanyProfileForm from '@/components/employer/CompanyProfileForm';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CompanyProfilePage() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'employer') redirect('/login');

  let companyObj = null;

  try {
    const user = await User.findById(decoded.id).select('employerProfile').lean();
    if (!user) redirect('/login');

    if (user.employerProfile?.company) {
      const companyRec = await Company.findById(user.employerProfile.company).lean();
      if (companyRec) {
        // Serialize object IDs
        companyObj = {
          ...companyRec,
          _id: companyRec._id.toString(),
          owner: companyRec.owner.toString(),
          createdAt: companyRec.createdAt ? companyRec.createdAt.toISOString() : null,
          updatedAt: companyRec.updatedAt ? companyRec.updatedAt.toISOString() : null,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching company profile:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
          Company Details
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Provide your startup or enterprise website, industry stack, employee count, and benefits to candidates.
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <CompanyProfileForm company={companyObj} />
      </div>
    </div>
  );
}
