import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User.model';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request) {
  try {
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
    const { name, phone, seekerProfile } = body;

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Update root level fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // Update seeker profile fields
    if (seekerProfile) {
      const fields = [
        'headline', 'summary', 'skills', 'experience', 
        'currentSalary', 'expectedSalary', 'noticePeriod', 
        'location', 'resumeUrl'
      ];
      
      if (!user.seekerProfile) {
        user.seekerProfile = {};
      }

      fields.forEach(field => {
        if (seekerProfile[field] !== undefined) {
          user.seekerProfile[field] = seekerProfile[field];
        }
      });
    }

    await user.save();

    const userResponse = user.toJSON();

    return NextResponse.json({ success: true, user: userResponse });

  } catch (error) {
    console.error('Update Seeker Profile API Error:', error);
    return NextResponse.json({ error: 'Failed to update profile settings' }, { status: 500 });
  }
}
