import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Please provide name, email and password' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const userRole = role === 'employer' ? 'employer' : 'seeker';

    // If recruiter, check for required fields
    if (userRole === 'employer') {
      const { companyName } = body;
      if (!companyName) {
        return NextResponse.json({ error: 'Company Name is required for Recruiter registration.' }, { status: 400 });
      }
    }

    // Create user
    const userData = {
      name,
      email,
      passwordHash,
      role: userRole,
      isVerified: false,
      isActive: true,
      status: userRole === 'seeker' ? 'approved' : 'pending',
      isApproved: userRole === 'seeker',
    };

    if (userRole === 'seeker') {
      userData.seekerProfile = {
        headline: '',
        skills: [],
        experience: 0,
        currentSalary: 0,
        expectedSalary: 0,
        noticePeriod: 'immediate',
        location: '',
        resumeUrl: ''
      };
    } else {
      const {
        companyName,
        companyWebsite = '',
        industry = '',
        designation = '',
        companyEmail = '',
        companySize = '',
        linkedin = '',
        gst = '',
        contactNumber = ''
      } = body;

      userData.employerProfile = {
        companyName,
        companyWebsite,
        industry,
        designation,
        companyEmail,
        companySize,
        linkedin,
        gst,
        contactNumber
      };
    }

    const user = await User.create(userData);
    const userResponse = user.toJSON();

    if (userRole === 'employer') {
      // Recruiter registration DOES NOT activate immediately. Return success message and do not log in.
      return NextResponse.json({
        success: true,
        message: 'Your registration has been submitted successfully. Your account is currently under review by the HireBoard Administration. You will receive an email once your account has been approved.'
      }, { status: 201 });
    }

    // Seeker registers, logs in instantly
    const token = signToken({ id: user._id.toString(), role: user.role, status: user.status });
    const response = NextResponse.json({ success: true, user: userResponse }, { status: 201 });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'Failed to register account' }, { status: 500 });
  }
}
