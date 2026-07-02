import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear the JWT token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}
