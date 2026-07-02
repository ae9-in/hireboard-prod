import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
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
    if (!decoded || !['employer', 'admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized credentials. Recruiter or Admin access only.' }, { status: 401 });
    }

    const { status, note } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'Please specify the new pipeline status' }, { status: 400 });
    }

    // Retrieve application
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application record not found' }, { status: 404 });
    }

    // Verify ownership for recruiters
    if (decoded.role === 'employer') {
      const user = await User.findById(decoded.id).select('employerProfile').lean();
      if (!user || !user.employerProfile?.company) {
        return NextResponse.json({ error: 'Company details setup required' }, { status: 400 });
      }
      const companyId = user.employerProfile.company;
      if (application.company.toString() !== companyId.toString()) {
        return NextResponse.json({ error: 'Unauthorized access to candidate application' }, { status: 403 });
      }
    }

    // Validate status values
    const validStatuses = ['viewed', 'shortlisted', 'interview_scheduled', 'offer', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status pipeline target' }, { status: 400 });
    }

    // Update status and append to history log
    application.status = status;
    application.statusHistory.push({
      status: status,
      note: note || `Application status updated to ${status.replace('_', ' ')}.`,
      changedAt: new Date()
    });

    await application.save();

    return NextResponse.json({ success: true, application });

  } catch (error) {
    console.error('Update Application Status API Error:', error);
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
  }
}
