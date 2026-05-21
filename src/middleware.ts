import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = new Set(['/auth/login', '/auth/register']);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  const isPublic = [...PUBLIC_ROUTES].some((route) => pathname === route);
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/shipments') ||
    pathname.startsWith('/clients') ||
    pathname.startsWith('/drivers') ||
    pathname.startsWith('/trips');

  if (isPublic && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
