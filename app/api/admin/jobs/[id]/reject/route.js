import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job.model';
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

    const { reason } = await request.json();
    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Please provide a reason for rejection' }, { status: 400 });
    }

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: 'Job opening not found' }, { status: 404 });
    }

    // Set rejected status and reviewer tags
    job.status = 'rejected';
    job.rejectionReason = reason;
    job.reviewedBy = decoded.id;
    job.reviewedAt = new Date();
    await job.save();

    return NextResponse.json({ success: true, message: 'Job opening rejected' });

  } catch (error) {
    console.error('Admin Reject Job API Error:', error);
    return NextResponse.json({ error: 'Failed to reject job opening' }, { status: 500 });
  }
}
