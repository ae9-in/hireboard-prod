import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await User.findById(decoded.id).select('-passwordHash').lean();
    if (!user || !user.isActive) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const serializedUser = {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };

    return NextResponse.json({ user: serializedUser });

  } catch (error) {
    console.error('Auth-Me API Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve session details' }, { status: 500 });
  }
}
