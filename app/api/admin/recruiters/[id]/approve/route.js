import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
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

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'Recruiter account not found' }, { status: 404 });
    }

    if (targetUser.role !== 'employer') {
      return NextResponse.json({ error: 'User is not a recruiter' }, { status: 400 });
    }

    // Approve status
    targetUser.status = 'approved';
    targetUser.isApproved = true;
    targetUser.approvedBy = decoded.id;
    targetUser.approvedAt = new Date();
    targetUser.rejectionReason = null;

    // Check if Company needs to be created
    let companyId = targetUser.employerProfile?.company;
    if (!companyId && targetUser.employerProfile?.companyName) {
      const company = await Company.create({
        name: targetUser.employerProfile.companyName,
        website: targetUser.employerProfile.companyWebsite || '',
        industry: targetUser.employerProfile.industry || '',
        size: targetUser.employerProfile.companySize || '11-50',
        owner: targetUser._id,
        isVerified: true,
        headquarters: { city: '', state: '', country: 'India' }
      });
      companyId = company._id;
      targetUser.employerProfile.company = companyId;
    }

    await targetUser.save();

    // Log approval or mock sending email
    console.log(`Email sent: Recruiter ${targetUser.email} has been approved.`);

    return NextResponse.json({ success: true, message: 'Recruiter has been approved successfully.' });

  } catch (error) {
    console.error('Admin Recruiter Approve API Error:', error);
    return NextResponse.json({ error: 'Failed to approve recruiter' }, { status: 500 });
  }
}
