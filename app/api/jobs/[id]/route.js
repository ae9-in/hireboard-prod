import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Job from '@/models/Job.model';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized credentials' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !['employer', 'admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized credentials' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: 'Job opening not found' }, { status: 404 });
    }

    // Verify ownership for employers
    if (decoded.role === 'employer') {
      const user = await User.findById(decoded.id).select('employerProfile').lean();
      if (!user || user.employerProfile?.company?.toString() !== job.company.toString()) {
        return NextResponse.json({ error: 'Unauthorized company access' }, { status: 403 });
      }
    }

    // Update status
    if (status) {
      // Validate transition
      const allowedStatuses = ['active', 'paused', 'closed'];
      if (!allowedStatuses.includes(status) && decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
      }
      job.status = status;
    }

    await job.save();

    return NextResponse.json({ success: true, job });

  } catch (error) {
    console.error('Update Job PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
