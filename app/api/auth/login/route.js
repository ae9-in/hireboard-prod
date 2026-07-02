import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
    }

    // Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
    }

    // Admins are not allowed to log in via normal login page
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Access Denied. Admins must login via /admin/login.' }, { status: 403 });
    }

    // Recruiter status checks
    if (user.role === 'employer') {
      if (user.status === 'pending') {
        return NextResponse.json({ error: 'Your account is awaiting administrator approval.' }, { status: 403 });
      }
      if (user.status === 'rejected') {
        return NextResponse.json({ error: 'Your account registration has been rejected.' }, { status: 403 });
      }
    }

    // Set last login time
    user.lastLogin = new Date();
    await user.save();

    const userResponse = user.toJSON();

    // Sign Token & Set Cookie — include status in JWT
    const token = signToken({ id: user._id.toString(), role: user.role, status: user.status });
    const response = NextResponse.json({ success: true, user: userResponse });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 });
  }
}
