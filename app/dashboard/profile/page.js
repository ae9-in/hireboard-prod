import React from 'react';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import ProfileForm from '@/components/seeker/ProfileForm';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SeekerProfilePage() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'seeker') redirect('/login');

  let user = null;

  try {
    const userRec = await User.findById(decoded.id).select('name phone email seekerProfile').lean();
    if (!userRec) redirect('/login');
    
    // Serialize object id for component safety
    user = {
      ...userRec,
      _id: userRec._id.toString(),
    };
  } catch (error) {
    console.error('Error loading seeker profile page:', error);
    redirect('/login');
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Keep your candidate profile headline, resume, skills, and notice periods up to date to increase search matches.
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <ProfileForm initialUser={user} />
      </div>
    </div>
  );
}
