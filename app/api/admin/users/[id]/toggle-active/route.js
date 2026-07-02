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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized credentials. Admin access only.' }, { status: 401 });
    }

    const { isActive } = await request.json();
    if (isActive === undefined) {
      return NextResponse.json({ error: 'Please specify account activity state' }, { status: 400 });
    }

    // Admins cannot block other admins
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot block other admin accounts' }, { status: 403 });
    }

    targetUser.isActive = isActive;
    await targetUser.save();

    return NextResponse.json({ success: true, message: `User account has been ${isActive ? 'activated' : 'blocked'}` });

  } catch (error) {
    console.error('Admin Toggle User API Error:', error);
    return NextResponse.json({ error: 'Failed to toggle account activity' }, { status: 500 });
  }
}
