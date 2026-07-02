import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
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

    const { isVerified } = await request.json();
    if (isVerified === undefined) {
      return NextResponse.json({ error: 'Please specify verification state' }, { status: 400 });
    }

    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json({ error: 'Company record not found' }, { status: 404 });
    }

    company.isVerified = isVerified;
    await company.save();

    return NextResponse.json({ success: true, message: `Company brand has been ${isVerified ? 'verified' : 'unverified'}` });

  } catch (error) {
    console.error('Admin Toggle Company Verify API Error:', error);
    return NextResponse.json({ error: 'Failed to toggle brand verification' }, { status: 500 });
  }
}
