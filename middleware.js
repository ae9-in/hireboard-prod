import { NextResponse } from 'next/server';

/**
 * Lightweight JWT payload decoder compatible with Next.js Edge Runtime.
 * Decodes base64url payload without external Node-native dependencies.
 */
function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode base64url string
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Validate expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify HMAC-SHA256 signature of the JWT token inside Next.js Edge runtime.
 */
async function verifyJwtSignature(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const [headerB64, payloadB64, signatureB64] = parts;
    
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(secret);
    
    const key = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = base64UrlDecode(signatureB64);
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    return await crypto.subtle.verify('HMAC', key, signature, data);
  } catch (err) {
    return false;
  }
}

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const buffer = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    buffer[i] = raw.charCodeAt(i);
  }
  return buffer;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Extract token cookie
  const token = request.cookies.get('token')?.value;
  
  // Verify token signature if present
  let user = null;
  let isTokenValid = false;
  if (token) {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-change-in-prod';
    isTokenValid = await verifyJwtSignature(token, JWT_SECRET);
    if (isTokenValid) {
      user = parseJwt(token);
    }
  }
  
  // Define route classifications
  const isSeekerRoute = pathname.startsWith('/dashboard');
  const isEmployerRoute = pathname.startsWith('/employer');
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // If token is present but signature is invalid, clear the cookie to prevent infinite redirect loops
  if (token && !isTokenValid) {
    if (isAuthRoute || pathname === '/admin/login') {
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }

    const loginUrl = pathname.startsWith('/admin')
      ? new URL('/admin/login', request.url)
      : new URL('/login', request.url);
    
    loginUrl.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }

  // 1. Guard Seeker Routes (/dashboard)
  if (isSeekerRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If not seeker or admin (e.g. employer), redirect to employer dashboard
    if (user.role === 'employer') {
      return NextResponse.redirect(new URL('/employer', request.url));
    }
  }

  // 2. Guard Employer Routes (/employer)
  if (isEmployerRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If seeker, redirect to seeker dashboard (admins are allowed)
    if (user.role === 'seeker') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Protect recruiter routes. If recruiter status != approved, log them out and redirect.
    if (user.role === 'employer' && user.status !== 'approved') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'awaiting_approval');
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      return response;
    }
  }

  // 3. Guard Admin Routes (/admin)
  if (isAdminRoute) {
    if (pathname === '/admin/login') {
      if (user && user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If not admin, redirect to respective seeker/employer page
    if (user.role !== 'admin') {
      const target = user.role === 'employer' ? '/employer' : '/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // 4. Guard Auth Routes (/login, /register)
  if (isAuthRoute && user) {
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (user.role === 'employer') {
      // If unapproved recruiter somehow logs in or has cookie, handle it
      if (user.status !== 'approved') {
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('token');
        return response;
      }
      return NextResponse.redirect(new URL('/employer', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/employer/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
