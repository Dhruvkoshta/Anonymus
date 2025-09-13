import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/jwt';

export const config = { matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'] };

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const user = token ? verifyAuthToken(token) : null;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') || pathname.startsWith('/verify') || pathname === '/';
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  return NextResponse.next();
}