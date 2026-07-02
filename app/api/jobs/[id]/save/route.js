import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized credentials' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'seeker') {
      return NextResponse.json({ error: 'Unauthorized credentials. Seeker access only.' }, { status: 401 });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Toggle saved job reference in seekerProfile
    const isSaved = user.seekerProfile.savedJobs.some(
      (savedId) => savedId.toString() === id
    );

    if (isSaved) {
      user.seekerProfile.savedJobs.pull(id);
    } else {
      user.seekerProfile.savedJobs.addToSet(id);
    }

    await user.save();

    return NextResponse.json({ success: true, saved: !isSaved });

  } catch (error) {
    console.error('Job Save Toggle API Error:', error);
    return NextResponse.json({ error: 'Failed to bookmark job' }, { status: 500 });
  }
}
