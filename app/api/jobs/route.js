import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Job from '@/models/Job.model';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
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

    let companyId;
    if (decoded.role === 'admin') {
      const { company } = body;
      if (!company) {
        return NextResponse.json({ error: 'Please specify the company to post on behalf of' }, { status: 400 });
      }
      companyId = company;
    } else {
      // Fetch user company profile
      const user = await User.findById(decoded.id).select('employerProfile').lean();
      if (!user || !user.employerProfile?.company) {
        return NextResponse.json({ error: 'Employer company profile setup is required first' }, { status: 400 });
      }
      companyId = user.employerProfile.company;
    }
    const { 
      title, 
      category, 
      subcategory, 
      workType, 
      jobType, 
      experience, 
      salary, 
      location, 
      description, 
      skills, 
      requirements, 
      responsibilities,
      applicationDeadline
    } = body;

    if (!title || !category || !workType || !jobType || !experience || !salary || !location || !description || !skills) {
      return NextResponse.json({ error: 'Please provide all mandatory fields' }, { status: 400 });
    }

    // Create job with company mapping and postedBy author details
    const job = await Job.create({
      title,
      company: companyId,
      postedBy: decoded.id,
      description,
      requirements,
      responsibilities,
      skills,
      category,
      subcategory,
      workType,
      jobType,
      experience,
      location,
      salary,
      applicationDeadline,
      status: 'pending_review', // Live only after admin moderation
      isFeatured: false,
      applicationCount: 0,
      viewCount: 0
    });

    return NextResponse.json({ success: true, job }, { status: 201 });

  } catch (error) {
    console.error('Create Job API Error:', error);
    return NextResponse.json({ error: 'Failed to create job opening' }, { status: 500 });
  }
}
