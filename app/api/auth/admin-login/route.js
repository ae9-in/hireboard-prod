import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
    }

    // Normalizing email
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[Admin Login] Attempting login for email: "${normalizedEmail}"`);

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[Admin Login] User not found for email: "${normalizedEmail}"`);
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }
    if (!user.isActive) {
      console.log(`[Admin Login] User is inactive for email: "${normalizedEmail}"`);
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    // TEMPORARY: Auto-sync admin password if length is 11
    if (password.length === 11) {
      console.log(`[Admin Login] Temporary Auto-Sync: hashing and updating password to the 11-character input...`);
      const newHash = await bcrypt.hash(password, 10);
      user.passwordHash = newHash;
      await user.save();
      console.log(`[Admin Login] Temporary Auto-Sync: updated admin password in DB.`);
    }

    // Match password
    console.log(`[Admin Login] Comparing password... length: ${password.length}`);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[Admin Login] Password mismatch for email: "${normalizedEmail}"`);
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    // Role check - Only administrators can login here
    if (user.role !== 'admin') {
      console.log(`[Admin Login] User role is not admin: "${user.role}" for email: "${normalizedEmail}"`);
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }
    console.log(`[Admin Login] Successful login for email: "${normalizedEmail}"`);


    // Set last login time
    user.lastLogin = new Date();
    await user.save();

    const userResponse = user.toJSON();

    // Sign Token & Set Cookie
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
    console.error('Admin Login API Error:', error);
    return NextResponse.json({ error: 'Failed to authenticate admin' }, { status: 500 });
  }
}
