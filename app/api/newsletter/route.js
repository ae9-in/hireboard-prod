import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Newsletter from '@/models/Newsletter.model';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Please provide an email address' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email }).lean();
    if (existing) {
      if (!existing.isActive) {
        // Reactivate subscription
        await Newsletter.updateOne({ email }, { isActive: true });
        return NextResponse.json({ success: true, message: 'Subscription reactivated' });
      }
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 });
    }

    // Create subscription
    await Newsletter.create({ email, isActive: true });

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });

  } catch (error) {
    console.error('Newsletter API Error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
