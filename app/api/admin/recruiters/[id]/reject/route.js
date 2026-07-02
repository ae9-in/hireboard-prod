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

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'Recruiter account not found' }, { status: 404 });
    }

    if (targetUser.role !== 'employer') {
      return NextResponse.json({ error: 'User is not a recruiter' }, { status: 400 });
    }

    const { rejectionReason } = await request.json();

    // Reject status
    targetUser.status = 'rejected';
    targetUser.isApproved = false;
    targetUser.rejectionReason = rejectionReason || 'Rejection reason not specified by administrator.';
    
    await targetUser.save();

    // Log rejection or mock sending email
    console.log(`Email sent: Recruiter ${targetUser.email} has been rejected. Reason: ${targetUser.rejectionReason}`);

    return NextResponse.json({ success: true, message: 'Recruiter has been rejected successfully.' });

  } catch (error) {
    console.error('Admin Recruiter Reject API Error:', error);
    return NextResponse.json({ error: 'Failed to reject recruiter' }, { status: 500 });
  }
}
