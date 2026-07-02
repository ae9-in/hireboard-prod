import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import Job from '@/models/Job.model';
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

    const body = await request.json();
    const { resumeUrl, coverLetter, answers, source } = body;

    if (!resumeUrl) {
      return NextResponse.json({ error: 'Please provide a resume attachment' }, { status: 400 });
    }

    // Retrieve job
    const job = await Job.findById(id);
    if (!job || job.status !== 'active') {
      return NextResponse.json({ error: 'Job opening is no longer active or found' }, { status: 404 });
    }

    // Check for duplicate application
    const existingApp = await Application.findOne({
      job: id,
      applicant: decoded.id
    }).lean();

    if (existingApp) {
      return NextResponse.json({ error: 'You have already applied to this position' }, { status: 409 });
    }

    // Create Application
    const application = await Application.create({
      job: id,
      applicant: decoded.id,
      company: job.company,
      resumeUrl,
      coverLetter,
      answers,
      status: 'applied',
      statusHistory: [
        { status: 'applied', note: 'Candidate submitted profile & resume.' }
      ],
      source: source || 'direct'
    });

    // Update job application counter
    job.applicationCount = (job.applicationCount || 0) + 1;
    await job.save();

    // Update seeker profile resume snapshot
    await User.findByIdAndUpdate(decoded.id, {
      'seekerProfile.resumeUrl': resumeUrl
    });

    return NextResponse.json({ success: true, application }, { status: 201 });

  } catch (error) {
    console.error('Job Apply API Error:', error);
    return NextResponse.json({ error: 'Failed to submit job application' }, { status: 500 });
  }
}
