import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job.model';
import Company from '@/models/Company.model';
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

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: 'Job opening not found' }, { status: 404 });
    }

    // Set active status and reviewer tags
    job.status = 'active';
    job.reviewedBy = decoded.id;
    job.reviewedAt = new Date();
    await job.save();

    // Increment active job count on the company record
    await Company.findByIdAndUpdate(job.company, { $inc: { activeJobCount: 1 } });

    return NextResponse.json({ success: true, message: 'Job opening approved and published' });

  } catch (error) {
    console.error('Admin Approve Job API Error:', error);
    return NextResponse.json({ error: 'Failed to approve job opening' }, { status: 500 });
  }
}
