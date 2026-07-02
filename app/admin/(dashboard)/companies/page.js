import React from 'react';
import connectDB from '@/lib/db';
import Company from '@/models/Company.model';
import CompaniesModerator from '@/components/admin/CompaniesModerator';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminCompaniesPage() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') redirect('/login');

  let companies = [];

  try {
    const queryResult = await Company.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Serialize object IDs
    companies = queryResult.map(c => ({
      ...c,
      _id: c._id.toString(),
      owner: c.owner.toString(),
      createdAt: c.createdAt ? c.createdAt.toISOString() : null,
      updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null,
    }));

  } catch (error) {
    console.error('Error loading admin companies page:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-2 border-b border-border/60">
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
          Verify Employer Brands
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Review company profiles and award the verified blue checkmark badge.
        </p>
      </div>

      {/* Table */}
      <CompaniesModerator initialCompanies={companies} />

    </div>
  );
}
