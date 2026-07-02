import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Application from '@/models/Application.model';
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

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application record not found' }, { status: 404 });
    }

    // Verify ownership
    if (application.applicant.toString() !== decoded.id.toString()) {
      return NextResponse.json({ error: 'Unauthorized access to application' }, { status: 403 });
    }

    // If already withdrawn, return early
    if (application.status === 'withdrawn') {
      return NextResponse.json({ error: 'Application already withdrawn' }, { status: 400 });
    }

    // Update status to withdrawn
    application.status = 'withdrawn';
    application.isWithdrawn = true;
    application.withdrawnAt = new Date();
    application.statusHistory.push({
      status: 'withdrawn',
      note: 'Candidate withdrew application.',
      changedAt: new Date()
    });

    await application.save();

    return NextResponse.json({ success: true, application });

  } catch (error) {
    console.error('Withdraw Application API Error:', error);
    return NextResponse.json({ error: 'Failed to withdraw application' }, { status: 500 });
  }
}
