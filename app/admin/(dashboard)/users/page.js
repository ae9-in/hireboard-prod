import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import UsersModerator from '@/components/admin/UsersModerator';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') redirect('/login');

  let users = [];

  try {
    const queryResult = await User.find({})
      .sort({ createdAt: -1 })
      .select('name email role isActive createdAt')
      .lean();

    // Serialize object IDs
    users = queryResult.map(u => ({
      ...u,
      _id: u._id.toString(),
      createdAt: u.createdAt ? u.createdAt.toISOString() : null,
    }));

  } catch (error) {
    console.error('Error loading admin users page:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-2 border-b border-border/60">
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
          User Account Management
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Review, activate, or suspend candidate and employer accounts.
        </p>
      </div>

      {/* Table */}
      <UsersModerator initialUsers={users} />

    </div>
  );
}
